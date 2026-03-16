from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SymbolScanResult(BaseModel):
    symbol: str
    last_price: float
    price_change_percent_24h: float
    quote_volume_24h: float
    heat_score: float
    momentum_score: float
    setup_score: float
    positioning_score: float
    early_signal_score: float
    risk_penalty: float
    composite_score: float
    oi_change_percent_recent: float | None = None
    taker_net_flow_recent: float | None = None
    long_short_ratio_recent: float | None = None


class ScanResponse(BaseModel):
    generated_at: datetime
    limit: int
    volume_percentile: float
    results: list[SymbolScanResult]


class ResearchSnapshotRequest(BaseModel):
    timeframe: Literal["1h", "4h", "24h"] = "1h"
    limit: int = Field(default=50, ge=1, le=200)
    volume_percentile: float = Field(default=0.7, ge=0.0, le=1.0)


class ResearchSnapshotResponse(BaseModel):
    save_path: str
    generated_at: datetime
    timeframe: Literal["1h", "4h", "24h"]
    row_count: int


class EvaluationMetrics(BaseModel):
    valid_snapshot_pairs: int
    skipped_low_coverage_pairs: int
    number_of_symbol_observations: int
    average_forward_return: float
    median_forward_return: float
    standard_deviation_forward_return: float
    hit_ratio: float
    average_best_symbol_return: float
    average_worst_symbol_return: float
    average_coverage_ratio: float
    average_matched_symbols_per_snapshot: float
    average_elapsed_seconds_between_pairs: float


class ResearchEvaluationResponse(BaseModel):
    timeframe: Literal["1h", "4h", "24h"]
    rank_field: Literal[
        "momentum_score",
        "positioning_score",
        "early_signal_score",
        "composite_score",
        "heat_score",
        "setup_score",
    ]
    top_k: int
    horizon_steps: int
    horizon_unit: Literal["snapshot_steps"] = "snapshot_steps"
    total_snapshots_found: int
    strategy_metrics: EvaluationMetrics
    baseline_metrics: EvaluationMetrics
