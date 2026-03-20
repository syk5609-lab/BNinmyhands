from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def test_coin_detail_mounts_discussion_block_in_active_runtime():
    src = _read("frontend-runtime/app/coin/[symbol]/page.tsx")
    assert 'import { DiscussionBlock } from "@/components/community/discussion-block"' in src
    assert '<DiscussionBlock symbol={parsedSymbol} runId={runId} timeframe={timeframe} />' in src


def test_discussion_block_keeps_guest_cta_and_authenticated_actions():
    src = _read("frontend-runtime/components/community/discussion-block.tsx")
    assert "LoginRequiredCTA" in src
    assert "useAuth" in src
    assert "createCommunityPost" in src
    assert "deleteCommunityPost" in src
    assert "reportCommunityPost" in src
    assert "Community is temporarily unavailable" in src


def test_latest_discussions_page_and_header_use_active_runtime_paths():
    page_src = _read("frontend-runtime/app/community/page.tsx")
    header_src = _read("frontend-runtime/components/layout/site-header.tsx")

    assert "LatestDiscussions" in page_src
    assert 'href="/community"' in header_src
