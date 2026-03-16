"""init scanner schema

Revision ID: 20260316_0001
Revises: 
Create Date: 2026-03-16 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260316_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "exchanges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_exchanges_code", "exchanges", ["code"], unique=True)

    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_assets_symbol", "assets", ["symbol"], unique=True)

    op.create_table(
        "instruments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("exchange_id", sa.Integer(), sa.ForeignKey("exchanges.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("quote_asset", sa.String(length=32), nullable=False),
        sa.Column("contract_type", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("exchange_id", "symbol", name="uq_instruments_exchange_symbol"),
    )
    op.create_index("ix_instruments_symbol", "instruments", ["symbol"], unique=False)
    op.create_index("ix_instruments_exchange_id", "instruments", ["exchange_id"], unique=False)
    op.create_index("ix_instruments_asset_id", "instruments", ["asset_id"], unique=False)
    op.create_index("ix_instruments_exchange_asset", "instruments", ["exchange_id", "asset_id"], unique=False)

    for table_name, extra_cols in (
        ("market_snapshots", [
            sa.Column("last_price", sa.Float(), nullable=False),
            sa.Column("price_change_percent_24h", sa.Float(), nullable=False),
            sa.Column("quote_volume_24h", sa.Float(), nullable=False),
            sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        ]),
        ("oi_snapshots", [
            sa.Column("oi_change_percent_recent", sa.Float(), nullable=True),
            sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        ]),
        ("funding_snapshots", [
            sa.Column("funding_rate", sa.Float(), nullable=True),
            sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        ]),
        ("positioning_snapshots", [
            sa.Column("taker_net_flow_recent", sa.Float(), nullable=True),
            sa.Column("long_short_ratio_recent", sa.Float(), nullable=True),
            sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        ]),
    ):
        op.create_table(
            table_name,
            sa.Column("id", sa.BigInteger(), primary_key=True),
            sa.Column("instrument_id", sa.Integer(), sa.ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False),
            sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
            *extra_cols,
            sa.UniqueConstraint("instrument_id", "ts", name=f"uq_{table_name}_instrument_ts"),
        )
        op.create_index(f"ix_{table_name}_instrument_id", table_name, ["instrument_id"], unique=False)
        op.create_index(f"ix_{table_name}_ts", table_name, ["ts"], unique=False)

    op.create_table(
        "signal_runs",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("timeframe", sa.String(length=8), nullable=False),
        sa.Column("limit", sa.Integer(), nullable=False),
        sa.Column("volume_percentile", sa.Float(), nullable=False),
        sa.Column("feature_version", sa.String(length=32), nullable=False),
        sa.Column("signal_version", sa.String(length=32), nullable=False),
        sa.Column("input_params", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
    )
    op.create_index("ix_signal_runs_timeframe", "signal_runs", ["timeframe"], unique=False)
    op.create_index("ix_signal_runs_status", "signal_runs", ["status"], unique=False)
    op.create_index("ix_signal_runs_started_at", "signal_runs", ["started_at"], unique=False)
    op.create_index("ix_signal_runs_timeframe_started", "signal_runs", ["timeframe", "started_at"], unique=False)

    op.create_table(
        "signal_scores",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("signal_run_id", sa.BigInteger(), sa.ForeignKey("signal_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("instrument_id", sa.Integer(), sa.ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("score_type", sa.String(length=32), nullable=False),
        sa.Column("score_value", sa.Float(), nullable=False),
        sa.UniqueConstraint("signal_run_id", "instrument_id", "score_type", name="uq_signal_scores_run_inst_type"),
    )
    op.create_index("ix_signal_scores_signal_run_id", "signal_scores", ["signal_run_id"], unique=False)
    op.create_index("ix_signal_scores_instrument_id", "signal_scores", ["instrument_id"], unique=False)
    op.create_index("ix_signal_scores_score_type", "signal_scores", ["score_type"], unique=False)
    op.create_index("ix_signal_scores_ts", "signal_scores", ["ts"], unique=False)
    op.create_index("ix_signal_scores_type_value", "signal_scores", ["score_type", "score_value"], unique=False)

    op.create_table(
        "signal_snapshots",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("signal_run_id", sa.BigInteger(), sa.ForeignKey("signal_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("instrument_id", sa.Integer(), sa.ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("last_price", sa.Float(), nullable=False),
        sa.Column("price_change_percent_24h", sa.Float(), nullable=False),
        sa.Column("quote_volume_24h", sa.Float(), nullable=False),
        sa.Column("heat_score", sa.Float(), nullable=False),
        sa.Column("momentum_score", sa.Float(), nullable=False),
        sa.Column("setup_score", sa.Float(), nullable=False),
        sa.Column("positioning_score", sa.Float(), nullable=False),
        sa.Column("early_signal_score", sa.Float(), nullable=False),
        sa.Column("risk_penalty", sa.Float(), nullable=False),
        sa.Column("composite_score", sa.Float(), nullable=False),
        sa.Column("signal_bucket", sa.String(length=32), nullable=False),
        sa.Column("reason_tags", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("previous_rank", sa.Integer(), nullable=True),
        sa.Column("rank_change", sa.Integer(), nullable=True),
        sa.Column("previous_composite_score", sa.Float(), nullable=True),
        sa.Column("composite_delta", sa.Float(), nullable=True),
        sa.Column("setup_delta", sa.Float(), nullable=True),
        sa.Column("positioning_delta", sa.Float(), nullable=True),
        sa.Column("data_quality_score", sa.Float(), nullable=False),
        sa.Column("oi_change_percent_recent", sa.Float(), nullable=True),
        sa.Column("taker_net_flow_recent", sa.Float(), nullable=True),
        sa.Column("long_short_ratio_recent", sa.Float(), nullable=True),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.UniqueConstraint("signal_run_id", "instrument_id", name="uq_signal_snapshots_run_instrument"),
    )
    op.create_index("ix_signal_snapshots_signal_run_id", "signal_snapshots", ["signal_run_id"], unique=False)
    op.create_index("ix_signal_snapshots_instrument_id", "signal_snapshots", ["instrument_id"], unique=False)
    op.create_index("ix_signal_snapshots_symbol", "signal_snapshots", ["symbol"], unique=False)
    op.create_index("ix_signal_snapshots_ts", "signal_snapshots", ["ts"], unique=False)
    op.create_index("ix_signal_snapshots_run_composite", "signal_snapshots", ["signal_run_id", "composite_score"], unique=False)


def downgrade() -> None:
    op.drop_table("signal_snapshots")
    op.drop_table("signal_scores")
    op.drop_table("signal_runs")
    op.drop_table("positioning_snapshots")
    op.drop_table("funding_snapshots")
    op.drop_table("oi_snapshots")
    op.drop_table("market_snapshots")
    op.drop_table("instruments")
    op.drop_table("assets")
    op.drop_table("exchanges")
