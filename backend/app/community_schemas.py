from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


CommunityPostStatus = Literal["active", "hidden", "deleted"]
CommunityReportReason = Literal["spam", "impersonation", "scam_or_promo", "harassment", "other"]
CommunityReportStatus = Literal["open", "hidden", "no_action", "resolved"]


class CommunityAuthorPayload(BaseModel):
    id: int
    nickname: str
    role: str


class CommunityPostPayload(BaseModel):
    id: int
    symbol: str
    run_id: int | None = None
    timeframe: str | None = None
    body: str
    status: CommunityPostStatus
    created_at: datetime
    updated_at: datetime
    author: CommunityAuthorPayload


class CommunityCreatePostRequest(BaseModel):
    symbol: str = Field(min_length=2, max_length=32)
    run_id: int | None = Field(default=None, ge=1)
    body: str = Field(min_length=8, max_length=1200)


class CommunityReportCreateRequest(BaseModel):
    post_id: int = Field(ge=1)
    reason: CommunityReportReason


class CommunityModerationActionRequest(BaseModel):
    moderator_note: str | None = Field(default=None, max_length=1000)


class CommunityReportPayload(BaseModel):
    id: int
    reason: CommunityReportReason
    status: CommunityReportStatus
    moderator_note: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None
    reporter: CommunityAuthorPayload
    post: CommunityPostPayload
