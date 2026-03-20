from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db.models import CommunityPost, CommunityReport, SignalRun


class CommunityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_signal_run(self, run_id: int) -> SignalRun | None:
        return self.db.scalar(select(SignalRun).where(SignalRun.id == run_id))

    def list_public_posts(self, symbol: str, run_id: int | None, limit: int = 100) -> list[CommunityPost]:
        stmt = (
            select(CommunityPost)
            .options(joinedload(CommunityPost.user), joinedload(CommunityPost.run))
            .where(
                CommunityPost.symbol == symbol,
                CommunityPost.status == "active",
            )
            .order_by(CommunityPost.created_at.desc())
            .limit(limit)
        )
        if run_id is not None:
            stmt = stmt.where(CommunityPost.run_id == run_id)
        return list(self.db.scalars(stmt).all())

    def list_latest_public_posts(self, limit: int = 100) -> list[CommunityPost]:
        stmt = (
            select(CommunityPost)
            .options(joinedload(CommunityPost.user), joinedload(CommunityPost.run))
            .where(CommunityPost.status == "active")
            .order_by(CommunityPost.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def get_post(self, post_id: int) -> CommunityPost | None:
        stmt = (
            select(CommunityPost)
            .options(joinedload(CommunityPost.user), joinedload(CommunityPost.run))
            .where(CommunityPost.id == post_id)
            .limit(1)
        )
        return self.db.scalar(stmt)

    def create_post(self, symbol: str, run_id: int | None, user_id: int, body: str) -> CommunityPost:
        post = CommunityPost(
            symbol=symbol,
            run_id=run_id,
            user_id=user_id,
            body=body,
            status="active",
        )
        self.db.add(post)
        self.db.flush()
        return self.get_post(post.id) or post

    def count_recent_posts(self, user_id: int, since: datetime) -> int:
        stmt = select(func.count()).select_from(CommunityPost).where(
            CommunityPost.user_id == user_id,
            CommunityPost.created_at >= since,
        )
        return int(self.db.scalar(stmt) or 0)

    def soft_delete_post(self, post: CommunityPost) -> CommunityPost:
        now = datetime.utcnow()
        post.status = "deleted"
        post.deleted_at = now
        post.updated_at = now
        self.db.flush()
        return post

    def hide_post(self, post: CommunityPost, moderator_id: int) -> CommunityPost:
        now = datetime.utcnow()
        post.status = "hidden"
        post.hidden_at = now
        post.hidden_by_user_id = moderator_id
        post.updated_at = now
        self.db.flush()
        return post

    def count_recent_reports(self, reporter_id: int, since: datetime) -> int:
        stmt = select(func.count()).select_from(CommunityReport).where(
            CommunityReport.reporter_id == reporter_id,
            CommunityReport.created_at >= since,
        )
        return int(self.db.scalar(stmt) or 0)

    def create_report(self, post_id: int, reporter_id: int, reason: str) -> CommunityReport:
        report = CommunityReport(
            post_id=post_id,
            reporter_id=reporter_id,
            reason=reason,
            status="open",
        )
        self.db.add(report)
        self.db.flush()
        return self.get_report(report.id) or report

    def get_report(self, report_id: int) -> CommunityReport | None:
        stmt = (
            select(CommunityReport)
            .options(
                joinedload(CommunityReport.post).joinedload(CommunityPost.user),
                joinedload(CommunityReport.post).joinedload(CommunityPost.run),
                joinedload(CommunityReport.reporter),
            )
            .where(CommunityReport.id == report_id)
            .limit(1)
        )
        return self.db.scalar(stmt)

    def list_reports(self, limit: int = 100) -> list[CommunityReport]:
        stmt = (
            select(CommunityReport)
            .options(
                joinedload(CommunityReport.post).joinedload(CommunityPost.user),
                joinedload(CommunityReport.post).joinedload(CommunityPost.run),
                joinedload(CommunityReport.reporter),
            )
            .order_by(CommunityReport.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def mark_report(self, report: CommunityReport, status: str, moderator_id: int, moderator_note: str | None) -> CommunityReport:
        report.status = status
        report.moderator_note = moderator_note
        report.resolved_at = datetime.utcnow()
        report.resolved_by_user_id = moderator_id
        self.db.flush()
        return self.get_report(report.id) or report

    def list_open_reports_for_post(self, post_id: int) -> list[CommunityReport]:
        stmt = select(CommunityReport).where(
            CommunityReport.post_id == post_id,
            CommunityReport.status == "open",
        )
        return list(self.db.scalars(stmt).all())
