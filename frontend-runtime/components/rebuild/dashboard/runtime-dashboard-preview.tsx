"use client";

import { useEffect, useRef, useState } from "react";

import { DashboardPage } from "@/components/rebuild/dashboard/dashboard-page";
import { adaptRuntimeDashboard } from "@/lib/rebuild/adapters/dashboard";
import { fetchAdSlots } from "@/lib/api/ads";
import { fetchRuntimeFlags } from "@/lib/api/feature-flags";
import { ScannerApiError, fetchLatestResearchRun } from "@/lib/api/scanner";
import { RebuildAdsMode, RebuildTimeframe } from "@/lib/rebuild/preview-state";
import { useAuth } from "@/components/auth/auth-provider";

type RuntimeDashboardPreviewProps = {
  timeframe: RebuildTimeframe;
};

export function RuntimeDashboardPreview({ timeframe }: RuntimeDashboardPreviewProps) {
  const { user } = useAuth();
  const [fixture, setFixture] = useState(() => adaptRuntimeDashboard({ timeframe, status: "loading" }));
  const [adsMode, setAdsMode] = useState<RebuildAdsMode>("on");
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;

    const isCurrent = () => active && requestIdRef.current === requestId;

    const applyDashboardState = (next: ReturnType<typeof adaptRuntimeDashboard>) => {
      if (!isCurrent()) return;
      setFixture(next);
    };

    const applyAdsMode = (next: RebuildAdsMode) => {
      if (!isCurrent()) return;
      setAdsMode(next);
    };

    const load = async () => {
      applyAdsMode("on");
      applyDashboardState(adaptRuntimeDashboard({ timeframe, status: "loading" }));

      let run;

      try {
        run = await fetchLatestResearchRun(timeframe);
      } catch (error) {
        applyAdsMode("off");
        applyDashboardState(
          adaptRuntimeDashboard({
            timeframe,
            status: "unavailable",
            errorKind: error instanceof ScannerApiError && error.status === 404 ? "not_found" : "backend",
          }),
        );
        return;
      }

      applyDashboardState(
        adaptRuntimeDashboard({
          timeframe,
          status: "ready",
          run,
          flags: null,
          topSlot: null,
          midSlot: null,
        }),
      );

      const flags = await fetchRuntimeFlags().catch(() => null);
      if (!isCurrent()) return;

      const adsEnabled = flags?.ads_enabled !== false;
      if (!adsEnabled) {
        applyAdsMode("off");
        applyDashboardState(
          adaptRuntimeDashboard({
            timeframe,
            status: "ready",
            run,
            flags,
            topSlot: null,
            midSlot: null,
          }),
        );
        return;
      }

      const [topSlots, midSlots] = await Promise.all([
        fetchAdSlots("dashboard_top").catch(() => []),
        fetchAdSlots("dashboard_mid").catch(() => []),
      ]);
      if (!isCurrent()) return;

      applyAdsMode("on");
      applyDashboardState(
        adaptRuntimeDashboard({
          timeframe,
          status: "ready",
          run,
          flags,
          topSlot: topSlots[0] ?? null,
          midSlot: midSlots[0] ?? null,
        }),
      );
    };

    void load();
    return () => {
      active = false;
    };
  }, [timeframe]);

  return <DashboardPage ads={adsMode} fixture={fixture} guest={!user} mode="runtime" />;
}
