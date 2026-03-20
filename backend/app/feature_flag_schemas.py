from datetime import datetime
from typing import Literal

from pydantic import BaseModel


FeatureFlagKey = Literal["community_enabled", "ads_enabled", "write_actions_enabled"]


class RuntimeFeatureFlagsPayload(BaseModel):
    community_enabled: bool
    ads_enabled: bool
    write_actions_enabled: bool


class AdminFeatureFlagPayload(BaseModel):
    key: FeatureFlagKey
    enabled: bool
    updated_at: datetime


class AdminFeatureFlagUpdateRequest(BaseModel):
    enabled: bool
