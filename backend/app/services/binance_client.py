import time
from typing import Any

import requests
from fastapi import HTTPException

from app.config import settings

_TICKERS_CACHE: dict[str, Any] = {"data": None, "expires_at": 0.0}
_OI_CACHE: dict[tuple[str, str, int], dict[str, Any]] = {}
_TAKER_CACHE: dict[tuple[str, str, int], dict[str, Any]] = {}
_LS_CACHE: dict[tuple[str, str, int], dict[str, Any]] = {}
_TRADABLE_SYMBOLS_CACHE: dict[str, Any] = {"data": None, "expires_at": 0.0}
_METRIC_CACHE_TTL_SECONDS = 45
_TRADABLE_SYMBOLS_CACHE_TTL_SECONDS = 600
_MIN_ACTIVE_QUOTE_VOLUME_24H = 100000.0


def _request_json(url: str, params: dict[str, Any]) -> Any:
    try:
        response = requests.get(url, params=params, timeout=settings.request_timeout_seconds)
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"Failed to reach Binance Futures API: {exc}") from exc

    if response.status_code != 200:
        try:
            error_payload = response.json()
        except ValueError:
            error_payload = {"message": response.text}
        raise HTTPException(
            status_code=502,
            detail=f"Binance Futures API error ({response.status_code}): {error_payload}",
        )

    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Invalid JSON returned by Binance Futures API.") from exc


def _fetch_list_endpoint(url: str, params: dict[str, Any]) -> list[dict]:
    data = _request_json(url=url, params=params)
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail="Unexpected Binance response format.")
    return data


def _fetch_with_cache(
    cache: dict[tuple[str, str, int], dict[str, Any]],
    cache_key: tuple[str, str, int],
    url: str,
    params: dict[str, Any],
) -> list[dict]:
    now = time.time()
    cached = cache.get(cache_key)
    if cached and now < float(cached.get("expires_at", 0.0)):
        return cached["data"]

    data = _fetch_list_endpoint(url=url, params=params)
    cache[cache_key] = {"data": data, "expires_at": now + _METRIC_CACHE_TTL_SECONDS}
    return data


def fetch_futures_tickers_24h() -> list[dict]:
    """Return the raw JSON list from /fapi/v1/ticker/24hr, raise HTTP errors properly."""
    now = time.time()
    cached_data = _TICKERS_CACHE.get("data")
    expires_at = _TICKERS_CACHE.get("expires_at", 0.0)
    if cached_data is not None and now < expires_at:
        return cached_data

    url = f"{settings.binance_futures_base_url}/fapi/v1/ticker/24hr"
    data = _fetch_list_endpoint(url=url, params={})
    _TICKERS_CACHE["data"] = data
    _TICKERS_CACHE["expires_at"] = now + settings.ticker_cache_ttl_seconds
    return data


def fetch_open_interest_hist(symbol: str, period: str = "15m", limit: int = 50) -> list[dict]:
    """Return JSON list from /futures/data/openInterestHist for given symbol."""
    cache_key = (symbol, period, limit)
    url = f"{settings.binance_futures_base_url}/futures/data/openInterestHist"
    params = {"symbol": symbol, "period": period, "limit": limit}
    return _fetch_with_cache(cache=_OI_CACHE, cache_key=cache_key, url=url, params=params)


def fetch_taker_longshort_ratio(symbol: str, period: str = "15m", limit: int = 50) -> list[dict]:
    """Return JSON list from /futures/data/takerlongshortRatio for given symbol."""
    cache_key = (symbol, period, limit)
    url = f"{settings.binance_futures_base_url}/futures/data/takerlongshortRatio"
    params = {"symbol": symbol, "period": period, "limit": limit}
    return _fetch_with_cache(cache=_TAKER_CACHE, cache_key=cache_key, url=url, params=params)


def fetch_global_longshort_accounts(symbol: str, period: str = "15m", limit: int = 50) -> list[dict]:
    """Return JSON list from /futures/data/globalLongShortAccountRatio for given symbol."""
    cache_key = (symbol, period, limit)
    url = f"{settings.binance_futures_base_url}/futures/data/globalLongShortAccountRatio"
    params = {"symbol": symbol, "period": period, "limit": limit}
    return _fetch_with_cache(cache=_LS_CACHE, cache_key=cache_key, url=url, params=params)


def get_tradable_usdt_perpetual_symbols() -> set[str]:
    """Return TRADING USDⓈ-M perpetual USDT symbols from /fapi/v1/exchangeInfo."""
    now = time.time()
    cached_data = _TRADABLE_SYMBOLS_CACHE.get("data")
    expires_at = _TRADABLE_SYMBOLS_CACHE.get("expires_at", 0.0)
    if isinstance(cached_data, set) and now < expires_at:
        return cached_data

    url = f"{settings.binance_futures_base_url}/fapi/v1/exchangeInfo"
    payload = _request_json(url=url, params={})
    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail="Unexpected Binance exchangeInfo format.")

    symbols = payload.get("symbols")
    if not isinstance(symbols, list):
        raise HTTPException(status_code=502, detail="Unexpected Binance exchangeInfo symbols format.")

    tradable_symbols: set[str] = set()
    for item in symbols:
        if not isinstance(item, dict):
            continue
        symbol = item.get("symbol")
        status = item.get("status")
        contract_type = item.get("contractType")
        if (
            isinstance(symbol, str)
            and symbol.endswith("USDT")
            and status == "TRADING"
            and contract_type == "PERPETUAL"
        ):
            tradable_symbols.add(symbol)

    ticker_rows = fetch_futures_tickers_24h()
    ticker_map: dict[str, tuple[float, float]] = {}
    for row in ticker_rows:
        if not isinstance(row, dict):
            continue
        symbol = row.get("symbol")
        if not isinstance(symbol, str):
            continue

        try:
            last_price = float(row.get("lastPrice", 0.0))
            quote_volume = float(row.get("quoteVolume", 0.0))
        except (TypeError, ValueError):
            continue

        ticker_map[symbol] = (last_price, quote_volume)

    active_symbols: set[str] = set()
    for symbol in tradable_symbols:
        ticker_info = ticker_map.get(symbol)
        if not ticker_info:
            continue
        last_price, quote_volume = ticker_info
        if last_price > 0.0 and quote_volume >= _MIN_ACTIVE_QUOTE_VOLUME_24H:
            active_symbols.add(symbol)

    _TRADABLE_SYMBOLS_CACHE["data"] = active_symbols
    _TRADABLE_SYMBOLS_CACHE["expires_at"] = now + _TRADABLE_SYMBOLS_CACHE_TTL_SECONDS
    return active_symbols
