import math
from datetime import datetime, timezone
from statistics import median
from typing import Any

from fastapi import HTTPException

from app.db.session import SessionLocal
from app.repositories.signal_repository import SignalRepository
from app.schemas import (
    AssetHistoryPoint,
    AssetHistoryResponse,
    AssetLatestResponse,
    ResearchRunDetail,
    ResearchRunSummary,
    ScanResponse,
    SymbolScanResult,
)
from app.services.scanner import build_scan

VALID_TIMEFRAMES = {"1h", "4h", "24h"}
VALID_RANK_FIELDS = {
    "momentum_score",
    "positioning_score",
    "early_signal_score",
    "composite_score",
    "heat_score",
    "setup_score",
    "price_change_percent_24h",
}
_MIN_PAIR_COVERAGE_RATIO = 0.4


def _validate_inputs(timeframe: str, rank_field: str, top_k: int, horizon_steps: int) -> None:
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(status_code=422, detail=f"Invalid timeframe: {timeframe}")
    if rank_field not in VALID_RANK_FIELDS:
        raise HTTPException(status_code=422, detail=f"Invalid rank_field: {rank_field}")
    if top_k <= 0:
        raise HTTPException(status_code=422, detail="top_k must be > 0")
    if horizon_steps <= 0:
        raise HTTPException(status_code=422, detail="horizon_steps must be > 0")


def save_snapshot(timeframe: str, limit: int, volume_percentile: float) -> tuple[ScanResponse, str]:
    _validate_inputs(timeframe=timeframe, rank_field="composite_score", top_k=1, horizon_steps=1)
    scan = build_scan(limit=limit, volume_percentile=volume_percentile, timeframe=timeframe)

    with SessionLocal() as db:
        repo = SignalRepository(db)
        run = repo.create_signal_run(
            timeframe=timeframe,
            limit=limit,
            volume_percentile=volume_percentile,
            started_at=scan.generated_at.astimezone(timezone.utc),
        )
        try:
            repo.save_scan_results(run, scan)
            db.commit()
        except Exception as exc:  # noqa: BLE001
            db.rollback()
            run = repo.create_signal_run(
                timeframe=timeframe,
                limit=limit,
                volume_percentile=volume_percentile,
                started_at=datetime.now(timezone.utc),
            )
            repo.mark_run_failed(run, str(exc))
            db.commit()
            raise

        return scan, f"db://signal_runs/{run.id}"


def _ranked_symbols(rows: list[dict[str, Any]], rank_field: str, top_k: int) -> list[str]:
    def score(row: dict[str, Any]) -> float:
        try:
            return float(row.get(rank_field, float("-inf")))
        except (TypeError, ValueError):
            return float("-inf")

    ranked = sorted(rows, key=score, reverse=True)
    return [str(row.get("symbol")) for row in ranked[:top_k] if isinstance(row.get("symbol"), str)]


def _safe_std(values: list[float]) -> float:
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


def _compute_metrics(
    returns: list[float],
    basket_best: list[float],
    basket_worst: list[float],
    valid_pairs: int,
    skipped_low_coverage_pairs: int,
    coverage_ratios: list[float],
    matched_counts: list[int],
    elapsed_seconds: list[float],
) -> dict[str, float | int]:
    if not returns:
        return {
            "valid_snapshot_pairs": valid_pairs,
            "skipped_low_coverage_pairs": skipped_low_coverage_pairs,
            "number_of_symbol_observations": 0,
            "average_forward_return": 0.0,
            "median_forward_return": 0.0,
            "standard_deviation_forward_return": 0.0,
            "hit_ratio": 0.0,
            "average_best_symbol_return": 0.0,
            "average_worst_symbol_return": 0.0,
            "average_coverage_ratio": 0.0,
            "average_matched_symbols_per_snapshot": 0.0,
            "average_elapsed_seconds_between_pairs": 0.0,
        }

    positives = sum(1 for r in returns if r > 0)
    return {
        "valid_snapshot_pairs": valid_pairs,
        "skipped_low_coverage_pairs": skipped_low_coverage_pairs,
        "number_of_symbol_observations": len(returns),
        "average_forward_return": float(sum(returns) / len(returns)),
        "median_forward_return": float(median(returns)),
        "standard_deviation_forward_return": float(_safe_std(returns)),
        "hit_ratio": float(positives / len(returns)),
        "average_best_symbol_return": float(sum(basket_best) / len(basket_best)) if basket_best else 0.0,
        "average_worst_symbol_return": float(sum(basket_worst) / len(basket_worst)) if basket_worst else 0.0,
        "average_coverage_ratio": float(sum(coverage_ratios) / len(coverage_ratios)) if coverage_ratios else 0.0,
        "average_matched_symbols_per_snapshot": float(sum(matched_counts) / len(matched_counts)) if matched_counts else 0.0,
        "average_elapsed_seconds_between_pairs": float(sum(elapsed_seconds) / len(elapsed_seconds)) if elapsed_seconds else 0.0,
    }


def _evaluate_rank_field(
    snapshots: list[dict[str, Any]],
    rank_field: str,
    top_k: int,
    horizon_steps: int,
) -> dict[str, float | int]:
    all_returns: list[float] = []
    basket_best: list[float] = []
    basket_worst: list[float] = []
    coverage_ratios: list[float] = []
    matched_counts: list[int] = []
    elapsed_seconds: list[float] = []
    valid_pairs = 0
    skipped_low_coverage_pairs = 0

    for idx in range(len(snapshots) - horizon_steps):
        current = snapshots[idx]
        future = snapshots[idx + horizon_steps]

        picks = _ranked_symbols(current["rows"], rank_field=rank_field, top_k=top_k)
        if not picks:
            continue

        current_prices = {row["symbol"]: row["last_price"] for row in current["rows"]}
        future_prices = {row["symbol"]: row["last_price"] for row in future["rows"]}

        returns: list[float] = []
        for symbol in picks:
            p0 = current_prices.get(symbol)
            p1 = future_prices.get(symbol)
            if p0 is None or p1 is None or p0 <= 0:
                continue
            returns.append((p1 / p0) - 1.0)

        expected = max(1, len(picks))
        matched = len(returns)
        coverage_ratio = matched / expected
        if coverage_ratio < _MIN_PAIR_COVERAGE_RATIO:
            skipped_low_coverage_pairs += 1
            continue

        valid_pairs += 1
        coverage_ratios.append(coverage_ratio)
        matched_counts.append(matched)
        elapsed_seconds.append(max(0.0, (future["generated_at"] - current["generated_at"]).total_seconds()))
        all_returns.extend(returns)
        basket_best.append(max(returns))
        basket_worst.append(min(returns))

    return _compute_metrics(
        returns=all_returns,
        basket_best=basket_best,
        basket_worst=basket_worst,
        valid_pairs=valid_pairs,
        skipped_low_coverage_pairs=skipped_low_coverage_pairs,
        coverage_ratios=coverage_ratios,
        matched_counts=matched_counts,
        elapsed_seconds=elapsed_seconds,
    )


def evaluate_snapshots(timeframe: str, rank_field: str, top_k: int, horizon_steps: int) -> dict[str, Any]:
    _validate_inputs(timeframe=timeframe, rank_field=rank_field, top_k=top_k, horizon_steps=horizon_steps)

    with SessionLocal() as db:
        repo = SignalRepository(db)
        runs = repo.list_runs(timeframe=timeframe)

        snapshots: list[dict[str, Any]] = []
        for run in runs:
            rows = repo.get_run_snapshots(run.id)
            if not rows:
                continue
            snapshots.append(
                {
                    "generated_at": run.started_at,
                    "rows": [
                        {
                            "symbol": row.symbol,
                            "last_price": row.last_price,
                            "price_change_percent_24h": row.price_change_percent_24h,
                            "quote_volume_24h": row.quote_volume_24h,
                            "heat_score": row.heat_score,
                            "momentum_score": row.momentum_score,
                            "setup_score": row.setup_score,
                            "positioning_score": row.positioning_score,
                            "early_signal_score": row.early_signal_score,
                            "risk_penalty": row.risk_penalty,
                            "composite_score": row.composite_score,
                        }
                        for row in rows
                    ],
                }
            )

    if len(snapshots) <= horizon_steps:
        empty = _compute_metrics([], [], [], 0, 0, [], [], [])
        return {
            "timeframe": timeframe,
            "rank_field": rank_field,
            "top_k": top_k,
            "horizon_steps": horizon_steps,
            "horizon_unit": "snapshot_steps",
            "total_snapshots_found": len(snapshots),
            "strategy_metrics": empty,
            "baseline_metrics": empty,
        }

    strategy_metrics = _evaluate_rank_field(
        snapshots=snapshots,
        rank_field=rank_field,
        top_k=top_k,
        horizon_steps=horizon_steps,
    )
    baseline_metrics = _evaluate_rank_field(
        snapshots=snapshots,
        rank_field="price_change_percent_24h",
        top_k=top_k,
        horizon_steps=horizon_steps,
    )

    return {
        "timeframe": timeframe,
        "rank_field": rank_field,
        "top_k": top_k,
        "horizon_steps": horizon_steps,
        "horizon_unit": "snapshot_steps",
        "total_snapshots_found": len(snapshots),
        "strategy_metrics": strategy_metrics,
        "baseline_metrics": baseline_metrics,
    }


def list_research_runs(timeframe: str) -> list[ResearchRunSummary]:
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(status_code=422, detail=f"Invalid timeframe: {timeframe}")
    with SessionLocal() as db:
        repo = SignalRepository(db)
        runs = repo.list_runs(timeframe)
        items: list[ResearchRunSummary] = []
        for run in runs:
            row_count = len(repo.get_run_snapshots(run.id))
            items.append(
                ResearchRunSummary(
                    id=run.id,
                    timeframe=run.timeframe,
                    started_at=run.started_at,
                    finished_at=run.finished_at,
                    status=run.status,
                    row_count=row_count,
                )
            )
        return items


def _snapshot_to_schema(snapshot) -> SymbolScanResult:
    return SymbolScanResult(
        symbol=snapshot.symbol,
        last_price=snapshot.last_price,
        price_change_percent_24h=snapshot.price_change_percent_24h,
        quote_volume_24h=snapshot.quote_volume_24h,
        heat_score=snapshot.heat_score,
        momentum_score=snapshot.momentum_score,
        setup_score=snapshot.setup_score,
        positioning_score=snapshot.positioning_score,
        early_signal_score=snapshot.early_signal_score,
        risk_penalty=snapshot.risk_penalty,
        composite_score=snapshot.composite_score,
        signal_bucket=snapshot.signal_bucket,
        reason_tags=snapshot.reason_tags or [],
        previous_rank=snapshot.previous_rank,
        rank_change=snapshot.rank_change,
        previous_composite_score=snapshot.previous_composite_score,
        composite_delta=snapshot.composite_delta,
        setup_delta=snapshot.setup_delta,
        positioning_delta=snapshot.positioning_delta,
        data_quality_score=snapshot.data_quality_score,
        oi_change_percent_recent=snapshot.oi_change_percent_recent,
        taker_net_flow_recent=snapshot.taker_net_flow_recent,
        long_short_ratio_recent=snapshot.long_short_ratio_recent,
        funding_rate_latest=snapshot.funding_rate_latest,
        funding_rate_abs=snapshot.funding_rate_abs,
        funding_bias=snapshot.funding_bias,
    )


def get_latest_research_run(timeframe: str) -> ResearchRunDetail:
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(status_code=422, detail=f"Invalid timeframe: {timeframe}")
    with SessionLocal() as db:
        repo = SignalRepository(db)
        run = repo.get_latest_run(timeframe=timeframe)
        if not run:
            raise HTTPException(status_code=404, detail="No completed run found for timeframe")
        snapshots = repo.get_run_snapshots(run.id)
        rows = [_snapshot_to_schema(s) for s in snapshots]
        return ResearchRunDetail(
            id=run.id,
            timeframe=run.timeframe,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=run.status,
            limit=run.limit,
            volume_percentile=run.volume_percentile,
            rows=rows,
        )


def get_research_run(run_id: int) -> ResearchRunDetail:
    with SessionLocal() as db:
        repo = SignalRepository(db)
        run = repo.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        snapshots = repo.get_run_snapshots(run.id)
        rows = [_snapshot_to_schema(s) for s in snapshots]
        return ResearchRunDetail(
            id=run.id,
            timeframe=run.timeframe,
            started_at=run.started_at,
            finished_at=run.finished_at,
            status=run.status,
            limit=run.limit,
            volume_percentile=run.volume_percentile,
            rows=rows,
        )


def get_asset_latest(symbol: str, timeframe: str, run_id: int | None = None) -> AssetLatestResponse:
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(status_code=422, detail=f"Invalid timeframe: {timeframe}")
    with SessionLocal() as db:
        repo = SignalRepository(db)

        if run_id is not None:
            run = repo.get_run(run_id)
            if not run or run.status != "completed":
                raise HTTPException(status_code=404, detail="Run not found")
            if run.timeframe != timeframe:
                raise HTTPException(status_code=422, detail="run_id does not match timeframe")

            snapshot = repo.get_asset_snapshot_in_run(symbol.upper(), run_id)
            if not snapshot:
                raise HTTPException(status_code=404, detail="Symbol not found for run")
            return AssetLatestResponse(symbol=snapshot.symbol, ts=snapshot.ts, row=_snapshot_to_schema(snapshot))

        snapshot = repo.get_asset_latest(symbol.upper(), timeframe=timeframe)
        if not snapshot:
            raise HTTPException(status_code=404, detail="Symbol not found for timeframe")
        return AssetLatestResponse(symbol=snapshot.symbol, ts=snapshot.ts, row=_snapshot_to_schema(snapshot))


def get_asset_history(symbol: str, timeframe: str, limit: int = 200, run_id: int | None = None) -> AssetHistoryResponse:
    if timeframe not in VALID_TIMEFRAMES:
        raise HTTPException(status_code=422, detail=f"Invalid timeframe: {timeframe}")
    with SessionLocal() as db:
        repo = SignalRepository(db)

        snapshots = None
        if run_id is not None:
            run = repo.get_run(run_id)
            if not run or run.status != "completed":
                raise HTTPException(status_code=404, detail="Run not found")
            if run.timeframe != timeframe:
                raise HTTPException(status_code=422, detail="run_id does not match timeframe")

            # Validate the symbol exists in the requested run before returning history.
            if not repo.get_asset_snapshot_in_run(symbol.upper(), run_id):
                raise HTTPException(status_code=404, detail="Symbol not found for run")

            snapshots = repo.get_asset_history_until_ts(
                symbol.upper(),
                timeframe=timeframe,
                max_ts=run.started_at,
                limit=limit,
            )

        if snapshots is None:
            snapshots = repo.get_asset_history(symbol.upper(), timeframe=timeframe, limit=limit)

        points = [
            AssetHistoryPoint(
                ts=s.ts,
                last_price=s.last_price,
                composite_score=s.composite_score,
                momentum_score=s.momentum_score,
                setup_score=s.setup_score,
                positioning_score=s.positioning_score,
                risk_penalty=s.risk_penalty,
                oi_change_percent_recent=s.oi_change_percent_recent,
                taker_net_flow_recent=s.taker_net_flow_recent,
                long_short_ratio_recent=s.long_short_ratio_recent,
            )
            for s in snapshots
        ]
        return AssetHistoryResponse(symbol=symbol.upper(), points=points)
