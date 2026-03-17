from typing import Literal

from fastapi import FastAPI, Query
from sqlalchemy import text

from app.db.session import SessionLocal
from app.schemas import (
    AssetHistoryResponse,
    AssetLatestResponse,
    ResearchEvaluationResponse,
    ResearchRunDetail,
    ResearchRunSummary,
    ResearchSnapshotRequest,
    ResearchSnapshotResponse,
    ScanResponse,
)
from app.services.research import (
    evaluate_snapshots,
    get_asset_history,
    get_asset_latest,
    get_latest_research_run,
    get_research_run,
    list_research_runs,
    save_snapshot,
)
from app.services.scanner import build_scan
from app.services.scheduler import start_scheduler, stop_scheduler

app = FastAPI(title="Binance USDⓈ-M Futures Scanner API", version="0.1.0")


@app.on_event("startup")
def _startup() -> None:
    start_scheduler()


@app.on_event("shutdown")
def _shutdown() -> None:
    stop_scheduler()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def health_db() -> dict[str, str]:
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
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


@app.get("/api/research/runs", response_model=list[ResearchRunSummary])
def research_runs(timeframe: Literal["1h", "4h", "24h"] = Query(default="1h")) -> list[ResearchRunSummary]:
    return list_research_runs(timeframe=timeframe)


@app.get("/api/research/runs/latest", response_model=ResearchRunDetail)
def research_latest_run(timeframe: Literal["1h", "4h", "24h"] = Query(default="1h")) -> ResearchRunDetail:
    return get_latest_research_run(timeframe=timeframe)


@app.get("/api/research/runs/{run_id}", response_model=ResearchRunDetail)
def research_run_detail(run_id: int) -> ResearchRunDetail:
    return get_research_run(run_id)


@app.get("/api/assets/{symbol}/latest", response_model=AssetLatestResponse)
def asset_latest(
    symbol: str,
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
) -> AssetLatestResponse:
    return get_asset_latest(symbol, timeframe=timeframe)


@app.get("/api/assets/{symbol}/history", response_model=AssetHistoryResponse)
def asset_history(
    symbol: str,
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
    limit: int = Query(default=200, ge=1, le=2000),
) -> AssetHistoryResponse:
    return get_asset_history(symbol, timeframe=timeframe, limit=limit)
