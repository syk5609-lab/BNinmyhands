from datetime import datetime, timedelta, timezone

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


class FakeSnapshot:
    def __init__(self, symbol, last_price, score):
        self.symbol = symbol
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


class FakeRepo:
    def __init__(self, _db):
        t0 = datetime.now(timezone.utc)
        self._runs = [FakeRun(1, t0), FakeRun(2, t0 + timedelta(hours=1))]

    def list_runs(self, timeframe):
        return [r for r in self._runs if r.timeframe == timeframe]

    def get_run_snapshots(self, run_id):
        if run_id == 1:
            return [FakeSnapshot("BTCUSDT", 100.0, 0.9), FakeSnapshot("ETHUSDT", 50.0, 0.8)]
        return [FakeSnapshot("BTCUSDT", 110.0, 0.7), FakeSnapshot("ETHUSDT", 45.0, 0.6)]


def test_evaluate_snapshots_db_backed(monkeypatch):
    monkeypatch.setattr(research, "SessionLocal", lambda: FakeSessionContext())
    monkeypatch.setattr(research, "SignalRepository", FakeRepo)

    result = research.evaluate_snapshots(timeframe="1h", rank_field="composite_score", top_k=2, horizon_steps=1)

    assert result["strategy_metrics"]["valid_snapshot_pairs"] >= 1
    assert result["strategy_metrics"]["number_of_symbol_observations"] >= 1
    assert "baseline_metrics" in result
