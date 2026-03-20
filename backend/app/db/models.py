from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Exchange(Base):
    __tablename__ = "exchanges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Instrument(Base):
    __tablename__ = "instruments"
    __table_args__ = (
        UniqueConstraint("exchange_id", "symbol", name="uq_instruments_exchange_symbol"),
        Index("ix_instruments_exchange_asset", "exchange_id", "asset_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    exchange_id: Mapped[int] = mapped_column(ForeignKey("exchanges.id", ondelete="RESTRICT"), index=True)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    symbol: Mapped[str] = mapped_column(String(32), index=True)
    quote_asset: Mapped[str] = mapped_column(String(32), default="USDT")
    contract_type: Mapped[str] = mapped_column(String(32), default="PERPETUAL")
    status: Mapped[str] = mapped_column(String(32), default="TRADING")
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    exchange: Mapped[Exchange] = relationship()
    asset: Mapped[Asset | None] = relationship()


class MarketSnapshot(Base):
    __tablename__ = "market_snapshots"
    __table_args__ = (
        UniqueConstraint("instrument_id", "ts", name="uq_market_snapshots_instrument_ts"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    last_price: Mapped[float] = mapped_column(Float)
    price_change_percent_24h: Mapped[float] = mapped_column(Float)
    quote_volume_24h: Mapped[float] = mapped_column(Float)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class OISnapshot(Base):
    __tablename__ = "oi_snapshots"
    __table_args__ = (
        UniqueConstraint("instrument_id", "ts", name="uq_oi_snapshots_instrument_ts"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    oi_change_percent_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class FundingSnapshot(Base):
    __tablename__ = "funding_snapshots"
    __table_args__ = (
        UniqueConstraint("instrument_id", "ts", name="uq_funding_snapshots_instrument_ts"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    funding_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class PositioningSnapshot(Base):
    __tablename__ = "positioning_snapshots"
    __table_args__ = (
        UniqueConstraint("instrument_id", "ts", name="uq_positioning_snapshots_instrument_ts"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    taker_net_flow_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    long_short_ratio_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class SignalRun(Base):
    __tablename__ = "signal_runs"
    __table_args__ = (Index("ix_signal_runs_timeframe_started", "timeframe", "started_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    timeframe: Mapped[str] = mapped_column(String(8), index=True)
    limit: Mapped[int] = mapped_column(Integer)
    volume_percentile: Mapped[float] = mapped_column(Float)
    feature_version: Mapped[str] = mapped_column(String(32), default="v1")
    signal_version: Mapped[str] = mapped_column(String(32), default="v1")
    input_params: Mapped[dict] = mapped_column(JSONB)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)


class SignalScore(Base):
    __tablename__ = "signal_scores"
    __table_args__ = (
        UniqueConstraint("signal_run_id", "instrument_id", "score_type", name="uq_signal_scores_run_inst_type"),
        Index("ix_signal_scores_type_value", "score_type", "score_value"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    signal_run_id: Mapped[int] = mapped_column(ForeignKey("signal_runs.id", ondelete="CASCADE"), index=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    score_type: Mapped[str] = mapped_column(String(32), index=True)
    score_value: Mapped[float] = mapped_column(Float)


class SignalSnapshot(Base):
    __tablename__ = "signal_snapshots"
    __table_args__ = (
        UniqueConstraint("signal_run_id", "instrument_id", name="uq_signal_snapshots_run_instrument"),
        Index("ix_signal_snapshots_run_composite", "signal_run_id", "composite_score"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    signal_run_id: Mapped[int] = mapped_column(ForeignKey("signal_runs.id", ondelete="CASCADE"), index=True)
    instrument_id: Mapped[int] = mapped_column(ForeignKey("instruments.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    symbol: Mapped[str] = mapped_column(String(32), index=True)
    last_price: Mapped[float] = mapped_column(Float)
    price_change_percent_24h: Mapped[float] = mapped_column(Float)
    quote_volume_24h: Mapped[float] = mapped_column(Float)

    heat_score: Mapped[float] = mapped_column(Float)
    momentum_score: Mapped[float] = mapped_column(Float)
    setup_score: Mapped[float] = mapped_column(Float)
    positioning_score: Mapped[float] = mapped_column(Float)
    early_signal_score: Mapped[float] = mapped_column(Float)
    risk_penalty: Mapped[float] = mapped_column(Float)
    composite_score: Mapped[float] = mapped_column(Float)

    signal_bucket: Mapped[str] = mapped_column(String(32), default="positioning_build")
    reason_tags: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    previous_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rank_change: Mapped[int | None] = mapped_column(Integer, nullable=True)
    previous_composite_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    composite_delta: Mapped[float | None] = mapped_column(Float, nullable=True)
    setup_delta: Mapped[float | None] = mapped_column(Float, nullable=True)
    positioning_delta: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_quality_score: Mapped[float] = mapped_column(Float, default=1.0)

    oi_change_percent_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    taker_net_flow_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    long_short_ratio_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    funding_rate_latest: Mapped[float | None] = mapped_column(Float, nullable=True)
    funding_rate_abs: Mapped[float | None] = mapped_column(Float, nullable=True)
    funding_bias: Mapped[str | None] = mapped_column(String(16), nullable=True)

    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_role", "role"),
        Index("ix_users_status", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    nickname: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    role: Mapped[str] = mapped_column(String(16), default="user")
    status: Mapped[str] = mapped_column(String(16), default="active")
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship()


class AuthSession(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        UniqueConstraint("session_token_hash", name="uq_sessions_token_hash"),
        Index("ix_sessions_user_expires", "user_id", "expires_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user: Mapped[User] = relationship()


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"
    __table_args__ = (
        UniqueConstraint("token_hash", name="uq_email_verification_tokens_hash"),
        Index("ix_email_verification_tokens_user_expires", "user_id", "expires_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship()


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    __table_args__ = (
        UniqueConstraint("token_hash", name="uq_password_reset_tokens_hash"),
        Index("ix_password_reset_tokens_user_expires", "user_id", "expires_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship()


class CommunityPost(Base):
    __tablename__ = "community_posts"
    __table_args__ = (
        Index("ix_community_posts_symbol_created", "symbol", "created_at"),
        Index("ix_community_posts_status_created", "status", "created_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(32))
    run_id: Mapped[int | None] = mapped_column(ForeignKey("signal_runs.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hidden_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    hidden_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    user: Mapped[User] = relationship(foreign_keys=[user_id])
    run: Mapped[SignalRun | None] = relationship()
    hidden_by_user: Mapped[User | None] = relationship(foreign_keys=[hidden_by_user_id])


class CommunityReport(Base):
    __tablename__ = "community_reports"
    __table_args__ = (
        UniqueConstraint("post_id", "reporter_id", name="uq_community_reports_post_reporter"),
        Index("ix_community_reports_status_created", "status", "created_at"),
        Index("ix_community_reports_post_created", "post_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False)
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="open")
    moderator_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    post: Mapped[CommunityPost] = relationship()
    reporter: Mapped[User] = relationship(foreign_keys=[reporter_id])
    resolved_by_user: Mapped[User | None] = relationship(foreign_keys=[resolved_by_user_id])


class AdSlot(Base):
    __tablename__ = "ad_slots"
    __table_args__ = (
        UniqueConstraint("placement", name="uq_ad_slots_placement"),
        Index("ix_ad_slots_enabled_priority", "enabled", "priority"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    placement: Mapped[str] = mapped_column(String(32))
    label: Mapped[str] = mapped_column(String(128))
    enabled: Mapped[bool] = mapped_column(default=False)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class AdCreative(Base):
    __tablename__ = "ad_creatives"
    __table_args__ = (
        Index("ix_ad_creatives_slot_status", "slot_id", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("ad_slots.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(160))
    body_copy: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    target_url: Mapped[str] = mapped_column(String(1000))
    cta_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="draft")
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    slot: Mapped[AdSlot] = relationship()


class AdEvent(Base):
    __tablename__ = "ad_events"
    __table_args__ = (
        Index("ix_ad_events_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("ad_slots.id", ondelete="CASCADE"), nullable=False)
    creative_id: Mapped[int] = mapped_column(ForeignKey("ad_creatives.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(16))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    slot: Mapped[AdSlot] = relationship()
    creative: Mapped[AdCreative] = relationship()
    user: Mapped[User | None] = relationship()


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    enabled: Mapped[bool] = mapped_column(default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
