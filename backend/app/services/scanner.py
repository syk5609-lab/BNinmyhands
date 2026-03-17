import math
from datetime import datetime, timezone

import pandas as pd
from sqlalchemy import desc, select

from app.db.models import SignalRun, SignalSnapshot
from app.db.session import SessionLocal
from app.schemas import ScanResponse, SymbolScanResult
from app.services.binance_client import (
    fetch_futures_tickers_24h,
    fetch_global_longshort_accounts,
    fetch_open_interest_hist,
    fetch_taker_longshort_ratio,
    get_tradable_usdt_perpetual_symbols,
)

_TIMEFRAME_CONFIG = {
    "1h": {
        "oi_period": "5m",
        "oi_limit": 12,
        "taker_period": "5m",
        "taker_limit": 12,
        "ls_period": "5m",
        "ls_limit": 12,
    },
    "4h": {
        "oi_period": "15m",
        "oi_limit": 16,
        "taker_period": "15m",
        "taker_limit": 16,
        "ls_period": "15m",
        "ls_limit": 16,
    },
    "24h": {
        "oi_period": "1h",
        "oi_limit": 24,
        "taker_period": "1h",
        "taker_limit": 24,
        "ls_period": "1h",
        "ls_limit": 24,
    },
}

_TIMEFRAME_SCORE_WEIGHTS = {
    "1h": {"momentum": 0.35, "positioning": 0.28, "early": 0.37},
    "4h": {"momentum": 0.36, "positioning": 0.30, "early": 0.34},
    "24h": {"momentum": 0.40, "positioning": 0.33, "early": 0.27},
}


def _to_numeric_series(df: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_numeric(df[column], errors="coerce")


def _cross_rank_score(series: pd.Series) -> pd.Series:
    if series.empty:
        return pd.Series(dtype=float)
    ranked = series.rank(method="average", pct=True)
    centered = (ranked - 0.5) * 2.0
    return centered.fillna(0.0).clip(-1.0, 1.0)


def _compute_oi_change_percent(symbol: str, period: str, limit: int) -> float | None:
    oi_raw = fetch_open_interest_hist(symbol=symbol, period=period, limit=limit)
    oi_df = pd.DataFrame(oi_raw)
    if oi_df.empty or "sumOpenInterest" not in oi_df.columns:
        return None

    oi_values = _to_numeric_series(oi_df, "sumOpenInterest").dropna()
    if len(oi_values) < 2:
        return None

    first, last = float(oi_values.iloc[0]), float(oi_values.iloc[-1])
    if first == 0:
        return None

    return ((last - first) / first) * 100.0


def _compute_taker_net_flow(symbol: str, period: str, limit: int) -> float | None:
    taker_raw = fetch_taker_longshort_ratio(symbol=symbol, period=period, limit=limit)
    taker_df = pd.DataFrame(taker_raw)
    if taker_df.empty or "buyVol" not in taker_df.columns or "sellVol" not in taker_df.columns:
        return None

    buy = _to_numeric_series(taker_df, "buyVol").dropna()
    sell = _to_numeric_series(taker_df, "sellVol").dropna()
    if buy.empty or sell.empty:
        return None

    return float(buy.sum() - sell.sum())


def _compute_long_short_ratio(symbol: str, period: str, limit: int) -> float | None:
    ls_raw = fetch_global_longshort_accounts(symbol=symbol, period=period, limit=limit)
    ls_df = pd.DataFrame(ls_raw)
    if ls_df.empty or "longShortRatio" not in ls_df.columns:
        return None

    ratios = _to_numeric_series(ls_df, "longShortRatio").dropna()
    if ratios.empty:
        return None

    return float(ratios.iloc[-1])


def _load_previous_run_symbol_metrics(timeframe: str) -> dict[str, dict[str, float | int]]:
    try:
        with SessionLocal() as db:
            run = db.scalar(
                select(SignalRun)
                .where(SignalRun.timeframe == timeframe, SignalRun.status == "completed")
                .order_by(desc(SignalRun.started_at))
                .limit(1)
            )
            if not run:
                return {}
            snapshots = list(
                db.scalars(
                    select(SignalSnapshot)
                    .where(SignalSnapshot.signal_run_id == run.id)
                    .order_by(desc(SignalSnapshot.composite_score))
                ).all()
            )
    except Exception:
        return {}

    metrics: dict[str, dict[str, float | int]] = {}
    for idx, snapshot in enumerate(snapshots, start=1):
        metrics[snapshot.symbol] = {
            "previous_rank": idx,
            "previous_composite_score": float(snapshot.composite_score),
            "previous_setup_score": float(snapshot.setup_score),
            "previous_positioning_score": float(snapshot.positioning_score),
        }
    return metrics


def _assign_signal_bucket_and_tags(
    composite_score: float,
    setup_score: float,
    positioning_score: float,
    momentum_score: float,
    risk_penalty: float,
    oi_change: float | None,
    flow: float | None,
    ls_ratio: float | None,
    price_change_24h: float,
) -> tuple[str, list[str]]:
    tags: list[str] = []
    oi_pos = (oi_change or 0.0) > 0
    flow_pos = (flow or 0.0) > 0
    ls_skew = ls_ratio is not None and (ls_ratio > 1.1 or ls_ratio < 0.9)

    if composite_score >= 1.2 and setup_score >= 0.8 and oi_pos and flow_pos:
        bucket = "breakout_watch"
        tags.extend(["high_composite", "setup_expansion", "oi_up", "taker_buying"])
    elif positioning_score >= 0.9 and setup_score >= 0.7 and abs(price_change_24h) <= 3.0:
        bucket = "positioning_build"
        tags.extend(["positioning_building", "price_not_expanded"])
    elif ls_skew and setup_score >= 0.5 and (flow_pos or abs(positioning_score) >= 0.8):
        bucket = "squeeze_watch"
        tags.extend(["ls_skew", "squeeze_potential"])
    else:
        bucket = "overheat_risk"
        tags.extend(["momentum_without_full_confirmation"])

    if risk_penalty <= -0.8:
        bucket = "overheat_risk"
        tags.append("risk_penalty_high")

    if momentum_score >= 1.2:
        tags.append("momentum_strong")
    if positioning_score >= 0.8:
        tags.append("positioning_support")

    return bucket, sorted(set(tags))


def _calc_data_quality_score(missing_count: int, quote_volume_24h: float, volume_threshold: float) -> float:
    base = 1.0 - (0.2 * missing_count)
    volume_factor = min(1.0, quote_volume_24h / max(volume_threshold * 2.0, 1.0))
    score = (0.7 * base) + (0.3 * volume_factor)
    return float(max(0.0, min(1.0, score)))


def build_scan(limit: int = 50, volume_percentile: float = 0.7, timeframe: str = "1h") -> ScanResponse:
    raw_tickers = fetch_futures_tickers_24h()
    df = pd.DataFrame(raw_tickers)

    required_cols = {"symbol", "lastPrice", "priceChangePercent", "quoteVolume"}
    if df.empty or not required_cols.issubset(df.columns):
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    allowed_symbols = get_tradable_usdt_perpetual_symbols()
    if not allowed_symbols:
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    df = df[df["symbol"].astype(str).isin(allowed_symbols)].copy()
    if df.empty:
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    df["last_price"] = _to_numeric_series(df, "lastPrice")
    df["price_change_percent_24h"] = _to_numeric_series(df, "priceChangePercent")
    df["quote_volume_24h"] = _to_numeric_series(df, "quoteVolume")

    df = df.dropna(subset=["symbol", "last_price", "price_change_percent_24h", "quote_volume_24h"])
    if df.empty:
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    volume_threshold = float(df["quote_volume_24h"].quantile(volume_percentile))
    filtered = df[df["quote_volume_24h"] >= volume_threshold].copy()
    if filtered.empty:
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    filtered = filtered.sort_values(by="quote_volume_24h", ascending=False).head(200).copy()

    tf = timeframe if timeframe in _TIMEFRAME_CONFIG else "1h"
    cfg = _TIMEFRAME_CONFIG[tf]
    w = _TIMEFRAME_SCORE_WEIGHTS[tf]

    previous_metrics = _load_previous_run_symbol_metrics(tf)

    enriched_rows: list[dict] = []
    for _, row in filtered.iterrows():
        symbol = str(row["symbol"])
        last_price = float(row["last_price"])
        price_change_percent_24h = float(row["price_change_percent_24h"])
        quote_volume_24h = float(row["quote_volume_24h"])

        oi_change_percent_recent = _compute_oi_change_percent(symbol, cfg["oi_period"], cfg["oi_limit"])
        taker_net_flow_recent = _compute_taker_net_flow(symbol, cfg["taker_period"], cfg["taker_limit"])
        long_short_ratio_recent = _compute_long_short_ratio(symbol, cfg["ls_period"], cfg["ls_limit"])

        raw_base = price_change_percent_24h * (math.log10(quote_volume_24h) if quote_volume_24h > 0 else 0.0)
        oi_raw = oi_change_percent_recent if oi_change_percent_recent is not None else 0.0
        flow_norm_raw = (taker_net_flow_recent / quote_volume_24h) if (taker_net_flow_recent is not None and quote_volume_24h > 0) else 0.0
        ls_dev_raw = (long_short_ratio_recent - 1.0) if long_short_ratio_recent is not None else 0.0
        price_oi_rel_raw = (1.0 if price_change_percent_24h >= 0 else -1.0) * oi_raw
        price_flow_rel_raw = (1.0 if price_change_percent_24h >= 0 else -1.0) * flow_norm_raw
        flat_price_participation_raw = max(0.0, 2.0 - abs(price_change_percent_24h)) * max(0.0, oi_raw / 20.0 + flow_norm_raw * 10.0)

        missing_count = int(oi_change_percent_recent is None) + int(taker_net_flow_recent is None) + int(long_short_ratio_recent is None)

        enriched_rows.append(
            {
                "symbol": symbol,
                "last_price": last_price,
                "price_change_percent_24h": price_change_percent_24h,
                "quote_volume_24h": quote_volume_24h,
                "oi_change_percent_recent": oi_change_percent_recent,
                "taker_net_flow_recent": taker_net_flow_recent,
                "long_short_ratio_recent": long_short_ratio_recent,
                "raw_base": raw_base,
                "oi_raw": oi_raw,
                "flow_norm_raw": flow_norm_raw,
                "ls_dev_raw": ls_dev_raw,
                "price_oi_rel_raw": price_oi_rel_raw,
                "price_flow_rel_raw": price_flow_rel_raw,
                "flat_price_participation_raw": flat_price_participation_raw,
                "missing_count": missing_count,
                "previous_rank": previous_metrics.get(symbol, {}).get("previous_rank"),
                "previous_composite_score": previous_metrics.get(symbol, {}).get("previous_composite_score"),
                "previous_setup_score": previous_metrics.get(symbol, {}).get("previous_setup_score"),
                "previous_positioning_score": previous_metrics.get(symbol, {}).get("previous_positioning_score"),
            }
        )

    if not enriched_rows:
        return ScanResponse(generated_at=datetime.now(timezone.utc), limit=limit, volume_percentile=volume_percentile, results=[])

    scored = pd.DataFrame(enriched_rows)
    scored["base_cs"] = _cross_rank_score(scored["raw_base"])
    scored["oi_cs"] = _cross_rank_score(scored["oi_raw"])
    scored["flow_cs"] = _cross_rank_score(scored["flow_norm_raw"])
    scored["ls_cs"] = _cross_rank_score(scored["ls_dev_raw"])
    scored["price_oi_rel_cs"] = _cross_rank_score(scored["price_oi_rel_raw"])
    scored["price_flow_rel_cs"] = _cross_rank_score(scored["price_flow_rel_raw"])
    scored["pre_move_cs"] = _cross_rank_score(scored["flat_price_participation_raw"])
    scored["liq_cs"] = _cross_rank_score(scored["quote_volume_24h"])

    scored["momentum_score"] = (
        2.2 * scored["base_cs"]
        + 1.0 * scored["price_oi_rel_cs"]
        + 0.8 * scored["price_flow_rel_cs"]
        + 0.6 * scored["oi_cs"]
        + 0.6 * scored["flow_cs"]
        + 0.4 * scored["ls_cs"]
    ).clip(-5.0, 5.0)

    scored["positioning_score"] = (
        1.5 * scored["oi_cs"]
        + 1.6 * scored["flow_cs"]
        + 1.0 * scored["ls_cs"]
        + 0.7 * scored["price_oi_rel_cs"]
        + 0.7 * scored["price_flow_rel_cs"]
    ).clip(-5.0, 5.0)

    scored["early_signal_score"] = (
        1.4 * scored["positioning_score"] / 5.0
        + 1.5 * scored["pre_move_cs"]
        - 0.9 * scored["base_cs"].abs()
    ).clip(-5.0, 5.0)

    abs_factors = scored[["oi_cs", "flow_cs", "ls_cs"]].abs()
    top_abs = abs_factors.max(axis=1)
    second_abs = abs_factors.apply(lambda r: r.nlargest(2).iloc[-1], axis=1)

    missing_penalty = -0.20 * scored["missing_count"]
    weak_liquidity_penalty = (0.1 - scored["liq_cs"]).clip(lower=0.0) * -0.8
    spike_penalty = ((top_abs - second_abs) - 0.75).clip(lower=0.0) * -0.6
    unconfirmed_move_penalty = ((scored["base_cs"].abs() - 0.8).clip(lower=0.0) * (0.3 - (scored["positioning_score"].abs() / 5.0)).clip(lower=0.0)) * -1.8

    scored["risk_penalty"] = (missing_penalty + weak_liquidity_penalty + spike_penalty + unconfirmed_move_penalty).clip(-2.5, 0.0)

    scored["composite_score"] = (
        w["momentum"] * scored["momentum_score"]
        + w["positioning"] * scored["positioning_score"]
        + w["early"] * scored["early_signal_score"]
        + scored["risk_penalty"]
    ).clip(-6.0, 6.0)

    scored["heat_score"] = scored["momentum_score"]
    scored["setup_score"] = scored["early_signal_score"]

    scored = scored.sort_values(by="composite_score", ascending=False).reset_index(drop=True)
    scored["rank"] = scored.index + 1

    scored["rank_change"] = scored.apply(
        lambda r: (int(r["previous_rank"]) - int(r["rank"])) if pd.notna(r["previous_rank"]) else None,
        axis=1,
    )
    scored["composite_delta"] = scored.apply(
        lambda r: (float(r["composite_score"]) - float(r["previous_composite_score"])) if pd.notna(r["previous_composite_score"]) else None,
        axis=1,
    )
    scored["setup_delta"] = scored.apply(
        lambda r: (float(r["setup_score"]) - float(r["previous_setup_score"])) if pd.notna(r["previous_setup_score"]) else None,
        axis=1,
    )
    scored["positioning_delta"] = scored.apply(
        lambda r: (float(r["positioning_score"]) - float(r["previous_positioning_score"])) if pd.notna(r["previous_positioning_score"]) else None,
        axis=1,
    )

    scored["data_quality_score"] = scored.apply(
        lambda r: _calc_data_quality_score(int(r["missing_count"]), float(r["quote_volume_24h"]), volume_threshold),
        axis=1,
    )

    bucket_and_tags = scored.apply(
        lambda r: _assign_signal_bucket_and_tags(
            composite_score=float(r["composite_score"]),
            setup_score=float(r["setup_score"]),
            positioning_score=float(r["positioning_score"]),
            momentum_score=float(r["momentum_score"]),
            risk_penalty=float(r["risk_penalty"]),
            oi_change=(None if pd.isna(r["oi_change_percent_recent"]) else float(r["oi_change_percent_recent"])),
            flow=(None if pd.isna(r["taker_net_flow_recent"]) else float(r["taker_net_flow_recent"])),
            ls_ratio=(None if pd.isna(r["long_short_ratio_recent"]) else float(r["long_short_ratio_recent"])),
            price_change_24h=float(r["price_change_percent_24h"]),
        ),
        axis=1,
    )
    scored["signal_bucket"] = bucket_and_tags.apply(lambda x: x[0])
    scored["reason_tags"] = bucket_and_tags.apply(lambda x: x[1])

    top_rows = scored.head(limit)

    results = [
        SymbolScanResult(
            symbol=str(row.symbol),
            last_price=float(row.last_price),
            price_change_percent_24h=float(row.price_change_percent_24h),
            quote_volume_24h=float(row.quote_volume_24h),
            heat_score=float(row.heat_score),
            momentum_score=float(row.momentum_score),
            setup_score=float(row.setup_score),
            positioning_score=float(row.positioning_score),
            early_signal_score=float(row.early_signal_score),
            risk_penalty=float(row.risk_penalty),
            composite_score=float(row.composite_score),
            signal_bucket=str(row.signal_bucket),
            reason_tags=list(row.reason_tags),
            previous_rank=(None if pd.isna(row.previous_rank) else int(row.previous_rank)),
            rank_change=(None if row.rank_change is None or pd.isna(row.rank_change) else int(row.rank_change)),
            previous_composite_score=(None if pd.isna(row.previous_composite_score) else float(row.previous_composite_score)),
            composite_delta=(None if row.composite_delta is None or pd.isna(row.composite_delta) else float(row.composite_delta)),
            setup_delta=(None if row.setup_delta is None or pd.isna(row.setup_delta) else float(row.setup_delta)),
            positioning_delta=(None if row.positioning_delta is None or pd.isna(row.positioning_delta) else float(row.positioning_delta)),
            data_quality_score=float(row.data_quality_score),
            oi_change_percent_recent=(None if pd.isna(row.oi_change_percent_recent) else float(row.oi_change_percent_recent)),
            taker_net_flow_recent=(None if pd.isna(row.taker_net_flow_recent) else float(row.taker_net_flow_recent)),
            long_short_ratio_recent=(None if pd.isna(row.long_short_ratio_recent) else float(row.long_short_ratio_recent)),
        )
        for row in top_rows.itertuples(index=False)
    ]

    return ScanResponse(
        generated_at=datetime.now(timezone.utc),
        limit=limit,
        volume_percentile=volume_percentile,
        results=results,
    )
