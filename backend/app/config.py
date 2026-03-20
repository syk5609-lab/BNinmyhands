from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    environment: str = Field("development", validation_alias="ENVIRONMENT")
    binance_futures_base_url: str = Field(
        "https://fapi.binance.com",
        validation_alias="BINANCE_FUTURES_BASE_URL",
    )
    request_timeout_seconds: int = Field(10, validation_alias="REQUEST_TIMEOUT_SECONDS")
    ticker_cache_ttl_seconds: int = Field(10, validation_alias="TICKER_CACHE_TTL_SECONDS")
    database_url: str = Field(
        "postgresql+psycopg://postgres:postgres@localhost:5432/binance_scanner",
        validation_alias="DATABASE_URL",
    )
    auto_snapshot_enabled: bool = Field(False, validation_alias="AUTO_SNAPSHOT_ENABLED")
    auto_snapshot_interval_seconds: int = Field(900, validation_alias="AUTO_SNAPSHOT_INTERVAL_SECONDS")
    auto_snapshot_timeframe: str = Field("1h", validation_alias="AUTO_SNAPSHOT_TIMEFRAME")
    auto_snapshot_limit: int = Field(50, validation_alias="AUTO_SNAPSHOT_LIMIT")
    auto_snapshot_volume_percentile: float = Field(0.7, validation_alias="AUTO_SNAPSHOT_VOLUME_PERCENTILE")
    frontend_origins: str = Field(
        "http://127.0.0.1:3000,http://localhost:3000",
        validation_alias="FRONTEND_ORIGINS",
    )
    session_cookie_name: str = Field("bn_launch_session", validation_alias="SESSION_COOKIE_NAME")
    session_duration_seconds: int = Field(60 * 60 * 24 * 14, validation_alias="SESSION_DURATION_SECONDS")
    session_last_seen_update_seconds: int = Field(60, validation_alias="SESSION_LAST_SEEN_UPDATE_SECONDS")
    secure_cookies: bool = Field(False, validation_alias="SECURE_COOKIES")
    email_verification_token_ttl_seconds: int = Field(
        60 * 60 * 24,
        validation_alias="EMAIL_VERIFICATION_TOKEN_TTL_SECONDS",
    )
    password_reset_token_ttl_seconds: int = Field(
        60 * 60,
        validation_alias="PASSWORD_RESET_TOKEN_TTL_SECONDS",
    )
    auth_dev_token_preview_enabled: bool = Field(True, validation_alias="AUTH_DEV_TOKEN_PREVIEW_ENABLED")

    @property
    def frontend_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    @property
    def session_cookie_secure(self) -> bool:
        return self.secure_cookies or self.environment.lower() == "production"


settings = Settings()
