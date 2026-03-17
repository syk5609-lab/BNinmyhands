from datetime import datetime, timezone

from app.schemas import AssetHistoryPoint


def test_asset_history_point_fields_present():
    point = AssetHistoryPoint(
        ts=datetime.now(timezone.utc),
        last_price=100.0,
        composite_score=1.0,
        momentum_score=0.8,
        setup_score=0.7,
        positioning_score=0.6,
        risk_penalty=-0.2,
        oi_change_percent_recent=1.5,
        taker_net_flow_recent=500.0,
        long_short_ratio_recent=1.03,
    )
    assert point.positioning_score == 0.6
    assert point.risk_penalty == -0.2
    assert point.oi_change_percent_recent == 1.5
    assert point.taker_net_flow_recent == 500.0
    assert point.long_short_ratio_recent == 1.03
