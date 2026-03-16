from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    binance_futures_base_url: str = Field("https://fapi.binance.com", env="BINANCE_FUTURES_BASE_URL")
    request_timeout_seconds: int = Field(10, env="REQUEST_TIMEOUT_SECONDS")
    ticker_cache_ttl_seconds: int = Field(10, env="TICKER_CACHE_TTL_SECONDS")
    database_url: str = Field(
        "postgresql+psycopg://postgres:postgres@localhost:5432/binance_scanner",
        env="DATABASE_URL",
    )
    auto_snapshot_enabled: bool = Field(False, env="AUTO_SNAPSHOT_ENABLED")
    auto_snapshot_interval_seconds: int = Field(900, env="AUTO_SNAPSHOT_INTERVAL_SECONDS")
    auto_snapshot_timeframe: str = Field("1h", env="AUTO_SNAPSHOT_TIMEFRAME")
    auto_snapshot_limit: int = Field(50, env="AUTO_SNAPSHOT_LIMIT")
    auto_snapshot_volume_percentile: float = Field(0.7, env="AUTO_SNAPSHOT_VOLUME_PERCENTILE")


settings = Settings()
