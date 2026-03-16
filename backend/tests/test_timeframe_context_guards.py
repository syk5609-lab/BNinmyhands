from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_dashboard_links_include_timeframe_query_param():
    src = _read("frontend/components/dashboard/rankings-table.tsx")
    assert "`/coin/${row.symbol}?timeframe=${timeframe}`" in src


def test_api_client_asset_calls_include_timeframe_query_param():
    src = _read("frontend/lib/api/scanner.ts")
    assert "fetchAssetLatest(symbol: string, timeframe: ScannerTimeframe)" in src
    assert "new URLSearchParams({ timeframe })" in src
    assert "fetchAssetHistory(" in src
    assert "new URLSearchParams({ timeframe, limit: String(limit) })" in src


def test_backend_asset_endpoints_require_timeframe_and_service_filters():
    main_src = _read("backend/app/main.py")
    research_src = _read("backend/app/services/research.py")
    repo_src = _read("backend/app/repositories/signal_repository.py")

    assert 'timeframe: Literal["1h", "4h", "24h"] = Query(default="1h")' in main_src
    assert "def get_asset_latest(symbol: str, timeframe: str)" in research_src
    assert "def get_asset_history(symbol: str, timeframe: str, limit: int = 200)" in research_src
    assert "SignalRun.timeframe == timeframe" in repo_src


def test_coin_detail_page_handles_missing_or_invalid_timeframe_gracefully():
    src = _read("frontend/app/coin/[symbol]/page.tsx")
    assert "function parseTimeframe" in src
    assert "if (!parsedSymbol || !timeframe)" in src
    assert "return <UnavailableState" in src
    assert "try {" in src and "} catch {" in src
