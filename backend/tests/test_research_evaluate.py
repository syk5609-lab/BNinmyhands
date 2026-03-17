from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from app.services import research


class FakeSessionContext:
    def __enter__(self):
        return object()

    def __exit__(self, exc_type, exc, tb):
        return False


class FakeRun:
    def __init__(self, run_id, started_at, timeframe="1h", status="completed", limit=20, volume_percentile=0.7):
        self.id = run_id
        self.started_at = started_at
        self.timeframe = timeframe
        self.status = status
        self.limit = limit
        self.volume_percentile = volume_percentile
        self.finished_at = started_at + timedelta(minutes=1)


class FakeSnapshot:
    def __init__(self, symbol, last_price, score):
        self.symbol = symbol
        self.ts = datetime.now(timezone.utc)
        self.last_price = last_price
        self.price_change_percent_24h = score
        self.quote_volume_24h = 1_000_000
        self.heat_score = score
        self.momentum_score = score
        self.setup_score = score
        self.positioning_score = score
        self.early_signal_score = score
        self.risk_penalty = 0.0
        self.composite_score = score
        self.signal_bucket = "breakout_watch"
        self.reason_tags = ["high_composite"]
        self.previous_rank = 2
        self.rank_change = 1
        self.previous_composite_score = score - 0.1
        self.composite_delta = 0.1
        self.setup_delta = 0.1
        self.positioning_delta = 0.1
        self.data_quality_score = 0.9
        self.oi_change_percent_recent = 0.5
        self.taker_net_flow_recent = 100.0
        self.long_short_ratio_recent = 1.02


class FakeRepo:
    def __init__(self, _db):
        t0 = datetime.now(timezone.utc)
        self._runs = [
            FakeRun(1, t0),
            FakeRun(2, t0 + timedelta(hours=1)),
            FakeRun(3, t0 + timedelta(hours=2), timeframe="4h"),
        ]

    def list_runs(self, timeframe):
        return [r for r in self._runs if r.timeframe == timeframe]

    def get_latest_run(self, timeframe):
        runs = [r for r in self._runs if r.timeframe == timeframe and r.status == "completed"]
        if not runs:
            return None
        return sorted(runs, key=lambda r: r.started_at)[-1]

    def get_run_snapshots(self, run_id):
        if run_id == 1:
            return [FakeSnapshot("BTCUSDT", 100.0, 0.9), FakeSnapshot("ETHUSDT", 50.0, 0.8)]
        if run_id == 2:
            return [FakeSnapshot("BTCUSDT", 110.0, 0.7), FakeSnapshot("ETHUSDT", 45.0, 0.6)]
        return [FakeSnapshot("BTCUSDT", 120.0, 0.5)]


class FakeRepoNoRuns(FakeRepo):
    def __init__(self, _db):
        self._runs = []


def test_evaluate_snapshots_db_backed(monkeypatch):
    monkeypatch.setattr(research, "SessionLocal", lambda: FakeSessionContext())
    monkeypatch.setattr(research, "SignalRepository", FakeRepo)

    result = research.evaluate_snapshots(timeframe="1h", rank_field="composite_score", top_k=2, horizon_steps=1)

    assert result["strategy_metrics"]["valid_snapshot_pairs"] >= 1
    assert result["strategy_metrics"]["number_of_symbol_observations"] >= 1
    assert "baseline_metrics" in result


def test_get_latest_research_run_returns_latest_completed_for_timeframe(monkeypatch):
    monkeypatch.setattr(research, "SessionLocal", lambda: FakeSessionContext())
    monkeypatch.setattr(research, "SignalRepository", FakeRepo)

    result = research.get_latest_research_run(timeframe="1h")

    assert result.id == 2
    assert result.timeframe == "1h"
    assert len(result.rows) == 2


def test_get_latest_research_run_raises_404_when_missing(monkeypatch):
    monkeypatch.setattr(research, "SessionLocal", lambda: FakeSessionContext())
    monkeypatch.setattr(research, "SignalRepository", FakeRepoNoRuns)

    with pytest.raises(HTTPException) as exc:
        research.get_latest_research_run(timeframe="24h")

    assert exc.value.status_code == 404
