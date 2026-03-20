from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_backend_asset_endpoints_accept_optional_run_id_query_param():
    main_src = _read("backend/app/main.py")
    research_src = _read("backend/app/services/research.py")
    repo_src = _read("backend/app/repositories/signal_repository.py")

    # API layer
    assert "def asset_latest" in main_src and "run_id" in main_src
    assert "def asset_history" in main_src and "run_id" in main_src

    # Service layer
    assert "def get_asset_latest(symbol: str, timeframe: str, run_id" in research_src
    assert "def get_asset_history(symbol: str, timeframe: str, limit: int = 200, run_id" in research_src

    # Repository helpers
    assert "def get_asset_snapshot_in_run" in repo_src
    assert "def get_asset_history_until_ts" in repo_src
