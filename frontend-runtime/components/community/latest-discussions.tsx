"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TrustNote } from "@/components/trust/trust-note";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CommunityApiError, fetchLatestCommunityPosts } from "@/lib/api/community";
import { fetchRuntimeFlags } from "@/lib/api/feature-flags";
import { RuntimeFeatureFlags } from "@/lib/types/feature-flags";
import { CommunityPost } from "@/lib/types/community";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export function LatestDiscussions() {
  const [flags, setFlags] = useState<RuntimeFeatureFlags>({
    community_enabled: true,
    ads_enabled: true,
    write_actions_enabled: true,
  });
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [flagsResult, postsResult] = await Promise.allSettled([
          fetchRuntimeFlags(),
          fetchLatestCommunityPosts(50),
        ]);

        if (!active) {
          return;
        }

        if (flagsResult.status === "fulfilled") {
          setFlags(flagsResult.value);
        }

        if (postsResult.status === "fulfilled") {
          const nextPosts = postsResult.value;
          setPosts(nextPosts);
        } else {
          const err = postsResult.reason;
          setError(err instanceof CommunityApiError ? err.message : "Could not load latest discussions.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <h1 className="text-lg font-semibold text-zinc-100">Latest discussions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Coin-context notes from the latest launch community activity. This stays analysis-first and latest-first.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <TrustNote
          title="Research / educational use only. Not financial advice."
          body="Community is for analysis-support discussion and launch notes, not pump-style promotion."
        />
        {!flags.community_enabled ? (
          <p className="text-sm text-zinc-400">
            Community is currently paused for launch hardening. Coin detail analysis remains available.
          </p>
        ) : null}
        {error ? <p className="text-sm text-zinc-400">{error}</p> : null}
        {flags.community_enabled && loading ? <p className="text-sm text-zinc-500">Loading latest discussions...</p> : null}
        {flags.community_enabled && !loading && posts.length === 0 ? (
          <p className="text-sm text-zinc-500">No community posts yet.</p>
        ) : null}
        {flags.community_enabled && posts.map((post) => {
          const detailHref =
            post.run_id && post.timeframe
              ? `/coin/${post.symbol}?timeframe=${encodeURIComponent(post.timeframe)}&run_id=${post.run_id}`
              : null;

          return (
            <div key={post.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{post.author.nickname}</p>
                  <p className="text-xs text-zinc-500">{formatTimestamp(post.created_at)}</p>
                </div>
                {detailHref ? (
                  <Link href={detailHref} className="text-xs text-emerald-300 hover:underline">
                    {post.symbol}
                  </Link>
                ) : (
                  <span className="text-xs text-zinc-500">{post.symbol}</span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.body}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
