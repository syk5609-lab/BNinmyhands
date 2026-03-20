import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.feature_flag_schemas import AdminFeatureFlagPayload, RuntimeFeatureFlagsPayload
from app.logging_utils import log_event
from app.repositories.feature_flag_repository import FeatureFlagRepository

logger = logging.getLogger(__name__)

DEFAULT_FEATURE_FLAGS = {
    "community_enabled": True,
    "ads_enabled": True,
    "write_actions_enabled": True,
}


def _validate_flag_key(key: str) -> str:
    if key not in DEFAULT_FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found.")
    return key


def _flag_to_admin_schema(flag) -> AdminFeatureFlagPayload:
    return AdminFeatureFlagPayload(
        key=flag.key,
        enabled=flag.enabled,
        updated_at=flag.updated_at,
    )


def _ensure_defaults(db: Session) -> FeatureFlagRepository:
    repo = FeatureFlagRepository(db)
    for key, enabled in DEFAULT_FEATURE_FLAGS.items():
        repo.ensure_flag(key, enabled)
    return repo


def get_runtime_flags(db: Session) -> RuntimeFeatureFlagsPayload:
    repo = _ensure_defaults(db)
    flags = {flag.key: flag.enabled for flag in repo.list_flags()}
    return RuntimeFeatureFlagsPayload(
        community_enabled=flags.get("community_enabled", DEFAULT_FEATURE_FLAGS["community_enabled"]),
        ads_enabled=flags.get("ads_enabled", DEFAULT_FEATURE_FLAGS["ads_enabled"]),
        write_actions_enabled=flags.get("write_actions_enabled", DEFAULT_FEATURE_FLAGS["write_actions_enabled"]),
    )


def is_flag_enabled(db: Session, key: str) -> bool:
    repo = _ensure_defaults(db)
    key = _validate_flag_key(key)
    flag = repo.get_flag(key)
    if not flag:
        return DEFAULT_FEATURE_FLAGS[key]
    return flag.enabled


def list_admin_flags(db: Session) -> list[AdminFeatureFlagPayload]:
    repo = _ensure_defaults(db)
    return [_flag_to_admin_schema(flag) for flag in repo.list_flags()]


def update_admin_flag(db: Session, key: str, enabled: bool, actor_user_id: int) -> AdminFeatureFlagPayload:
    repo = _ensure_defaults(db)
    key = _validate_flag_key(key)
    flag = repo.get_flag(key)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found.")
    repo.update_flag(flag, enabled)
    log_event(
        logger,
        "feature_flag_updated",
        key=key,
        enabled=enabled,
        actor_user_id=actor_user_id,
    )
    return _flag_to_admin_schema(flag)
