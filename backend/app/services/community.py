import logging
import re
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth_schemas import MessageResponse
from app.community_schemas import CommunityPostPayload, CommunityReportPayload
from app.db.models import CommunityPost, CommunityReport
from app.logging_utils import log_event
from app.repositories.community_repository import CommunityRepository
from app.services.auth import AuthContext
from app.services.feature_flags import is_flag_enabled

_SYMBOL_RE = re.compile(r"^[A-Z0-9]{2,32}$")
_LINK_RE = re.compile(r"(https?://|www\.)", re.IGNORECASE)
_BLOCKED_PATTERNS = (
    "telegram",
    "whatsapp",
    "guaranteed profit",
    "double your",
    "seed phrase",
    "private key",
    "contact me",
    "dm me",
)
_POST_RATE_LIMIT_WINDOW = timedelta(minutes=10)
_POST_RATE_LIMIT_COUNT = 5
_REPORT_RATE_LIMIT_WINDOW = timedelta(minutes=10)
_REPORT_RATE_LIMIT_COUNT = 10
logger = logging.getLogger(__name__)


def _community_read_enabled(db: Session) -> bool:
    return is_flag_enabled(db, "community_enabled")


def _community_write_enabled(db: Session) -> bool:
    return _community_read_enabled(db) and is_flag_enabled(db, "write_actions_enabled")


def _normalize_symbol(symbol: str) -> str:
    normalized = symbol.strip().upper()
    if not _SYMBOL_RE.match(normalized):
        raise HTTPException(status_code=422, detail="Invalid symbol.")
    return normalized


def _normalize_body(body: str) -> str:
    normalized = body.strip()
    if len(normalized) < 8:
        raise HTTPException(status_code=422, detail="Post is too short.")
    if len(normalized) > 1200:
        raise HTTPException(status_code=422, detail="Post is too long.")
    return normalized


def _validate_post_body(body: str) -> None:
    lowered = body.lower()
    if len(_LINK_RE.findall(body)) > 1:
        raise HTTPException(status_code=422, detail="Too many links for a launch discussion post.")
    if any(pattern in lowered for pattern in _BLOCKED_PATTERNS):
        raise HTTPException(status_code=422, detail="Post content was blocked by launch moderation rules.")


def _author_payload(user_id: int, nickname: str, role: str):
    return {
        "id": user_id,
        "nickname": nickname,
        "role": role,
    }


def _post_to_schema(post: CommunityPost) -> CommunityPostPayload:
    return CommunityPostPayload(
        id=post.id,
        symbol=post.symbol,
        run_id=post.run_id,
        timeframe=(post.run.timeframe if post.run else None),
        body=post.body,
        status=post.status,
        created_at=post.created_at,
        updated_at=post.updated_at,
        author=_author_payload(post.user.id, post.user.nickname, post.user.role),
    )


def _report_to_schema(report: CommunityReport) -> CommunityReportPayload:
    return CommunityReportPayload(
        id=report.id,
        reason=report.reason,
        status=report.status,
        moderator_note=report.moderator_note,
        created_at=report.created_at,
        resolved_at=report.resolved_at,
        reporter=_author_payload(report.reporter.id, report.reporter.nickname, report.reporter.role),
        post=_post_to_schema(report.post),
    )


def list_public_posts(db: Session, symbol: str, run_id: int | None) -> list[CommunityPostPayload]:
    if not _community_read_enabled(db):
        return []
    repo = CommunityRepository(db)
    posts = repo.list_public_posts(symbol=_normalize_symbol(symbol), run_id=run_id)
    return [_post_to_schema(post) for post in posts]


def list_latest_posts(db: Session, limit: int) -> list[CommunityPostPayload]:
    if not _community_read_enabled(db):
        return []
    repo = CommunityRepository(db)
    posts = repo.list_latest_public_posts(limit=limit)
    return [_post_to_schema(post) for post in posts]


def create_post(db: Session, context: AuthContext, symbol: str, run_id: int | None, body: str) -> CommunityPostPayload:
    if not _community_write_enabled(db):
        raise HTTPException(status_code=403, detail="Community write actions are currently paused.")
    repo = CommunityRepository(db)
    normalized_symbol = _normalize_symbol(symbol)
    normalized_body = _normalize_body(body)
    _validate_post_body(normalized_body)

    if repo.count_recent_posts(context.user.id, datetime.utcnow() - _POST_RATE_LIMIT_WINDOW) >= _POST_RATE_LIMIT_COUNT:
        raise HTTPException(status_code=429, detail="Posting too quickly. Please slow down.")

    if run_id is not None and repo.get_signal_run(run_id) is None:
        raise HTTPException(status_code=404, detail="Run not found.")

    post = repo.create_post(
        symbol=normalized_symbol,
        run_id=run_id,
        user_id=context.user.id,
        body=normalized_body,
    )
    log_event(logger, "community_post_created", post_id=post.id, symbol=post.symbol, run_id=post.run_id, user_id=context.user.id)
    return _post_to_schema(post)


def delete_post(db: Session, context: AuthContext, post_id: int) -> MessageResponse:
    if not _community_write_enabled(db):
        raise HTTPException(status_code=403, detail="Community write actions are currently paused.")
    repo = CommunityRepository(db)
    post = repo.get_post(post_id)
    if not post or post.status == "deleted":
        raise HTTPException(status_code=404, detail="Post not found.")

    is_moderator = context.user.role in {"moderator", "admin"}
    if post.user_id != context.user.id and not is_moderator:
        raise HTTPException(status_code=403, detail="You can only delete your own posts.")

    repo.soft_delete_post(post)
    log_event(logger, "community_post_deleted", post_id=post.id, symbol=post.symbol, actor_user_id=context.user.id)
    return MessageResponse(message="Post deleted.")


def create_report(db: Session, context: AuthContext, post_id: int, reason: str) -> MessageResponse:
    if not _community_write_enabled(db):
        raise HTTPException(status_code=403, detail="Community write actions are currently paused.")
    repo = CommunityRepository(db)
    if repo.count_recent_reports(context.user.id, datetime.utcnow() - _REPORT_RATE_LIMIT_WINDOW) >= _REPORT_RATE_LIMIT_COUNT:
        raise HTTPException(status_code=429, detail="Reporting too quickly. Please slow down.")

    post = repo.get_post(post_id)
    if not post or post.status != "active":
        raise HTTPException(status_code=404, detail="Post not found.")
    if post.user_id == context.user.id:
        raise HTTPException(status_code=400, detail="You cannot report your own post.")

    try:
        repo.create_report(post_id=post_id, reporter_id=context.user.id, reason=reason)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="You have already reported this post.") from exc
    log_event(logger, "community_report_created", post_id=post_id, reporter_id=context.user.id, reason=reason)
    return MessageResponse(message="Report submitted.")


def list_reports(db: Session) -> list[CommunityReportPayload]:
    repo = CommunityRepository(db)
    return [_report_to_schema(report) for report in repo.list_reports()]


def hide_post_for_report(
    db: Session,
    context: AuthContext,
    report_id: int,
    moderator_note: str | None,
) -> CommunityReportPayload:
    repo = CommunityRepository(db)
    report = repo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if report.post.status == "active":
        repo.hide_post(report.post, context.user.id)
    for related in repo.list_open_reports_for_post(report.post_id):
        repo.mark_report(related, status="hidden", moderator_id=context.user.id, moderator_note=moderator_note)
    refreshed = repo.get_report(report_id)
    if not refreshed:
        raise HTTPException(status_code=404, detail="Report not found.")
    log_event(
        logger,
        "community_report_hidden",
        report_id=report_id,
        post_id=refreshed.post.id,
        actor_user_id=context.user.id,
    )
    return _report_to_schema(refreshed)


def mark_report_no_action(
    db: Session,
    context: AuthContext,
    report_id: int,
    moderator_note: str | None,
) -> CommunityReportPayload:
    repo = CommunityRepository(db)
    report = repo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    updated = repo.mark_report(report, status="no_action", moderator_id=context.user.id, moderator_note=moderator_note)
    log_event(
        logger,
        "community_report_no_action",
        report_id=report_id,
        post_id=updated.post.id,
        actor_user_id=context.user.id,
    )
    return _report_to_schema(updated)
