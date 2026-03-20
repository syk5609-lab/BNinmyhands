"""add community lite tables

Revision ID: 20260320_0004
Revises: 20260320_0003
Create Date: 2026-03-20 00:00:02
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_0004"
down_revision = "20260320_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "community_posts",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("run_id", sa.BigInteger(), sa.ForeignKey("signal_runs.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hidden_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hidden_by_user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_community_posts_symbol_created", "community_posts", ["symbol", "created_at"], unique=False)
    op.create_index("ix_community_posts_status_created", "community_posts", ["status", "created_at"], unique=False)

    op.create_table(
        "community_reports",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column("post_id", sa.BigInteger(), sa.ForeignKey("community_posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("reporter_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("reason", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("moderator_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by_user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.UniqueConstraint("post_id", "reporter_id", name="uq_community_reports_post_reporter"),
    )
    op.create_index("ix_community_reports_status_created", "community_reports", ["status", "created_at"], unique=False)
    op.create_index("ix_community_reports_post_created", "community_reports", ["post_id", "created_at"], unique=False)


def downgrade() -> None:
    op.drop_table("community_reports")
    op.drop_table("community_posts")
