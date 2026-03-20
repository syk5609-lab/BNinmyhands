from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_dashboard_and_detail_render_trust_copy_in_active_runtime():
    dashboard_src = _read("frontend-runtime/app/page.tsx")
    detail_src = _read("frontend-runtime/app/coin/[symbol]/page.tsx")
    trust_src = _read("frontend-runtime/components/trust/trust-note.tsx")

    assert "TrustNote" in dashboard_src
    assert "TrustNote" in detail_src
    assert "Research / educational use only." in trust_src
    assert "Not financial advice." in trust_src


def test_discussion_block_handles_disabled_flags_and_read_only_mode():
    src = _read("frontend-runtime/components/community/discussion-block.tsx")
    assert "fetchRuntimeFlags" in src
    assert "Community is currently paused for launch hardening." in src
    assert "Posting, deleting, and reporting are temporarily paused." in src
    assert "Community exists for analysis-support discussion, not pump-style promotion." in src


def test_ads_and_admin_console_integrate_runtime_flags():
    ad_src = _read("frontend-runtime/components/ads/ad-placement.tsx")
    admin_src = _read("frontend-runtime/components/admin/admin-console.tsx")
    flags_api_src = _read("frontend-runtime/lib/api/feature-flags.ts")

    assert "fetchRuntimeFlags" in ad_src
    assert "fetchAdminFeatureFlags" in admin_src
    assert "updateAdminFeatureFlag" in admin_src
    assert '"/runtime/flags"' in flags_api_src
    assert '"/admin/feature-flags"' in flags_api_src


def test_community_page_remains_routed_in_active_runtime():
    page_src = _read("frontend-runtime/app/community/page.tsx")
    latest_src = _read("frontend-runtime/components/community/latest-discussions.tsx")

    assert "LatestDiscussions" in page_src
    assert "Community is currently paused for launch hardening." in latest_src
