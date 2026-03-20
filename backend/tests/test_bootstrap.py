from app.db.base import Base
from app.db import models  # noqa: F401


def test_metadata_contains_required_tables():
    tables = set(Base.metadata.tables.keys())
    assert {
        "exchanges",
        "assets",
        "instruments",
        "market_snapshots",
        "oi_snapshots",
        "funding_snapshots",
        "positioning_snapshots",
        "signal_runs",
        "signal_scores",
        "signal_snapshots",
        "users",
        "profiles",
        "sessions",
        "email_verification_tokens",
        "password_reset_tokens",
        "community_posts",
        "community_reports",
        "ad_slots",
        "ad_creatives",
        "ad_events",
        "feature_flags",
    }.issubset(tables)
