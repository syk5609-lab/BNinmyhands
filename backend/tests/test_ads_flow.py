from datetime import datetime, timedelta
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import BigInteger, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models import AdCreative, AdEvent, AdSlot, User
from app.db.session import get_db
from app.main import app


@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(_type, _compiler, **_kwargs):
    return "JSON"


@compiles(BigInteger, "sqlite")
def _compile_bigint_sqlite(_type, _compiler, **_kwargs):
    return "INTEGER"


def _make_client(tmp_path: Path):
    db_path = tmp_path / "ads-test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client, testing_session_local, engine


def _signup(client: TestClient, email: str, nickname: str):
    response = client.post(
        "/auth/signup",
        json={"email": email, "password": "topsecret123", "nickname": nickname},
    )
    assert response.status_code == 200
    return response


def _seed_slot(session_local, placement: str = "dashboard_top", enabled: bool = True):
    with session_local() as db:
        slot = AdSlot(
            placement=placement,
            label=placement.replace("_", " ").title(),
            enabled=enabled,
            priority=100,
        )
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return slot.id


def _seed_creative(
    session_local,
    slot_id: int,
    *,
    title: str = "Research tools for active traders",
    status: str = "active",
    starts_at: datetime | None = None,
    ends_at: datetime | None = None,
):
    with session_local() as db:
        creative = AdCreative(
            slot_id=slot_id,
            title=title,
            body_copy="A calm sponsored unit for launch.",
            target_url="https://example.com/ad",
            cta_label="Learn more",
            status=status,
            starts_at=starts_at,
            ends_at=ends_at,
        )
        db.add(creative)
        db.commit()
        db.refresh(creative)
        return creative.id


def test_public_ads_endpoint_returns_only_enabled_active_valid_creatives(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        slot_id = _seed_slot(session_local, placement="dashboard_top", enabled=True)
        disabled_slot_id = _seed_slot(session_local, placement="dashboard_mid", enabled=False)
        _seed_creative(session_local, slot_id, title="Active creative")
        _seed_creative(session_local, slot_id, title="Paused creative", status="paused")
        _seed_creative(session_local, slot_id, title="Expired creative", ends_at=datetime.utcnow() - timedelta(days=1))
        _seed_creative(session_local, disabled_slot_id, title="Disabled slot creative")

        response = client.get("/ads/slots?placement=dashboard_top")
        empty_response = client.get("/ads/slots?placement=dashboard_mid")

        assert response.status_code == 200
        body = response.json()
        assert len(body) == 1
        assert body[0]["placement"] == "dashboard_top"
        assert body[0]["creative"]["title"] == "Active creative"

        assert empty_response.status_code == 200
        assert empty_response.json() == []
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_ad_event_logging_works_for_guest_usage(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        slot_id = _seed_slot(session_local, enabled=True)
        creative_id = _seed_creative(session_local, slot_id)

        response = client.post(
            "/ads/events",
            json={"slot_id": slot_id, "creative_id": creative_id, "event_type": "impression"},
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Event logged."

        with session_local() as db:
            events = db.query(AdEvent).all()
            assert len(events) == 1
            assert events[0].user_id is None

        ignored = client.post(
            "/ads/events",
            json={"slot_id": slot_id, "creative_id": creative_id + 999, "event_type": "click"},
        )
        assert ignored.status_code == 200
        assert ignored.json()["message"] == "Event ignored."
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_admin_ad_endpoints_require_admin_role(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        slot_id = _seed_slot(session_local, enabled=False)
        _seed_creative(session_local, slot_id, status="draft")

        assert client.get("/admin/ads/slots").status_code == 401

        _signup(client, "plain-admin-check@example.com", "plain_admin_check")
        assert client.get("/admin/ads/slots").status_code == 403
        assert client.get("/admin/ads/creatives").status_code == 403

        with session_local() as db:
            admin = db.query(User).filter(User.email == "plain-admin-check@example.com").one()
            admin.role = "admin"
            db.commit()

        slots_response = client.get("/admin/ads/slots")
        creatives_response = client.get("/admin/ads/creatives")

        assert slots_response.status_code == 200
        assert creatives_response.status_code == 200
        assert slots_response.json()[0]["placement"] == "dashboard_top"

        patch_slot = client.patch(f"/admin/ads/slots/{slot_id}", json={"enabled": True, "priority": 200})
        assert patch_slot.status_code == 200
        assert patch_slot.json()["enabled"] is True

        create_creative = client.post(
            "/admin/ads/creatives",
            json={
                "slot_id": slot_id,
                "title": "New sponsored creative",
                "body_copy": "New creative body",
                "target_url": "https://example.com/new",
                "cta_label": "Visit",
                "status": "active",
            },
        )
        assert create_creative.status_code == 200
        creative_id = create_creative.json()["id"]

        patch_creative = client.patch(
            f"/admin/ads/creatives/{creative_id}",
            json={"status": "paused", "cta_label": "Updated"},
        )
        assert patch_creative.status_code == 200
        assert patch_creative.json()["status"] == "paused"
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
