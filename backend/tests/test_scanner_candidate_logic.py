from datetime import datetime, timezone

from app.services import scanner


def test_bucket_assignment_breakout_watch():
    bucket, tags = scanner._assign_signal_bucket_and_tags(
        composite_score=1.5,
        setup_score=1.0,
        positioning_score=0.7,
        momentum_score=1.2,
        risk_penalty=-0.1,
        oi_change=1.5,
        flow=10.0,
        ls_ratio=1.05,
        price_change_24h=2.5,
    )
    assert bucket == "breakout_watch"
    assert "oi_up" in tags


def test_build_scan_applies_previous_run_deltas(monkeypatch):
    monkeypatch.setattr(
        scanner,
        "fetch_futures_tickers_24h",
        lambda: [
            {"symbol": "BTCUSDT", "lastPrice": "100", "priceChangePercent": "2", "quoteVolume": "1000000"},
            {"symbol": "ETHUSDT", "lastPrice": "50", "priceChangePercent": "1", "quoteVolume": "900000"},
        ],
    )
    monkeypatch.setattr(scanner, "get_tradable_usdt_perpetual_symbols", lambda: {"BTCUSDT", "ETHUSDT"})
    monkeypatch.setattr(scanner, "_compute_oi_change_percent", lambda *args, **kwargs: 1.0)
    monkeypatch.setattr(scanner, "_compute_taker_net_flow", lambda *args, **kwargs: 100.0)
    monkeypatch.setattr(scanner, "_compute_long_short_ratio", lambda *args, **kwargs: 1.05)
    monkeypatch.setattr(
        scanner,
        "_load_previous_run_symbol_metrics",
        lambda timeframe: {
            "BTCUSDT": {
                "previous_rank": 5,
                "previous_composite_score": 0.5,
                "previous_setup_score": 0.3,
                "previous_positioning_score": 0.2,
            }
        },
    )

    result = scanner.build_scan(limit=2, volume_percentile=0.0, timeframe="1h")
    btc = next(r for r in result.results if r.symbol == "BTCUSDT")

    assert btc.previous_rank == 5
    assert btc.previous_composite_score == 0.5
    assert btc.composite_delta is not None
    assert btc.setup_delta is not None
    assert btc.positioning_delta is not None
    assert btc.signal_bucket in {"breakout_watch", "positioning_build", "squeeze_watch", "overheat_risk"}


def test_build_scan_populates_funding_fields(monkeypatch):
    monkeypatch.setattr(
        scanner,
        "fetch_futures_tickers_24h",
        lambda: [
            {"symbol": "BTCUSDT", "lastPrice": "100", "priceChangePercent": "2", "quoteVolume": "1000000"},
            {"symbol": "ETHUSDT", "lastPrice": "50", "priceChangePercent": "1", "quoteVolume": "900000"},
            {"symbol": "XRPUSDT", "lastPrice": "1", "priceChangePercent": "0.5", "quoteVolume": "800000"},
        ],
    )
    monkeypatch.setattr(scanner, "get_tradable_usdt_perpetual_symbols", lambda: {"BTCUSDT", "ETHUSDT", "XRPUSDT"})
    monkeypatch.setattr(scanner, "_compute_oi_change_percent", lambda *args, **kwargs: 1.0)
    monkeypatch.setattr(scanner, "_compute_taker_net_flow", lambda *args, **kwargs: 100.0)
    monkeypatch.setattr(scanner, "_compute_long_short_ratio", lambda *args, **kwargs: 1.05)
    monkeypatch.setattr(scanner, "_load_previous_run_symbol_metrics", lambda timeframe: {})
    monkeypatch.setattr(
        scanner,
        "_load_latest_funding_map",
        lambda: {"BTCUSDT": 0.0001, "ETHUSDT": -0.0002, "XRPUSDT": 0.0},
    )

    result = scanner.build_scan(limit=3, volume_percentile=0.0, timeframe="1h")
    funding_by_symbol = {row.symbol: row for row in result.results}

    assert funding_by_symbol["BTCUSDT"].funding_rate_latest == 0.0001
    assert funding_by_symbol["BTCUSDT"].funding_rate_abs == 0.0001
    assert funding_by_symbol["BTCUSDT"].funding_bias == "positive"

    assert funding_by_symbol["ETHUSDT"].funding_rate_latest == -0.0002
    assert funding_by_symbol["ETHUSDT"].funding_rate_abs == 0.0002
    assert funding_by_symbol["ETHUSDT"].funding_bias == "negative"

    assert funding_by_symbol["XRPUSDT"].funding_rate_latest == 0.0
    assert funding_by_symbol["XRPUSDT"].funding_rate_abs == 0.0
    assert funding_by_symbol["XRPUSDT"].funding_bias == "neutral"
