from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_dashboard_links_include_timeframe_query_param():
    src = _read("frontend-runtime/components/dashboard/rankings-table.tsx")
    assert "`/coin/${row.symbol}?timeframe=${timeframe}&run_id=${runId}`" in src


def test_dashboard_uses_latest_persisted_run_endpoint_not_live_scan():
    page_src = _read("frontend-runtime/app/page.tsx")
    api_src = _read("frontend-runtime/lib/api/scanner.ts")

    assert "fetchLatestResearchRun" in page_src
    assert "fetchTodayScan" not in page_src
    assert "fetchLatestResearchRun(timeframe: ScannerTimeframe)" in api_src
    assert "`/api/research/runs/latest?${search.toString()}`" in api_src


def test_backend_has_latest_run_endpoint_and_timeframe_filtering():
    main_src = _read("backend/app/main.py")
    research_src = _read("backend/app/services/research.py")
    repo_src = _read("backend/app/repositories/signal_repository.py")

    assert '@app.get("/api/research/runs/latest", response_model=ResearchRunDetail)' in main_src
    assert "def get_latest_research_run(timeframe: str)" in research_src
    assert "repo.get_latest_run(timeframe=timeframe)" in research_src
    assert "def get_latest_run(self, timeframe: str)" in repo_src


def test_coin_detail_page_handles_missing_or_invalid_timeframe_gracefully():
    src = _read("frontend-runtime/app/coin/[symbol]/page.tsx")
    assert "function parseTimeframe" in src
    assert "function parseRunId" in src
    assert "if (!parsedSymbol || !timeframe || !runId)" in src
    assert "return <UnavailableState" in src
    assert "try {" in src and "} catch {" in src


def test_dashboard_has_clear_empty_state_for_timeframe_without_runs():
    src = _read("frontend-runtime/app/page.tsx")
    assert "No completed run for" in src
    assert "uses persisted completed runs" in src
