from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import BigInteger, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.models import User
from app.db.session import get_db
from app.main import app


@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(_type, _compiler, **_kwargs):
    return "JSON"


@compiles(BigInteger, "sqlite")
def _compile_bigint_sqlite(_type, _compiler, **_kwargs):
    return "INTEGER"


def _make_client(tmp_path: Path):
    db_path = tmp_path / "community-test.db"
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


def _signup(client: TestClient, email: str, nickname: str):
    response = client.post(
        "/auth/signup",
        json={"email": email, "password": "topsecret123", "nickname": nickname},
    )
    assert response.status_code == 200
    return response


def _create_post(client: TestClient, symbol: str = "BTCUSDT", run_id: int | None = None, body: str = "Watching basis and OI build here.") -> dict:
    response = client.post(
        "/community/posts",
        json={"symbol": symbol, "run_id": run_id, "body": body},
    )
    assert response.status_code == 200
    return response.json()


def test_guest_can_read_discussion(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "reader@example.com", "reader")
        _create_post(client)
        client.post("/auth/logout")

        response = client.get("/community/posts?symbol=BTCUSDT")
        latest_response = client.get("/community/latest")

        assert response.status_code == 200
        assert response.json()[0]["symbol"] == "BTCUSDT"
        assert latest_response.status_code == 200
        assert latest_response.json()[0]["body"] == "Watching basis and OI build here."
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_guest_cannot_create_delete_or_report(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        assert client.post("/community/posts", json={"symbol": "BTCUSDT", "body": "Guest attempt post"}).status_code == 401
        assert client.delete("/community/posts/1").status_code == 401
        assert client.post("/community/reports", json={"post_id": 1, "reason": "spam"}).status_code == 401
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_authenticated_user_can_create_post(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "poster@example.com", "poster")
        response = client.post(
            "/community/posts",
            json={"symbol": "ETHUSDT", "body": "Positioning looks cleaner than price action suggests."},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["symbol"] == "ETHUSDT"
        assert body["author"]["nickname"] == "poster"
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_user_can_delete_own_post(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "owner@example.com", "owner")
        post = _create_post(client)

        response = client.delete(f"/community/posts/{post['id']}")
        assert response.status_code == 200

        public_response = client.get("/community/posts?symbol=BTCUSDT")
        assert public_response.status_code == 200
        assert public_response.json() == []
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_user_cannot_delete_another_users_post(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "owner2@example.com", "owner2")
        post = _create_post(client)
        client.post("/auth/logout")
        _signup(client, "other@example.com", "other")

        response = client.delete(f"/community/posts/{post['id']}")
        assert response.status_code == 403
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_authenticated_user_can_report_post(tmp_path):
    client, _SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "author@example.com", "author")
        post = _create_post(client)
        client.post("/auth/logout")
        _signup(client, "reporter@example.com", "reporter")

        response = client.post("/community/reports", json={"post_id": post["id"], "reason": "spam"})
        assert response.status_code == 200
        assert response.json()["message"] == "Report submitted."
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_moderation_endpoints_require_moderator_or_admin(tmp_path):
    client, SessionLocal, engine = _make_client(tmp_path)
    try:
        _signup(client, "mod-author@example.com", "mod_author")
        post = _create_post(client)
        client.post("/auth/logout")
        _signup(client, "report-user@example.com", "report_user")
        report_response = client.post("/community/reports", json={"post_id": post["id"], "reason": "spam"})
        assert report_response.status_code == 200
        client.post("/auth/logout")
        _signup(client, "plain@example.com", "plain")

        assert client.get("/admin/reports").status_code == 403
        assert client.post(f"/admin/reports/1/hide-post", json={"moderator_note": "hide"}).status_code == 403

        with SessionLocal() as db:
            moderator = db.query(User).filter(User.email == "plain@example.com").one()
            moderator.role = "moderator"
            db.commit()

        admin_list = client.get("/admin/reports")
        assert admin_list.status_code == 200
        assert admin_list.json()[0]["reason"] == "spam"

        hide_response = client.post(f"/admin/reports/1/hide-post", json={"moderator_note": "Obvious promo"})
        assert hide_response.status_code == 200
        assert hide_response.json()["status"] == "hidden"

        public_response = client.get("/community/posts?symbol=BTCUSDT")
        assert public_response.status_code == 200
        assert public_response.json() == []
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
