"""add launch ads tables

Revision ID: 20260320_0005
Revises: 20260320_0004
Create Date: 2026-03-20 00:00:03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_0005"
down_revision = "20260320_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ad_slots",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("placement", sa.String(length=32), nullable=False),
        sa.Column("label", sa.String(length=128), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("placement", name="uq_ad_slots_placement"),
    )
    op.create_index("ix_ad_slots_enabled_priority", "ad_slots", ["enabled", "priority"], unique=False)

    op.create_table(
        "ad_creatives",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("slot_id", sa.BigInteger(), sa.ForeignKey("ad_slots.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("body_copy", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=1000), nullable=True),
        sa.Column("target_url", sa.String(length=1000), nullable=False),
        sa.Column("cta_label", sa.String(length=80), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ad_creatives_slot_status", "ad_creatives", ["slot_id", "status"], unique=False)

    op.create_table(
        "ad_events",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("slot_id", sa.BigInteger(), sa.ForeignKey("ad_slots.id", ondelete="CASCADE"), nullable=False),
        sa.Column("creative_id", sa.BigInteger(), sa.ForeignKey("ad_creatives.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(length=16), nullable=False),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ad_events_created_at", "ad_events", ["created_at"], unique=False)

    op.execute(
        """
        INSERT INTO ad_slots (placement, label, enabled, priority, created_at, updated_at)
        VALUES
          ('dashboard_top', 'Dashboard Top', false, 100, NOW(), NOW()),
          ('dashboard_mid', 'Dashboard Mid', false, 80, NOW(), NOW()),
          ('detail_bottom', 'Detail Bottom', false, 60, NOW(), NOW())
        """
    )


def downgrade() -> None:
    op.drop_table("ad_events")
    op.drop_table("ad_creatives")
    op.drop_table("ad_slots")
