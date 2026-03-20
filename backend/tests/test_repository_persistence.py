from datetime import datetime, timezone

from app.repositories.signal_repository import SignalRepository
from app.services.research import _snapshot_to_schema
from app.schemas import ScanResponse, SymbolScanResult


class FakeSession:
    def __init__(self):
        self.added = []

    def scalar(self, _stmt):
        return None

    def add(self, obj):
        if getattr(obj, "id", None) is None:
            setattr(obj, "id", len(self.added) + 1)
        self.added.append(obj)

    def flush(self):
        return None


def test_save_scan_results_persists_timeseries_and_signals():
    db = FakeSession()
    repo = SignalRepository(db)  # type: ignore[arg-type]

    run = repo.create_signal_run("1h", 10, 0.7, datetime.now(timezone.utc))
    scan = ScanResponse(
        generated_at=datetime.now(timezone.utc),
        limit=10,
        volume_percentile=0.7,
        results=[
            SymbolScanResult(
                symbol="BTCUSDT",
                last_price=60000.0,
                price_change_percent_24h=1.2,
                quote_volume_24h=1_000_000.0,
                heat_score=1.0,
                momentum_score=1.1,
                setup_score=0.4,
                positioning_score=0.3,
                early_signal_score=0.2,
                risk_penalty=-0.1,
                composite_score=0.8,
                signal_bucket="breakout_watch",
                reason_tags=["high_composite"],
                previous_rank=3,
                rank_change=2,
                previous_composite_score=0.5,
                composite_delta=0.3,
                setup_delta=0.2,
                positioning_delta=0.1,
                data_quality_score=0.9,
                oi_change_percent_recent=0.5,
                taker_net_flow_recent=1200.0,
                long_short_ratio_recent=1.02,
                funding_rate_latest=-0.0004,
                funding_rate_abs=0.0004,
                funding_bias="negative",
            )
        ],
    )

    repo.save_scan_results(run, scan)
    added_types = {type(x).__name__ for x in db.added}
    assert "SignalSnapshot" in added_types
    assert "SignalScore" in added_types
    assert "MarketSnapshot" in added_types
    assert "OISnapshot" in added_types
    assert "FundingSnapshot" in added_types
    assert "PositioningSnapshot" in added_types

    signal_snapshot = next(obj for obj in db.added if type(obj).__name__ == "SignalSnapshot")
    funding_snapshot = next(obj for obj in db.added if type(obj).__name__ == "FundingSnapshot")

    assert signal_snapshot.funding_rate_latest == -0.0004
    assert signal_snapshot.funding_rate_abs == 0.0004
    assert signal_snapshot.funding_bias == "negative"
    assert funding_snapshot.funding_rate == -0.0004

    schema_row = _snapshot_to_schema(signal_snapshot)
    assert schema_row.funding_rate_latest == -0.0004
    assert schema_row.funding_rate_abs == 0.0004
    assert schema_row.funding_bias == "negative"
