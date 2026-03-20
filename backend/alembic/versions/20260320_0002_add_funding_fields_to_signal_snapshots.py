"""add funding fields to signal snapshots

Revision ID: 20260320_0002
Revises: 20260316_0001
Create Date: 2026-03-20 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_0002"
down_revision = "20260316_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("signal_snapshots", sa.Column("funding_rate_latest", sa.Float(), nullable=True))
    op.add_column("signal_snapshots", sa.Column("funding_rate_abs", sa.Float(), nullable=True))
    op.add_column("signal_snapshots", sa.Column("funding_bias", sa.String(length=16), nullable=True))


def downgrade() -> None:
    op.drop_column("signal_snapshots", "funding_bias")
    op.drop_column("signal_snapshots", "funding_rate_abs")
    op.drop_column("signal_snapshots", "funding_rate_latest")
