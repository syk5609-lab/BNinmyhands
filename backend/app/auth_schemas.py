from datetime import datetime

from pydantic import BaseModel, Field


class ProfilePayload(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None


class CurrentUserPayload(BaseModel):
    id: int
    email: str
    nickname: str
    role: str
    status: str
    email_verified_at: datetime | None = None
    profile: ProfilePayload


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=256)
    nickname: str | None = Field(default=None, min_length=3, max_length=64)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=256)


class SignupResponse(BaseModel):
    user: CurrentUserPayload
    email_verification_required: bool = True
    verification_token_preview: str | None = None


class LoginResponse(BaseModel):
    user: CurrentUserPayload


class MessageResponse(BaseModel):
    message: str
    token_preview: str | None = None


class VerifyRequest(BaseModel):
    email: str


class VerifyConfirmRequest(BaseModel):
    token: str


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=256)


class UpdateProfileRequest(BaseModel):
    nickname: str | None = Field(default=None, min_length=3, max_length=64)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: str | None = Field(default=None, max_length=512)
