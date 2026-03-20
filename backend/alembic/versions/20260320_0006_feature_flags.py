"""add feature flags table

Revision ID: 20260320_0006
Revises: 20260320_0005
Create Date: 2026-03-20 00:00:04
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_0006"
down_revision = "20260320_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "feature_flags",
        sa.Column("key", sa.String(length=64), primary_key=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.execute(
        """
        INSERT INTO feature_flags (key, enabled, updated_at)
        VALUES
          ('community_enabled', true, NOW()),
          ('ads_enabled', true, NOW()),
          ('write_actions_enabled', true, NOW())
        """
    )


def downgrade() -> None:
    op.drop_table("feature_flags")
