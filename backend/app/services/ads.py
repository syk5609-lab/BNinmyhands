from datetime import datetime
import logging
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.ads_schemas import (
    AdminAdCreativePayload,
    AdminAdSlotPayload,
    AdSlotRenderPayload,
)
from app.auth_schemas import MessageResponse
from app.logging_utils import log_event as write_log_event
from app.repositories.ad_repository import AdRepository
from app.services.feature_flags import is_flag_enabled

_VALID_PLACEMENTS = {"dashboard_top", "dashboard_mid", "detail_bottom"}
_VALID_CREATIVE_STATUSES = {"draft", "active", "paused", "archived"}
logger = logging.getLogger(__name__)


def _validate_placement(placement: str) -> str:
    if placement not in _VALID_PLACEMENTS:
        raise HTTPException(status_code=422, detail="Invalid placement.")
    return placement


def _validate_url(value: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=422, detail="Invalid target URL.")
    return value.strip()


def _validate_optional_url(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    if stripped == "":
        return None
    return _validate_url(stripped)


def _validate_window(starts_at: datetime | None, ends_at: datetime | None) -> None:
    if starts_at and ends_at and starts_at > ends_at:
        raise HTTPException(status_code=422, detail="starts_at must be before ends_at.")


def _is_creative_live(creative, now: datetime) -> bool:
    if creative.status != "active":
        return False
    if creative.starts_at and creative.starts_at > now:
        return False
    if creative.ends_at and creative.ends_at < now:
        return False
    return True


def _slot_to_admin_schema(slot) -> AdminAdSlotPayload:
    return AdminAdSlotPayload(
        id=slot.id,
        placement=slot.placement,
        label=slot.label,
        enabled=slot.enabled,
        priority=slot.priority,
        created_at=slot.created_at,
        updated_at=slot.updated_at,
    )


def _creative_to_admin_schema(creative) -> AdminAdCreativePayload:
    return AdminAdCreativePayload(
        id=creative.id,
        slot_id=creative.slot_id,
        slot_placement=creative.slot.placement,
        title=creative.title,
        body_copy=creative.body_copy,
        image_url=creative.image_url,
        target_url=creative.target_url,
        cta_label=creative.cta_label,
        status=creative.status,
        starts_at=creative.starts_at,
        ends_at=creative.ends_at,
        created_at=creative.created_at,
        updated_at=creative.updated_at,
    )


def list_public_slots(db: Session, placement: str) -> list[AdSlotRenderPayload]:
    if not is_flag_enabled(db, "ads_enabled"):
        return []
    repo = AdRepository(db)
    now = datetime.utcnow()
    slots = repo.list_slots_for_placement(_validate_placement(placement))
    payloads: list[AdSlotRenderPayload] = []

    for slot in slots:
        creatives = repo.list_creatives_for_slot(slot.id)
        creative = next((item for item in creatives if _is_creative_live(item, now)), None)
        if not creative:
            continue
        payloads.append(
            AdSlotRenderPayload(
                id=slot.id,
                placement=slot.placement,
                label=slot.label,
                creative={
                    "id": creative.id,
                    "title": creative.title,
                    "body_copy": creative.body_copy,
                    "image_url": creative.image_url,
                    "target_url": creative.target_url,
                    "cta_label": creative.cta_label,
                },
            )
        )

    return payloads


def log_event(db: Session, slot_id: int, creative_id: int, event_type: str, user_id: int | None) -> MessageResponse:
    if not is_flag_enabled(db, "ads_enabled"):
        return MessageResponse(message="Event ignored.")
    repo = AdRepository(db)
    slot = repo.get_slot(slot_id)
    creative = repo.get_creative(creative_id)
    if not slot or not creative or creative.slot_id != slot.id or event_type not in {"impression", "click"}:
        write_log_event(logger, "ad_event_ignored", slot_id=slot_id, creative_id=creative_id, event_type=event_type, user_id=user_id)
        return MessageResponse(message="Event ignored.")

    repo.create_event(slot_id=slot.id, creative_id=creative.id, event_type=event_type, user_id=user_id)
    write_log_event(logger, "ad_event_logged", slot_id=slot.id, creative_id=creative.id, event_type=event_type, user_id=user_id)
    return MessageResponse(message="Event logged.")


def list_admin_slots(db: Session) -> list[AdminAdSlotPayload]:
    repo = AdRepository(db)
    return [_slot_to_admin_schema(slot) for slot in repo.list_slots()]


def update_admin_slot(
    db: Session,
    slot_id: int,
    *,
    label: str | None,
    enabled: bool | None,
    priority: int | None,
) -> AdminAdSlotPayload:
    repo = AdRepository(db)
    slot = repo.get_slot(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Ad slot not found.")

    if label is not None:
        slot.label = label.strip()
    if enabled is not None:
        slot.enabled = enabled
    if priority is not None:
        slot.priority = priority

    updated = repo.update_slot(slot)
    return _slot_to_admin_schema(updated)


def list_admin_creatives(db: Session) -> list[AdminAdCreativePayload]:
    repo = AdRepository(db)
    return [_creative_to_admin_schema(creative) for creative in repo.list_creatives()]


def create_admin_creative(
    db: Session,
    *,
    slot_id: int,
    title: str,
    body_copy: str | None,
    image_url: str | None,
    target_url: str,
    cta_label: str | None,
    status: str,
    starts_at: datetime | None,
    ends_at: datetime | None,
) -> AdminAdCreativePayload:
    repo = AdRepository(db)
    slot = repo.get_slot(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Ad slot not found.")
    if status not in _VALID_CREATIVE_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid creative status.")

    _validate_window(starts_at, ends_at)
    creative = repo.create_creative(
        slot_id=slot_id,
        title=title.strip(),
        body_copy=(body_copy.strip() if body_copy else None),
        image_url=_validate_optional_url(image_url),
        target_url=_validate_url(target_url),
        cta_label=(cta_label.strip() if cta_label else None),
        status=status,
        starts_at=starts_at,
        ends_at=ends_at,
    )
    return _creative_to_admin_schema(creative)


def update_admin_creative(
    db: Session,
    creative_id: int,
    *,
    title: str | None,
    body_copy: str | None,
    image_url: str | None,
    target_url: str | None,
    cta_label: str | None,
    status: str | None,
    starts_at: datetime | None,
    ends_at: datetime | None,
) -> AdminAdCreativePayload:
    repo = AdRepository(db)
    creative = repo.get_creative(creative_id)
    if not creative:
        raise HTTPException(status_code=404, detail="Ad creative not found.")
    if status is not None and status not in _VALID_CREATIVE_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid creative status.")

    next_starts_at = starts_at if starts_at is not None else creative.starts_at
    next_ends_at = ends_at if ends_at is not None else creative.ends_at
    _validate_window(next_starts_at, next_ends_at)

    if title is not None:
        creative.title = title.strip()
    if body_copy is not None:
        creative.body_copy = body_copy.strip() or None
    if image_url is not None:
        creative.image_url = _validate_optional_url(image_url)
    if target_url is not None:
        creative.target_url = _validate_url(target_url)
    if cta_label is not None:
        creative.cta_label = cta_label.strip() or None
    if status is not None:
        creative.status = status
    if starts_at is not None:
        creative.starts_at = starts_at
    if ends_at is not None:
        creative.ends_at = ends_at

    updated = repo.update_creative(creative)
    return _creative_to_admin_schema(updated)
