from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.models import AdCreative, AdEvent, AdSlot


class AdRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_slots(self) -> list[AdSlot]:
        stmt = select(AdSlot).order_by(AdSlot.priority.desc(), AdSlot.created_at.asc())
        return list(self.db.scalars(stmt).all())

    def get_slot(self, slot_id: int) -> AdSlot | None:
        return self.db.scalar(select(AdSlot).where(AdSlot.id == slot_id).limit(1))

    def list_slots_for_placement(self, placement: str) -> list[AdSlot]:
        stmt = (
            select(AdSlot)
            .where(AdSlot.placement == placement, AdSlot.enabled.is_(True))
            .order_by(AdSlot.priority.desc(), AdSlot.created_at.asc())
        )
        return list(self.db.scalars(stmt).all())

    def update_slot(self, slot: AdSlot) -> AdSlot:
        slot.updated_at = datetime.utcnow()
        self.db.flush()
        return slot

    def list_creatives(self) -> list[AdCreative]:
        stmt = select(AdCreative).options(joinedload(AdCreative.slot)).order_by(AdCreative.updated_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_creative(self, creative_id: int) -> AdCreative | None:
        stmt = (
            select(AdCreative)
            .options(joinedload(AdCreative.slot))
            .where(AdCreative.id == creative_id)
            .limit(1)
        )
        return self.db.scalar(stmt)

    def list_creatives_for_slot(self, slot_id: int) -> list[AdCreative]:
        stmt = (
            select(AdCreative)
            .options(joinedload(AdCreative.slot))
            .where(AdCreative.slot_id == slot_id)
            .order_by(AdCreative.updated_at.desc(), AdCreative.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create_creative(self, **kwargs) -> AdCreative:
        creative = AdCreative(**kwargs)
        self.db.add(creative)
        self.db.flush()
        return self.get_creative(creative.id) or creative

    def update_creative(self, creative: AdCreative) -> AdCreative:
        creative.updated_at = datetime.utcnow()
        self.db.flush()
        return self.get_creative(creative.id) or creative

    def create_event(self, slot_id: int, creative_id: int, event_type: str, user_id: int | None) -> AdEvent:
        event = AdEvent(
            slot_id=slot_id,
            creative_id=creative_id,
            event_type=event_type,
            user_id=user_id,
        )
        self.db.add(event)
        self.db.flush()
        return event
