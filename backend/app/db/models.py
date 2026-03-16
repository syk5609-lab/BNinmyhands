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
        Index("ix_market_snapshots_ts", "ts"),
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
        Index("ix_oi_snapshots_ts", "ts"),
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
        Index("ix_funding_snapshots_ts", "ts"),
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
        Index("ix_positioning_snapshots_ts", "ts"),
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

    oi_change_percent_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    taker_net_flow_recent: Mapped[float | None] = mapped_column(Float, nullable=True)
    long_short_ratio_recent: Mapped[float | None] = mapped_column(Float, nullable=True)

    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
