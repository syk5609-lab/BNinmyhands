"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { LoginRequiredCTA } from "@/components/auth/login-required-cta";
import { TrustNote } from "@/components/trust/trust-note";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CommunityApiError,
  createCommunityPost,
  deleteCommunityPost,
  fetchCommunityPosts,
  reportCommunityPost,
} from "@/lib/api/community";
import { FeatureFlagsApiError, fetchRuntimeFlags } from "@/lib/api/feature-flags";
import { RuntimeFeatureFlags } from "@/lib/types/feature-flags";
import { CommunityPost, CommunityReportReason } from "@/lib/types/community";
import { ScannerTimeframe } from "@/lib/types/scanner";

const REPORT_REASONS: CommunityReportReason[] = ["spam", "impersonation", "scam_or_promo", "harassment", "other"];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export function DiscussionBlock({
  symbol,
  runId,
  timeframe,
}: {
  symbol: string;
  runId: number;
  timeframe: ScannerTimeframe;
}) {
  const { user, loading } = useAuth();
  const [flags, setFlags] = useState<RuntimeFeatureFlags>({
    community_enabled: true,
    ads_enabled: true,
    write_actions_enabled: true,
  });
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openReportFor, setOpenReportFor] = useState<number | null>(null);
  const [reportReasonById, setReportReasonById] = useState<Record<number, CommunityReportReason>>({});
  const [workingPostId, setWorkingPostId] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    if (!flags.community_enabled) {
      setPosts([]);
      setLoadingPosts(false);
      setLoadError(null);
      return;
    }
    setLoadingPosts(true);
    setLoadError(null);
    try {
      const nextPosts = await fetchCommunityPosts(symbol, runId);
      setPosts(nextPosts);
    } catch (error) {
      setLoadError(error instanceof CommunityApiError ? error.message : "Could not load discussion right now.");
    } finally {
      setLoadingPosts(false);
    }
  }, [flags.community_enabled, runId, symbol]);

  useEffect(() => {
    let active = true;

    const loadFlags = async () => {
      try {
        const nextFlags = await fetchRuntimeFlags();
        if (active) {
          setFlags(nextFlags);
        }
      } catch (error) {
        if (!(error instanceof FeatureFlagsApiError)) {
          return;
        }
      }
    };

    void loadFlags();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleCreate = async () => {
    if (!user || !draft.trim() || !flags.write_actions_enabled || !flags.community_enabled) return;
    setSubmitting(true);
    setActionError(null);
    setNotice(null);
    try {
      await createCommunityPost({ symbol, run_id: runId, body: draft.trim() });
      setDraft("");
      setNotice("Post added.");
      await loadPosts();
    } catch (error) {
      setActionError(error instanceof CommunityApiError ? error.message : "Could not post right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!user || !flags.write_actions_enabled || !window.confirm("Delete this post?")) return;
    setWorkingPostId(postId);
    setActionError(null);
    setNotice(null);
    try {
      await deleteCommunityPost(postId);
      setNotice("Post deleted.");
      await loadPosts();
    } catch (error) {
      setActionError(error instanceof CommunityApiError ? error.message : "Could not delete this post.");
    } finally {
      setWorkingPostId(null);
    }
  };

  const handleReport = async (postId: number) => {
    if (!user || !flags.write_actions_enabled) return;
    const reason = reportReasonById[postId] ?? "spam";
    setWorkingPostId(postId);
    setActionError(null);
    setNotice(null);
    try {
      await reportCommunityPost(postId, reason);
      setNotice("Report submitted.");
      setOpenReportFor(null);
    } catch (error) {
      setActionError(error instanceof CommunityApiError ? error.message : "Could not submit report.");
    } finally {
      setWorkingPostId(null);
    }
  };

  const canModerate = user?.role === "moderator" || user?.role === "admin";
  const writeActionsEnabled = flags.community_enabled && flags.write_actions_enabled;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Discussion</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Analysis-support notes for {symbol}. Keep posts specific, evidence-based, and tied to the current setup.
            </p>
          </div>
          <Link href="/community" className="text-xs text-emerald-300 hover:underline">
            Latest discussions
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TrustNote
          title="Research / educational use only. Not financial advice."
          body="Community exists for analysis-support discussion, not pump-style promotion. Keep notes evidence-based and tied to the setup you are looking at."
        />

        {!flags.community_enabled ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-400">
            Community is currently paused for launch hardening. Read-only analysis remains available.
          </div>
        ) : null}

        {loadError ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-400">
            Community is temporarily unavailable. The rest of the coin detail remains available.
          </div>
        ) : null}

        {!flags.community_enabled ? null : loading ? (
          <p className="text-sm text-zinc-500">Checking account state...</p>
        ) : user && writeActionsEnabled ? (
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <Textarea
              rows={4}
              placeholder={`Share a concise setup note for ${symbol}: what you see, what confirms it, and what invalidates it.`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">Text only. Latest first. Single-depth discussion for launch.</p>
              <Button type="button" onClick={handleCreate} disabled={submitting || !draft.trim()}>
                {submitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        ) : user && !writeActionsEnabled ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-400">
            Posting, deleting, and reporting are temporarily paused. Existing discussion remains visible in read-only mode.
          </div>
        ) : (
          <LoginRequiredCTA
            title="Login required to join discussion"
            description="Guest browsing stays open, but posting and reporting require an account."
          />
        )}

        {actionError ? <p className="text-sm text-rose-400">{actionError}</p> : null}
        {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}

        {!flags.community_enabled ? null : loadingPosts ? (
          <p className="text-sm text-zinc-500">Loading discussion...</p>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
            No discussion yet for this coin/run. The first useful setup note sets the tone.
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const isOwnPost = user?.id === post.author.id;
              const canDelete = Boolean(user && writeActionsEnabled && (isOwnPost || canModerate));
              const canReport = Boolean(user && writeActionsEnabled && !isOwnPost);

              return (
                <div key={post.id} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{post.author.nickname}</p>
                      <p className="text-xs text-zinc-500">
                        {formatTimestamp(post.created_at)}
                        {post.run_id ? ` · run ${post.run_id} · ${post.timeframe ?? timeframe}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canDelete ? (
                        <button
                          type="button"
                          className="text-xs text-zinc-500 transition hover:text-zinc-200"
                          onClick={() => void handleDelete(post.id)}
                          disabled={workingPostId === post.id}
                        >
                          Delete
                        </button>
                      ) : null}
                      {canReport ? (
                        <button
                          type="button"
                          className="text-xs text-zinc-500 transition hover:text-zinc-200"
                          onClick={() => setOpenReportFor((current) => (current === post.id ? null : post.id))}
                          disabled={workingPostId === post.id}
                        >
                          Report
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.body}</p>
                  {openReportFor === post.id ? (
                    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 sm:flex-row sm:items-center">
                      <Select
                        value={reportReasonById[post.id] ?? "spam"}
                        onChange={(event) =>
                          setReportReasonById((current) => ({
                            ...current,
                            [post.id]: event.target.value as CommunityReportReason,
                          }))
                        }
                        className="sm:max-w-[220px]"
                      >
                        {REPORT_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason.replaceAll("_", " ")}
                          </option>
                        ))}
                      </Select>
                      <Button type="button" onClick={() => void handleReport(post.id)} disabled={workingPostId === post.id}>
                        {workingPostId === post.id ? "Submitting..." : "Submit report"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
