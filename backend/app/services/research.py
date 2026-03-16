import json
import math
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any
from uuid import uuid4

from fastapi import HTTPException

from app.schemas import ScanResponse
from app.services.scanner import build_scan

DATA_DIR = Path("backend/data/snapshots")
VALID_TIMEFRAMES = {"1h", "4h", "24h"}
VALID_RANK_FIELDS = {
    "momentum_score",
    "positioning_score",
    "early_signal_score",
    "composite_score",
    "heat_score",
    "setup_score",
    "price_change_percent_24h",  # Internal baseline-compatible rank field.
}
_MIN_PAIR_COVERAGE_RATIO = 0.4  # Skip low-overlap pairs to reduce noisy evaluations.


def _timeframe_dir(timeframe: str) -> Path:
    return DATA_DIR / timeframe


def _snapshot_rows(scan: ScanResponse) -> list[dict[str, Any]]:
    return [row.model_dump() for row in scan.results]


def _parse_generated_at(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


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

    ts = scan.generated_at.astimezone(timezone.utc)
    folder = _timeframe_dir(timeframe)
    folder.mkdir(parents=True, exist_ok=True)
    file_path = folder / f"{ts.strftime('%Y%m%d_%H%M%S_%f')}_{uuid4().hex[:8]}.json"

    payload = {
        "generated_at": scan.generated_at.isoformat(),
        "timeframe": timeframe,
        "limit": limit,
        "volume_percentile": volume_percentile,
        "results": _snapshot_rows(scan),
    }
    file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return scan, str(file_path)


def _load_snapshots(timeframe: str) -> list[dict[str, Any]]:
    folder = _timeframe_dir(timeframe)
    if not folder.exists():
        return []

    snapshots_with_time: list[tuple[datetime, dict[str, Any]]] = []
    for path in folder.glob("*.json"):
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(raw, dict) or not isinstance(raw.get("results"), list):
            continue
        parsed_ts = _parse_generated_at(raw.get("generated_at"))
        if parsed_ts is None:
            continue
        snapshots_with_time.append((parsed_ts, raw))

    snapshots_with_time.sort(key=lambda item: item[0])
    return [item[1] for item in snapshots_with_time]


def _symbol_price_map(snapshot: dict[str, Any]) -> dict[str, float]:
    mapping: dict[str, float] = {}
    for row in snapshot.get("results", []):
        if not isinstance(row, dict):
            continue
        symbol = row.get("symbol")
        last_price = row.get("last_price")
        try:
            if isinstance(symbol, str):
                price = float(last_price)
                if price > 0:
                    mapping[symbol] = price
        except (TypeError, ValueError):
            continue
    return mapping


def _ranked_symbols(snapshot: dict[str, Any], rank_field: str, top_k: int) -> list[str]:
    rows: list[dict[str, Any]] = [row for row in snapshot.get("results", []) if isinstance(row, dict)]

    def score(row: dict[str, Any]) -> float:
        try:
            return float(row.get(rank_field, float("-inf")))
        except (TypeError, ValueError):
            return float("-inf")

    rows.sort(key=score, reverse=True)
    return [str(row.get("symbol")) for row in rows[:top_k] if isinstance(row.get("symbol"), str)]


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

        picks = _ranked_symbols(current, rank_field=rank_field, top_k=top_k)
        if not picks:
            continue

        current_prices = _symbol_price_map(current)
        future_prices = _symbol_price_map(future)

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

        current_ts = _parse_generated_at(current.get("generated_at"))
        future_ts = _parse_generated_at(future.get("generated_at"))
        if current_ts is not None and future_ts is not None:
            elapsed_seconds.append(max(0.0, (future_ts - current_ts).total_seconds()))

        valid_pairs += 1
        coverage_ratios.append(coverage_ratio)
        matched_counts.append(matched)
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
    snapshots = _load_snapshots(timeframe)

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
        "horizon_unit": "snapshot_steps",  # Step-based index horizon, not strict wall-clock hours.
        "total_snapshots_found": len(snapshots),
        "strategy_metrics": strategy_metrics,
        "baseline_metrics": baseline_metrics,
    }
