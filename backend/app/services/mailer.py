import logging

from app.config import settings

logger = logging.getLogger(__name__)


def send_email_verification(email: str, token: str) -> str | None:
    logger.info("Email verification token for %s: %s", email, token)
    if settings.auth_dev_token_preview_enabled:
        return token
    return None


def send_password_reset(email: str, token: str) -> str | None:
    logger.info("Password reset token for %s: %s", email, token)
    if settings.auth_dev_token_preview_enabled:
        return token
    return None
