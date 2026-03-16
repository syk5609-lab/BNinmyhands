from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    binance_futures_base_url: str = Field("https://fapi.binance.com", env="BINANCE_FUTURES_BASE_URL")
    request_timeout_seconds: int = Field(10, env="REQUEST_TIMEOUT_SECONDS")
    ticker_cache_ttl_seconds: int = Field(10, env="TICKER_CACHE_TTL_SECONDS")


settings = Settings()
