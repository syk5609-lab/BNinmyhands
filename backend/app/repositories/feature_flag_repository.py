from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import FeatureFlag


class FeatureFlagRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_flags(self) -> list[FeatureFlag]:
        stmt = select(FeatureFlag).order_by(FeatureFlag.key.asc())
        return list(self.db.scalars(stmt).all())

    def get_flag(self, key: str) -> FeatureFlag | None:
        return self.db.scalar(select(FeatureFlag).where(FeatureFlag.key == key).limit(1))

    def ensure_flag(self, key: str, enabled: bool) -> FeatureFlag:
        flag = self.get_flag(key)
        if flag:
            return flag
        flag = FeatureFlag(key=key, enabled=enabled)
        self.db.add(flag)
        self.db.flush()
        return flag

    def update_flag(self, flag: FeatureFlag, enabled: bool) -> FeatureFlag:
        flag.enabled = enabled
        flag.updated_at = datetime.utcnow()
        self.db.flush()
        return flag
