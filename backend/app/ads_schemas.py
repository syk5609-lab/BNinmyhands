from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AdPlacement = Literal["dashboard_top", "dashboard_mid", "detail_bottom"]
AdCreativeStatus = Literal["draft", "active", "paused", "archived"]
AdEventType = Literal["impression", "click"]


class AdCreativeRenderPayload(BaseModel):
    id: int
    title: str
    body_copy: str | None = None
    image_url: str | None = None
    target_url: str
    cta_label: str | None = None


class AdSlotRenderPayload(BaseModel):
    id: int
    placement: AdPlacement
    label: str
    creative: AdCreativeRenderPayload


class AdEventRequest(BaseModel):
    slot_id: int = Field(ge=1)
    creative_id: int = Field(ge=1)
    event_type: AdEventType


class AdminAdSlotPayload(BaseModel):
    id: int
    placement: AdPlacement
    label: str
    enabled: bool
    priority: int
    created_at: datetime
    updated_at: datetime


class AdminAdSlotUpdateRequest(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=128)
    enabled: bool | None = None
    priority: int | None = Field(default=None, ge=0, le=1000)


class AdminAdCreativePayload(BaseModel):
    id: int
    slot_id: int
    slot_placement: AdPlacement
    title: str
    body_copy: str | None = None
    image_url: str | None = None
    target_url: str
    cta_label: str | None = None
    status: AdCreativeStatus
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class AdminAdCreativeCreateRequest(BaseModel):
    slot_id: int = Field(ge=1)
    title: str = Field(min_length=2, max_length=160)
    body_copy: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=1000)
    target_url: str = Field(min_length=8, max_length=1000)
    cta_label: str | None = Field(default=None, max_length=80)
    status: AdCreativeStatus = "draft"
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class AdminAdCreativeUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=160)
    body_copy: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=1000)
    target_url: str | None = Field(default=None, min_length=8, max_length=1000)
    cta_label: str | None = Field(default=None, max_length=80)
    status: AdCreativeStatus | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
