from typing import Literal

from fastapi import FastAPI, Query

from app.schemas import (
    ResearchEvaluationResponse,
    ResearchSnapshotRequest,
    ResearchSnapshotResponse,
    ScanResponse,
)
from app.services.research import evaluate_snapshots, save_snapshot
from app.services.scanner import build_scan

app = FastAPI(title="Binance USDⓈ-M Futures Scanner API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/scan/today", response_model=ScanResponse)
def scan_today(
    limit: int = Query(default=50, ge=1, le=200),
    volume_percentile: float = Query(default=0.7, ge=0.0, le=1.0),
    timeframe: str = Query(default="1h", pattern="^(1h|4h|24h)$"),
) -> ScanResponse:
    return build_scan(limit=limit, volume_percentile=volume_percentile, timeframe=timeframe)


@app.post("/api/research/snapshot", response_model=ResearchSnapshotResponse)
def research_snapshot(payload: ResearchSnapshotRequest) -> ResearchSnapshotResponse:
    scan, save_path = save_snapshot(
        timeframe=payload.timeframe,
        limit=payload.limit,
        volume_percentile=payload.volume_percentile,
    )
    return ResearchSnapshotResponse(
        save_path=save_path,
        generated_at=scan.generated_at,
        timeframe=payload.timeframe,
        row_count=len(scan.results),
    )


@app.get("/api/research/evaluate", response_model=ResearchEvaluationResponse)
def research_evaluate(
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
    rank_field: Literal[
        "momentum_score",
        "positioning_score",
        "early_signal_score",
        "composite_score",
        "heat_score",
        "setup_score",
    ] = Query(default="composite_score"),
    top_k: int = Query(default=20, ge=1, le=200),
    horizon_steps: int = Query(default=1, ge=1, le=200),
) -> ResearchEvaluationResponse:
    payload = evaluate_snapshots(
        timeframe=timeframe,
        rank_field=rank_field,
        top_k=top_k,
        horizon_steps=horizon_steps,
    )
    return ResearchEvaluationResponse(**payload)
