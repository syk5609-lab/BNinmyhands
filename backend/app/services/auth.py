import base64
import hashlib
import hmac
import logging
import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta

from fastapi import HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth_schemas import CurrentUserPayload, ProfilePayload, UpdateProfileRequest
from app.config import settings
from app.db.models import AuthSession, EmailVerificationToken, PasswordResetToken, Profile, User
from app.logging_utils import log_event
from app.services.mailer import send_email_verification, send_password_reset

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_NICKNAME_RE = re.compile(r"[^a-zA-Z0-9_-]+")
_SCRYPT_N = 2**14
_SCRYPT_R = 8
_SCRYPT_P = 1
_SCRYPT_DKLEN = 64
logger = logging.getLogger(__name__)


@dataclass
class AuthContext:
    user: User
    profile: Profile
    session: AuthSession


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str) -> str:
    normalized = normalize_email(email)
    if not _EMAIL_RE.match(normalized):
        raise HTTPException(status_code=422, detail="Invalid email address.")
    return normalized


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value.encode("utf-8"))


def hash_password(password: str) -> str:
    validate_password_strength(password)
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=_SCRYPT_N,
        r=_SCRYPT_R,
        p=_SCRYPT_P,
        dklen=_SCRYPT_DKLEN,
    )
    return f"scrypt${_SCRYPT_N}${_SCRYPT_R}${_SCRYPT_P}${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, n, r, p, salt_raw, digest_raw = stored_hash.split("$", 5)
    except ValueError:
        return False
    if algorithm != "scrypt":
        return False
    derived = hashlib.scrypt(
        password.encode("utf-8"),
        salt=_b64decode(salt_raw),
        n=int(n),
        r=int(r),
        p=int(p),
        dklen=_SCRYPT_DKLEN,
    )
    return hmac.compare_digest(_b64encode(derived), digest_raw)


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def _sanitize_nickname(value: str) -> str:
    nickname = _NICKNAME_RE.sub("_", value.strip())
    nickname = nickname.strip("_-")
    return nickname[:32] or "user"


def _get_profile(db: Session, user_id: int) -> Profile:
    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    if profile:
        return profile
    profile = Profile(user_id=user_id)
    db.add(profile)
    db.flush()
    return profile


def ensure_unique_nickname(db: Session, desired: str, exclude_user_id: int | None = None) -> str:
    base = _sanitize_nickname(desired)
    candidate = base
    suffix = 1
    while True:
        stmt = select(User).where(User.nickname == candidate)
        existing = db.scalar(stmt)
        if not existing or (exclude_user_id is not None and existing.id == exclude_user_id):
            return candidate
        suffix += 1
        candidate = f"{base}_{suffix}"


def build_default_nickname(email: str) -> str:
    return _sanitize_nickname(email.split("@", 1)[0])


def user_to_payload(user: User, profile: Profile | None = None) -> CurrentUserPayload:
    profile_obj = profile or Profile(user_id=user.id, bio=None, avatar_url=None)
    return CurrentUserPayload(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        role=user.role,
        status=user.status,
        email_verified_at=user.email_verified_at,
        profile=ProfilePayload(
            bio=profile_obj.bio,
            avatar_url=profile_obj.avatar_url,
        ),
    )


def create_user_with_profile(db: Session, email: str, password: str, nickname: str | None) -> tuple[User, Profile]:
    normalized_email = validate_email(email)
    if db.scalar(select(User).where(User.email == normalized_email)):
        log_event(logger, "auth_signup_conflict", email=normalized_email)
        raise HTTPException(status_code=409, detail="An account with that email already exists.")

    final_nickname = ensure_unique_nickname(db, nickname or build_default_nickname(normalized_email))
    user = User(
        email=normalized_email,
        nickname=final_nickname,
        password_hash=hash_password(password),
        role="user",
        status="active",
    )
    db.add(user)
    db.flush()

    profile = Profile(user_id=user.id)
    db.add(profile)
    db.flush()
    log_event(logger, "auth_signup", user_id=user.id, email=user.email, nickname=user.nickname)
    return user, profile


def authenticate_user(db: Session, email: str, password: str) -> tuple[User, Profile]:
    normalized_email = validate_email(email)
    user = db.scalar(select(User).where(User.email == normalized_email))
    if not user or not verify_password(password, user.password_hash):
        log_event(logger, "auth_login_failed", email=normalized_email)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if user.status in {"restricted", "disabled"}:
        log_event(logger, "auth_login_blocked", user_id=user.id, status=user.status)
        raise HTTPException(status_code=403, detail="This account cannot sign in.")
    log_event(logger, "auth_login", user_id=user.id, email=user.email)
    return user, _get_profile(db, user.id)


def create_session(db: Session, user: User, request: Request) -> str:
    raw_token = generate_token()
    now = datetime.utcnow()
    session = AuthSession(
        user_id=user.id,
        session_token_hash=hash_token(raw_token),
        expires_at=now + timedelta(seconds=settings.session_duration_seconds),
        last_seen_at=now,
        user_agent=request.headers.get("user-agent"),
        ip_address=(request.client.host if request.client else None),
    )
    db.add(session)
    db.flush()
    log_event(logger, "auth_session_created", user_id=user.id, session_id=session.id, ip_address=session.ip_address)
    return raw_token


def revoke_session(db: Session, session: AuthSession) -> None:
    if session.revoked_at is None:
        session.revoked_at = datetime.utcnow()
        db.flush()
        log_event(logger, "auth_session_revoked", session_id=session.id, user_id=session.user_id)


def revoke_all_user_sessions(db: Session, user_id: int) -> None:
    now = datetime.utcnow()
    revoked_count = 0
    for session in db.scalars(select(AuthSession).where(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))).all():
        session.revoked_at = now
        revoked_count += 1
    db.flush()
    log_event(logger, "auth_all_sessions_revoked", user_id=user_id, revoked_count=revoked_count)


def set_session_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=raw_token,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        max_age=settings.session_duration_seconds,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(settings.session_cookie_name, path="/")


def _session_expired(session: AuthSession) -> bool:
    return session.expires_at <= datetime.utcnow()


def get_optional_auth_context(db: Session, request: Request) -> AuthContext | None:
    raw_token = request.cookies.get(settings.session_cookie_name)
    if not raw_token:
        return None

    session = db.scalar(select(AuthSession).where(AuthSession.session_token_hash == hash_token(raw_token)))
    if not session or session.revoked_at is not None or _session_expired(session):
        if session and session.revoked_at is None and _session_expired(session):
            session.revoked_at = datetime.utcnow()
            db.commit()
            log_event(logger, "auth_invalid_session", reason="expired", session_id=session.id, user_id=session.user_id)
        elif session and session.revoked_at is not None:
            log_event(logger, "auth_invalid_session", reason="revoked", session_id=session.id, user_id=session.user_id)
        else:
            log_event(logger, "auth_invalid_session", reason="not_found")
        return None

    user = db.scalar(select(User).where(User.id == session.user_id))
    if not user or user.status in {"restricted", "disabled"}:
        log_event(logger, "auth_invalid_session", reason="user_unavailable", session_id=session.id, user_id=session.user_id)
        return None

    profile = _get_profile(db, user.id)
    if (
        session.last_seen_at is None
        or (datetime.utcnow() - session.last_seen_at).total_seconds() >= settings.session_last_seen_update_seconds
    ):
        session.last_seen_at = datetime.utcnow()
        db.commit()
        db.refresh(session)
    return AuthContext(user=user, profile=profile, session=session)


def require_auth_context(db: Session, request: Request) -> AuthContext:
    context = get_optional_auth_context(db, request)
    if not context:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return context


def role_guard(*allowed_roles: str):
    def _guard(context: AuthContext) -> AuthContext:
        if context.user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions.")
        return context

    return _guard


def create_email_verification_token(db: Session, user: User) -> str | None:
    for token in db.scalars(
        select(EmailVerificationToken).where(
            EmailVerificationToken.user_id == user.id,
            EmailVerificationToken.used_at.is_(None),
        )
    ).all():
        token.used_at = datetime.utcnow()

    raw_token = generate_token()
    db.add(
        EmailVerificationToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.utcnow() + timedelta(seconds=settings.email_verification_token_ttl_seconds),
        )
    )
    db.flush()
    log_event(logger, "auth_email_verification_created", user_id=user.id)
    return send_email_verification(user.email, raw_token)


def consume_email_verification_token(db: Session, token: str) -> User:
    record = db.scalar(select(EmailVerificationToken).where(EmailVerificationToken.token_hash == hash_token(token)))
    if not record or record.used_at is not None or record.expires_at <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")

    user = db.scalar(select(User).where(User.id == record.user_id))
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")

    record.used_at = datetime.utcnow()
    if user.email_verified_at is None:
        user.email_verified_at = datetime.utcnow()
    db.flush()
    log_event(logger, "auth_email_verified", user_id=user.id)
    return user


def create_password_reset_token(db: Session, user: User) -> str | None:
    for token in db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
    ).all():
        token.used_at = datetime.utcnow()

    raw_token = generate_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.utcnow() + timedelta(seconds=settings.password_reset_token_ttl_seconds),
        )
    )
    db.flush()
    log_event(logger, "auth_password_reset_created", user_id=user.id)
    return send_password_reset(user.email, raw_token)


def consume_password_reset_token(db: Session, token: str, new_password: str) -> tuple[User, Profile]:
    validate_password_strength(new_password)
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_token(token)))
    if not record or record.used_at is not None or record.expires_at <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")

    user = db.scalar(select(User).where(User.id == record.user_id))
    if not user:
        raise HTTPException(status_code=400, detail="Invalid password reset token.")

    record.used_at = datetime.utcnow()
    user.password_hash = hash_password(new_password)
    revoke_all_user_sessions(db, user.id)
    db.flush()
    log_event(logger, "auth_password_reset_completed", user_id=user.id)
    return user, _get_profile(db, user.id)


def update_profile(db: Session, user: User, payload: UpdateProfileRequest) -> tuple[User, Profile]:
    profile = _get_profile(db, user.id)

    if payload.nickname is not None:
        user.nickname = ensure_unique_nickname(db, payload.nickname, exclude_user_id=user.id)
    if payload.bio is not None:
        profile.bio = payload.bio.strip() or None
    if payload.avatar_url is not None:
        profile.avatar_url = payload.avatar_url.strip() or None

    user.updated_at = datetime.utcnow()
    profile.updated_at = datetime.utcnow()
    db.flush()
    return user, profile


def unauthenticated_response() -> Response:
    response = Response(status_code=status.HTTP_401_UNAUTHORIZED)
    clear_session_cookie(response)
    response.body = b'{"detail":"Authentication required."}'
    response.media_type = "application/json"
    return response
