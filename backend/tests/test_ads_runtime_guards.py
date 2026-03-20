from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_sponsored_label_and_safe_ad_component_exist_in_active_runtime():
    src = _read("frontend-runtime/components/ads/sponsored-card.tsx")
    assert "Sponsored" in src
    assert 'rel="noreferrer noopener sponsored"' in src
    assert "logAdEvent" in src


def test_dashboard_and_detail_wire_launch_ad_placements():
    page_src = _read("frontend-runtime/app/page.tsx")
    shell_src = _read("frontend-runtime/components/dashboard/dashboard-shell.tsx")
    detail_src = _read("frontend-runtime/app/coin/[symbol]/page.tsx")

    assert '<AdPlacement placement="dashboard_top"' in page_src
    assert '<AdPlacement placement="dashboard_mid"' in shell_src
    assert '<AdPlacement placement="detail_bottom"' in detail_src


def test_admin_surface_exists_only_in_active_runtime():
    page_src = _read("frontend-runtime/app/admin/page.tsx")
    console_src = _read("frontend-runtime/components/admin/admin-console.tsx")

    assert "AdminConsole" in page_src
    assert "Ad slots" in console_src
    assert "Create creative" in console_src
    assert 'user.role !== "admin"' in console_src
    assert "LoginRequiredCTA" in console_src
