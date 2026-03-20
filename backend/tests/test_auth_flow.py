from pathlib import Path
from datetime import datetime, timezone

from fastapi.testclient import TestClient
from sqlalchemy import BigInteger, create_engine, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.base import Base
from app.db.models import AuthSession, User
from app.db.session import get_db
from app.main import app
from app.schemas import ScanResponse, SymbolScanResult


@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(_type, _compiler, **_kwargs):
    return "JSON"


@compiles(BigInteger, "sqlite")
def _compile_bigint_sqlite(_type, _compiler, **_kwargs):
    return "INTEGER"


def _build_public_scan() -> ScanResponse:
    return ScanResponse(
        generated_at=datetime(2026, 3, 20, tzinfo=timezone.utc),
        limit=1,
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
                data_quality_score=0.9,
            )
        ],
    )


def _make_client(tmp_path: Path):
    db_path = tmp_path / "auth-test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app)
    return client, TestingSessionLocal, engine


def test_signup_success_creates_user_and_session(tmp_path):
    client, SessionLocal, engine = _make_client(tmp_path)
    try:
        response = client.post(
            "/auth/signup",
            json={"email": "alice@example.com", "password": "topsecret123", "nickname": "alice"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["user"]["email"] == "alice@example.com"
        assert body["user"]["nickname"] == "alice"
        assert body["verification_token_preview"]
        raw_cookie = response.cookies.get(settings.session_cookie_name)
        assert raw_cookie

        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == "alice@example.com"))
            session = db.scalar(select(AuthSession).where(AuthSession.user_id == user.id))
            assert user is not None
            assert session is not None
            assert session.session_token_hash != raw_cookie
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_login_success_and_me_returns_current_user(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        signup_response = client.post(
            "/auth/signup",
            json={"email": "bob@example.com", "password": "topsecret123", "nickname": "bob"},
        )
        assert signup_response.status_code == 200
        assert client.post("/auth/logout").status_code == 200

        login_response = client.post(
            "/auth/login",
            json={"email": "bob@example.com", "password": "topsecret123"},
        )
        assert login_response.status_code == 200
        assert login_response.cookies.get(settings.session_cookie_name)

        me_response = client.get("/auth/me")
        assert me_response.status_code == 200
        assert me_response.json()["email"] == "bob@example.com"
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_logout_revokes_session_and_clears_cookie(tmp_path):
    client, SessionLocal, engine = _make_client(tmp_path)
    try:
        client.post(
            "/auth/signup",
            json={"email": "carol@example.com", "password": "topsecret123", "nickname": "carol"},
        )
        logout_response = client.post("/auth/logout")
        assert logout_response.status_code == 200
        assert settings.session_cookie_name in logout_response.headers.get("set-cookie", "")

        me_response = client.get("/auth/me")
        assert me_response.status_code == 401

        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == "carol@example.com"))
            session = db.scalar(select(AuthSession).where(AuthSession.user_id == user.id))
            assert session is not None
            assert session.revoked_at is not None
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_invalid_session_is_rejected_and_cookie_is_cleared(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        client.cookies.set(settings.session_cookie_name, "invalid-token")
        response = client.get("/auth/me")
        assert response.status_code == 401
        assert settings.session_cookie_name in response.headers.get("set-cookie", "")
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_profile_update_requires_auth(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        response = client.patch("/account/profile", json={"nickname": "anon"})
        assert response.status_code == 401
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_guest_can_still_access_existing_read_only_flow(tmp_path, monkeypatch):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        import app.main as main_module

        monkeypatch.setattr(main_module, "build_scan", lambda limit, volume_percentile, timeframe: _build_public_scan())
        response = client.get("/api/scan/today?timeframe=1h")
        assert response.status_code == 200
        assert response.json()["results"][0]["symbol"] == "BTCUSDT"
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
