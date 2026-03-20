import logging
from typing import Literal

from fastapi import Depends, FastAPI, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.ads_schemas import (
    AdminAdCreativeCreateRequest,
    AdminAdCreativePayload,
    AdminAdCreativeUpdateRequest,
    AdminAdSlotPayload,
    AdminAdSlotUpdateRequest,
    AdEventRequest,
    AdSlotRenderPayload,
)
from app.auth_schemas import (
    CurrentUserPayload,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    SignupRequest,
    SignupResponse,
    UpdateProfileRequest,
    VerifyConfirmRequest,
    VerifyRequest,
)
from app.community_schemas import (
    CommunityCreatePostRequest,
    CommunityModerationActionRequest,
    CommunityPostPayload,
    CommunityReportCreateRequest,
    CommunityReportPayload,
)
from app.config import settings
from app.db.models import User
from app.db.session import SessionLocal, get_db
from app.feature_flag_schemas import (
    AdminFeatureFlagPayload,
    AdminFeatureFlagUpdateRequest,
    RuntimeFeatureFlagsPayload,
)
from app.logging_utils import log_event as write_log_event
from app.schemas import (
    AssetHistoryResponse,
    AssetLatestResponse,
    ResearchEvaluationResponse,
    ResearchRunDetail,
    ResearchRunSummary,
    ResearchSnapshotRequest,
    ResearchSnapshotResponse,
    ScanResponse,
)
from app.services.ads import (
    create_admin_creative,
    list_admin_creatives,
    list_admin_slots,
    list_public_slots,
    log_event as log_ad_event,
    update_admin_creative,
    update_admin_slot,
)
from app.services.auth import (
    authenticate_user,
    clear_session_cookie,
    consume_email_verification_token,
    consume_password_reset_token,
    create_email_verification_token,
    create_password_reset_token,
    create_session,
    create_user_with_profile,
    get_optional_auth_context,
    require_auth_context,
    revoke_session,
    role_guard,
    set_session_cookie,
    update_profile,
    user_to_payload,
    validate_email,
)
from app.services.community import (
    create_post,
    create_report,
    delete_post,
    hide_post_for_report,
    list_latest_posts,
    list_public_posts as list_community_posts,
    list_reports as list_community_reports,
    mark_report_no_action,
)
from app.services.feature_flags import (
    get_runtime_flags,
    list_admin_flags,
    update_admin_flag,
)
from app.services.research import (
    evaluate_snapshots,
    get_asset_history,
    get_asset_latest,
    get_latest_research_run,
    get_research_run,
    list_research_runs,
    save_snapshot,
)
from app.services.scanner import build_scan
from app.services.scheduler import start_scheduler, stop_scheduler

app = FastAPI(title="Binance USDⓈ-M Futures Scanner API", version="0.1.0")
logger = logging.getLogger(__name__)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    start_scheduler()


@app.on_event("shutdown")
def _shutdown() -> None:
    stop_scheduler()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db")
def health_db() -> dict[str, str]:
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/auth/signup", response_model=SignupResponse)
def auth_signup(payload: SignupRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> SignupResponse:
    user, profile = create_user_with_profile(db, payload.email, payload.password, payload.nickname)
    preview = create_email_verification_token(db, user)
    raw_session_token = create_session(db, user, request)
    db.commit()
    set_session_cookie(response, raw_session_token)
    return SignupResponse(
        user=user_to_payload(user, profile),
        email_verification_required=True,
        verification_token_preview=preview,
    )


@app.post("/auth/login", response_model=LoginResponse)
def auth_login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> LoginResponse:
    user, profile = authenticate_user(db, payload.email, payload.password)
    raw_session_token = create_session(db, user, request)
    db.commit()
    set_session_cookie(response, raw_session_token)
    return LoginResponse(user=user_to_payload(user, profile))


@app.post("/auth/logout", response_model=MessageResponse)
def auth_logout(request: Request, response: Response, db: Session = Depends(get_db)) -> MessageResponse:
    context = get_optional_auth_context(db, request)
    if context:
        revoke_session(db, context.session)
        db.commit()
        write_log_event(logger, "auth_logout", user_id=context.user.id, session_id=context.session.id)
    else:
        write_log_event(logger, "auth_logout", user_id=None, session_id=None)
    clear_session_cookie(response)
    return MessageResponse(message="Logged out.")


@app.get("/auth/me", response_model=CurrentUserPayload)
def auth_me(request: Request, db: Session = Depends(get_db)) -> CurrentUserPayload | JSONResponse:
    context = get_optional_auth_context(db, request)
    if not context:
        response = JSONResponse({"detail": "Authentication required."}, status_code=401)
        clear_session_cookie(response)
        return response
    return user_to_payload(context.user, context.profile)


@app.patch("/account/profile", response_model=CurrentUserPayload)
def account_profile_update(
    payload: UpdateProfileRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> CurrentUserPayload | JSONResponse:
    context = get_optional_auth_context(db, request)
    if not context:
        response = JSONResponse({"detail": "Authentication required."}, status_code=401)
        clear_session_cookie(response)
        return response
    user, profile = update_profile(db, context.user, payload)
    db.commit()
    return user_to_payload(user, profile)


@app.post("/auth/verify/request", response_model=MessageResponse)
def auth_verify_request(payload: VerifyRequest, db: Session = Depends(get_db)) -> MessageResponse:
    preview: str | None = None
    normalized_email = validate_email(payload.email)
    user_row = db.scalar(select(User).where(User.email == normalized_email))
    if user_row:
        preview = create_email_verification_token(db, user_row)
        db.commit()
    return MessageResponse(message="If that account exists, a verification email has been prepared.", token_preview=preview)


@app.post("/auth/verify/confirm", response_model=MessageResponse)
def auth_verify_confirm(payload: VerifyConfirmRequest, db: Session = Depends(get_db)) -> MessageResponse:
    consume_email_verification_token(db, payload.token)
    db.commit()
    return MessageResponse(message="Email verified.")


@app.post("/auth/password-reset/request", response_model=MessageResponse)
def auth_password_reset_request(payload: PasswordResetRequest, db: Session = Depends(get_db)) -> MessageResponse:
    preview: str | None = None
    normalized_email = validate_email(payload.email)
    user = db.scalar(select(User).where(User.email == normalized_email))
    if user:
        preview = create_password_reset_token(db, user)
        db.commit()
    return MessageResponse(message="If that account exists, a reset email has been prepared.", token_preview=preview)


@app.post("/auth/password-reset/confirm", response_model=LoginResponse)
def auth_password_reset_confirm(
    payload: PasswordResetConfirmRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> LoginResponse:
    user, profile = consume_password_reset_token(db, payload.token, payload.new_password)
    raw_session_token = create_session(db, user, request)
    db.commit()
    set_session_cookie(response, raw_session_token)
    return LoginResponse(user=user_to_payload(user, profile))


@app.get("/api/scan/today", response_model=ScanResponse)
def scan_today(
    limit: int = Query(default=50, ge=1, le=200),
    volume_percentile: float = Query(default=0.7, ge=0.0, le=1.0),
    timeframe: str = Query(default="1h", pattern="^(1h|4h|24h)$"),
) -> ScanResponse:
    return build_scan(limit=limit, volume_percentile=volume_percentile, timeframe=timeframe)


@app.post("/api/research/snapshot", response_model=ResearchSnapshotResponse)
def research_snapshot(payload: ResearchSnapshotRequest) -> ResearchSnapshotResponse:
    scan, save_path = save_snapshot(
        timeframe=payload.timeframe,
        limit=payload.limit,
        volume_percentile=payload.volume_percentile,
    )
    return ResearchSnapshotResponse(
        save_path=save_path,
        generated_at=scan.generated_at,
        timeframe=payload.timeframe,
        row_count=len(scan.results),
    )


@app.get("/api/research/evaluate", response_model=ResearchEvaluationResponse)
def research_evaluate(
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
    rank_field: Literal[
        "momentum_score",
        "positioning_score",
        "early_signal_score",
        "composite_score",
        "heat_score",
        "setup_score",
    ] = Query(default="composite_score"),
    top_k: int = Query(default=20, ge=1, le=200),
    horizon_steps: int = Query(default=1, ge=1, le=200),
) -> ResearchEvaluationResponse:
    payload = evaluate_snapshots(
        timeframe=timeframe,
        rank_field=rank_field,
        top_k=top_k,
        horizon_steps=horizon_steps,
    )
    return ResearchEvaluationResponse(**payload)


@app.get("/api/research/runs", response_model=list[ResearchRunSummary])
def research_runs(timeframe: Literal["1h", "4h", "24h"] = Query(default="1h")) -> list[ResearchRunSummary]:
    return list_research_runs(timeframe=timeframe)


@app.get("/api/research/runs/latest", response_model=ResearchRunDetail)
def research_latest_run(timeframe: Literal["1h", "4h", "24h"] = Query(default="1h")) -> ResearchRunDetail:
    return get_latest_research_run(timeframe=timeframe)


@app.get("/api/research/runs/{run_id}", response_model=ResearchRunDetail)
def research_run_detail(run_id: int) -> ResearchRunDetail:
    return get_research_run(run_id)


@app.get("/api/assets/{symbol}/latest", response_model=AssetLatestResponse)
def asset_latest(
    symbol: str,
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
    run_id: int | None = Query(default=None, ge=1),
) -> AssetLatestResponse:
    return get_asset_latest(symbol, timeframe=timeframe, run_id=run_id)


@app.get("/api/assets/{symbol}/history", response_model=AssetHistoryResponse)
def asset_history(
    symbol: str,
    timeframe: Literal["1h", "4h", "24h"] = Query(default="1h"),
    limit: int = Query(default=200, ge=1, le=2000),
    run_id: int | None = Query(default=None, ge=1),
) -> AssetHistoryResponse:
    return get_asset_history(symbol, timeframe=timeframe, limit=limit, run_id=run_id)


@app.get("/runtime/flags", response_model=RuntimeFeatureFlagsPayload)
def runtime_flags(db: Session = Depends(get_db)) -> RuntimeFeatureFlagsPayload:
    return get_runtime_flags(db)


@app.get("/ads/slots", response_model=list[AdSlotRenderPayload])
def ads_slots(
    placement: str = Query(...),
    db: Session = Depends(get_db),
) -> list[AdSlotRenderPayload]:
    return list_public_slots(db, placement=placement)


@app.post("/ads/events", response_model=MessageResponse)
def ads_events(
    payload: AdEventRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> MessageResponse:
    context = get_optional_auth_context(db, request)
    result = log_ad_event(
        db,
        slot_id=payload.slot_id,
        creative_id=payload.creative_id,
        event_type=payload.event_type,
        user_id=(context.user.id if context else None),
    )
    db.commit()
    return result


@app.get("/community/posts", response_model=list[CommunityPostPayload])
def community_posts(
    symbol: str = Query(..., min_length=2, max_length=32),
    run_id: int | None = Query(default=None, ge=1),
    db: Session = Depends(get_db),
) -> list[CommunityPostPayload]:
    return list_community_posts(db, symbol=symbol, run_id=run_id)


@app.post("/community/posts", response_model=CommunityPostPayload)
def community_create_post(
    payload: CommunityCreatePostRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> CommunityPostPayload:
    context = require_auth_context(db, request)
    post = create_post(db, context, symbol=payload.symbol, run_id=payload.run_id, body=payload.body)
    db.commit()
    return post


@app.delete("/community/posts/{post_id}", response_model=MessageResponse)
def community_delete_post(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db),
) -> MessageResponse:
    context = require_auth_context(db, request)
    result = delete_post(db, context, post_id=post_id)
    db.commit()
    return result


@app.post("/community/reports", response_model=MessageResponse)
def community_create_report(
    payload: CommunityReportCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> MessageResponse:
    context = require_auth_context(db, request)
    result = create_report(db, context, post_id=payload.post_id, reason=payload.reason)
    db.commit()
    return result


@app.get("/community/latest", response_model=list[CommunityPostPayload])
def community_latest(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[CommunityPostPayload]:
    return list_latest_posts(db, limit=limit)


@app.get("/admin/reports", response_model=list[CommunityReportPayload])
def admin_reports(request: Request, db: Session = Depends(get_db)) -> list[CommunityReportPayload]:
    context = require_auth_context(db, request)
    role_guard("moderator", "admin")(context)
    return list_community_reports(db)


@app.get("/admin/feature-flags", response_model=list[AdminFeatureFlagPayload])
def admin_feature_flags(request: Request, db: Session = Depends(get_db)) -> list[AdminFeatureFlagPayload]:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    return list_admin_flags(db)


@app.patch("/admin/feature-flags/{key}", response_model=AdminFeatureFlagPayload)
def admin_feature_flag_update(
    key: str,
    payload: AdminFeatureFlagUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AdminFeatureFlagPayload:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    result = update_admin_flag(db, key=key, enabled=payload.enabled, actor_user_id=context.user.id)
    db.commit()
    return result


@app.get("/admin/ads/slots", response_model=list[AdminAdSlotPayload])
def admin_ad_slots(request: Request, db: Session = Depends(get_db)) -> list[AdminAdSlotPayload]:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    return list_admin_slots(db)


@app.patch("/admin/ads/slots/{slot_id}", response_model=AdminAdSlotPayload)
def admin_ad_slot_update(
    slot_id: int,
    payload: AdminAdSlotUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AdminAdSlotPayload:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    result = update_admin_slot(
        db,
        slot_id,
        label=payload.label,
        enabled=payload.enabled,
        priority=payload.priority,
    )
    db.commit()
    return result


@app.get("/admin/ads/creatives", response_model=list[AdminAdCreativePayload])
def admin_ad_creatives(request: Request, db: Session = Depends(get_db)) -> list[AdminAdCreativePayload]:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    return list_admin_creatives(db)


@app.post("/admin/ads/creatives", response_model=AdminAdCreativePayload)
def admin_ad_creative_create(
    payload: AdminAdCreativeCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AdminAdCreativePayload:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    result = create_admin_creative(
        db,
        slot_id=payload.slot_id,
        title=payload.title,
        body_copy=payload.body_copy,
        image_url=payload.image_url,
        target_url=payload.target_url,
        cta_label=payload.cta_label,
        status=payload.status,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.commit()
    return result


@app.patch("/admin/ads/creatives/{creative_id}", response_model=AdminAdCreativePayload)
def admin_ad_creative_update(
    creative_id: int,
    payload: AdminAdCreativeUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AdminAdCreativePayload:
    context = require_auth_context(db, request)
    role_guard("admin")(context)
    result = update_admin_creative(
        db,
        creative_id,
        title=payload.title,
        body_copy=payload.body_copy,
        image_url=payload.image_url,
        target_url=payload.target_url,
        cta_label=payload.cta_label,
        status=payload.status,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    db.commit()
    return result


@app.post("/admin/reports/{report_id}/hide-post", response_model=CommunityReportPayload)
def admin_hide_post(
    report_id: int,
    payload: CommunityModerationActionRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> CommunityReportPayload:
    context = require_auth_context(db, request)
    role_guard("moderator", "admin")(context)
    result = hide_post_for_report(db, context, report_id=report_id, moderator_note=payload.moderator_note)
    db.commit()
    return result


@app.post("/admin/reports/{report_id}/mark-no-action", response_model=CommunityReportPayload)
def admin_mark_no_action(
    report_id: int,
    payload: CommunityModerationActionRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> CommunityReportPayload:
    context = require_auth_context(db, request)
    role_guard("moderator", "admin")(context)
    result = mark_report_no_action(db, context, report_id=report_id, moderator_note=payload.moderator_note)
    db.commit()
    return result
