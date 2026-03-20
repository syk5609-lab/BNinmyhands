from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import BigInteger, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models import AdCreative, AdSlot, FeatureFlag, User
from app.db.session import get_db
from app.main import app


@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(_type, _compiler, **_kwargs):
    return "JSON"


@compiles(BigInteger, "sqlite")
def _compile_bigint_sqlite(_type, _compiler, **_kwargs):
    return "INTEGER"


def _make_client(tmp_path: Path):
    db_path = tmp_path / "feature-flags-test.db"
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


def _set_flag(session_local, key: str, enabled: bool):
    with session_local() as db:
        flag = db.query(FeatureFlag).filter(FeatureFlag.key == key).one_or_none()
        if not flag:
            flag = FeatureFlag(key=key, enabled=enabled)
            db.add(flag)
        else:
            flag.enabled = enabled
        db.commit()


def _seed_slot_and_creative(session_local):
    with session_local() as db:
        slot = AdSlot(
            placement="dashboard_top",
            label="Dashboard Top",
            enabled=True,
            priority=100,
        )
        db.add(slot)
        db.flush()
        creative = AdCreative(
            slot_id=slot.id,
            title="Launch sponsor",
            body_copy="Calm sponsored copy",
            target_url="https://example.com/sponsor",
            cta_label="Visit",
            status="active",
        )
        db.add(creative)
        db.commit()
        db.refresh(slot)
        db.refresh(creative)
        return slot.id, creative.id


def test_runtime_flags_are_public_and_admin_feature_flag_endpoints_require_admin(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        response = client.get("/runtime/flags")
        assert response.status_code == 200
        assert response.json()["community_enabled"] is True

        assert client.get("/admin/feature-flags").status_code == 401

        _signup(client, "plain-flags@example.com", "plain_flags")
        assert client.get("/admin/feature-flags").status_code == 403

        with session_local() as db:
            admin = db.query(User).filter(User.email == "plain-flags@example.com").one()
            admin.role = "admin"
            db.commit()

        admin_response = client.get("/admin/feature-flags")
        assert admin_response.status_code == 200
        assert {item["key"] for item in admin_response.json()} == {
            "community_enabled",
            "ads_enabled",
            "write_actions_enabled",
        }

        patch_response = client.patch("/admin/feature-flags/community_enabled", json={"enabled": False})
        assert patch_response.status_code == 200
        assert patch_response.json()["enabled"] is False
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_community_enabled_flag_hides_public_community_reads(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        _signup(client, "community-flags@example.com", "community_flags")
        create_response = client.post(
            "/community/posts",
            json={"symbol": "BTCUSDT", "body": "Watching this setup with clean invalidation."},
        )
        assert create_response.status_code == 200

        _set_flag(session_local, "community_enabled", False)

        posts_response = client.get("/community/posts?symbol=BTCUSDT")
        latest_response = client.get("/community/latest")
        blocked_create = client.post(
            "/community/posts",
            json={"symbol": "BTCUSDT", "body": "Another note that should be blocked."},
        )

        assert posts_response.status_code == 200
        assert posts_response.json() == []
        assert latest_response.status_code == 200
        assert latest_response.json() == []
        assert blocked_create.status_code == 403
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_write_actions_enabled_flag_preserves_read_only_community_but_blocks_mutations(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        _signup(client, "author-flags@example.com", "author_flags")
        post_response = client.post(
            "/community/posts",
            json={"symbol": "ETHUSDT", "body": "Read-only should still keep this visible."},
        )
        assert post_response.status_code == 200
        post_id = post_response.json()["id"]
        client.post("/auth/logout")

        _signup(client, "reporter-flags@example.com", "reporter_flags")
        _set_flag(session_local, "write_actions_enabled", False)

        read_response = client.get("/community/posts?symbol=ETHUSDT")
        create_response = client.post(
            "/community/posts",
            json={"symbol": "ETHUSDT", "body": "This write should be blocked by the flag."},
        )
        report_response = client.post("/community/reports", json={"post_id": post_id, "reason": "spam"})
        delete_response = client.delete(f"/community/posts/{post_id}")

        assert read_response.status_code == 200
        assert len(read_response.json()) == 1
        assert create_response.status_code == 403
        assert report_response.status_code == 403
        assert delete_response.status_code == 403
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_ads_enabled_flag_disables_public_ads_without_breaking_endpoint(tmp_path):
    client, session_local, engine = _make_client(tmp_path)
    try:
        slot_id, creative_id = _seed_slot_and_creative(session_local)

        ads_response = client.get("/ads/slots?placement=dashboard_top")
        assert ads_response.status_code == 200
        assert len(ads_response.json()) == 1

        _set_flag(session_local, "ads_enabled", False)

        disabled_response = client.get("/ads/slots?placement=dashboard_top")
        event_response = client.post(
            "/ads/events",
            json={"slot_id": slot_id, "creative_id": creative_id, "event_type": "impression"},
        )

        assert disabled_response.status_code == 200
        assert disabled_response.json() == []
        assert event_response.status_code == 200
        assert event_response.json()["message"] == "Event ignored."
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
