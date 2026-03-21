"use client";

import { useEffect, useRef, useState } from "react";

import { DetailPage } from "@/components/rebuild/detail/detail-page";
import { adaptRuntimeDetail } from "@/lib/rebuild/adapters/detail";
import { fetchAdSlots } from "@/lib/api/ads";
import { fetchCommunityPosts } from "@/lib/api/community";
import { fetchRuntimeFlags } from "@/lib/api/feature-flags";
import { ScannerApiError, fetchAssetHistory, fetchAssetLatest, fetchResearchRunDetail } from "@/lib/api/scanner";
import { RebuildAdsMode, RebuildTimeframe } from "@/lib/rebuild/preview-state";
import { useAuth } from "@/components/auth/auth-provider";

type RuntimeDetailPreviewProps = {
  symbol: string;
  timeframe: RebuildTimeframe;
  runId: number | null;
};

export function RuntimeDetailPreview({ symbol, timeframe, runId }: RuntimeDetailPreviewProps) {
  const { user } = useAuth();
  const [fixture, setFixture] = useState(() =>
    adaptRuntimeDetail({
      symbol,
      timeframe,
      runId,
      status: runId ? "loading" : "unavailable",
      errorKind: runId ? undefined : "invalid_context",
    }),
  );
  const [adsMode, setAdsMode] = useState<RebuildAdsMode>("on");
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;

    const isCurrent = () => active && requestIdRef.current === requestId;

    const applyDetailState = (next: ReturnType<typeof adaptRuntimeDetail>) => {
      if (!isCurrent()) return;
      setFixture(next);
    };

    const applyAdsMode = (next: RebuildAdsMode) => {
      if (!isCurrent()) return;
      setAdsMode(next);
    };

    const load = async () => {
      if (!runId) {
        applyAdsMode("off");
        applyDetailState(
          adaptRuntimeDetail({
            symbol,
            timeframe,
            runId,
            status: "unavailable",
            errorKind: "invalid_context",
          }),
        );
        return;
      }

      applyAdsMode("on");
      applyDetailState(
        adaptRuntimeDetail({
          symbol,
          timeframe,
          runId,
          status: "loading",
        }),
      );

      let run;
      try {
        run = await fetchResearchRunDetail(runId);
      } catch (error) {
        applyAdsMode("off");
        applyDetailState(
          adaptRuntimeDetail({
            symbol,
            timeframe,
            runId,
            status: "unavailable",
            errorKind:
              error instanceof ScannerApiError && error.status === 404 ? "symbol_not_found" : "backend",
          }),
        );
        return;
      }

      if (run.timeframe !== timeframe) {
        applyAdsMode("off");
        applyDetailState(
          adaptRuntimeDetail({
            symbol,
            timeframe,
            runId,
            status: "unavailable",
            run,
            flags: null,
            errorKind: "timeframe_mismatch",
          }),
        );
        return;
      }

      let latest;
      let history;
      try {
        [latest, history] = await Promise.all([
          fetchAssetLatest(symbol.toUpperCase(), timeframe, runId),
          fetchAssetHistory(symbol.toUpperCase(), timeframe, runId, 120),
        ]);
      } catch (error) {
        applyAdsMode("off");
        applyDetailState(
          adaptRuntimeDetail({
            symbol,
            timeframe,
            runId,
            status: "unavailable",
            run,
            errorKind:
              error instanceof ScannerApiError && error.status === 404 ? "symbol_not_found" : "backend",
          }),
        );
        return;
      }

      applyDetailState(
        adaptRuntimeDetail({
          symbol,
          timeframe,
          runId,
          status: "ready",
          run,
          latest,
          history,
          posts: [],
          flags: null,
          sponsorSlot: null,
          user,
          communityState: "ready",
        }),
      );

      const flags = await fetchRuntimeFlags().catch(() => null);
      if (!isCurrent()) return;

      const communityEnabled = flags?.community_enabled !== false;
      const adsEnabled = flags?.ads_enabled !== false;
      const [posts, sponsorSlots] = await Promise.all([
        communityEnabled ? fetchCommunityPosts(symbol.toUpperCase(), runId).catch(() => null) : Promise.resolve([]),
        adsEnabled ? fetchAdSlots("detail_bottom").catch(() => []) : Promise.resolve([]),
      ]);
      if (!isCurrent()) return;

      applyAdsMode(adsEnabled ? "on" : "off");
      applyDetailState(
        adaptRuntimeDetail({
          symbol,
          timeframe,
          runId,
          status: "ready",
          run,
          latest,
          history,
          posts: posts ?? [],
          flags,
          sponsorSlot: sponsorSlots[0] ?? null,
          user,
          communityState: !communityEnabled ? "disabled" : posts === null ? "unavailable" : "ready",
        }),
      );
    };

    void load();
    return () => {
      active = false;
    };
  }, [runId, symbol, timeframe, user]);

  return <DetailPage ads={adsMode} fixture={fixture} guest={!user} mode="runtime" />;
}
