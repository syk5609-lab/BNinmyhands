"use client";

import { useMemo } from "react";

import { usePreviewRuntime } from "./preview-runtime";

export type SponsoredAd = {
  title: string;
  description: string;
  advertiser: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  authorRole: "member" | "admin";
  symbol: string;
  bucket: string | null;
  content: string;
  createdAt: string;
  runId: string | null;
  timeframe: string | null;
};

const ads: SponsoredAd[] = [
  {
    title: "Institutional-Grade Data API",
    description: "Access real-time derivatives data for 500+ pairs. REST & WebSocket endpoints with 99.9% uptime SLA.",
    advertiser: "DataVault Pro",
    ctaLabel: "Learn More",
    ctaUrl: "https://example.com/datavault",
  },
  {
    title: "Risk Management Platform",
    description: "Automated position sizing, liquidation alerts, and portfolio heat maps for derivatives traders.",
    advertiser: "RiskShield",
    ctaLabel: "Try Free",
    ctaUrl: "https://example.com/riskshield",
  },
];

const postsBySymbol: Record<string, CommunityPost[]> = {
  COSUSDT: [
    {
      id: "p_cos_1",
      authorName: "Hunnit",
      authorRole: "member",
      symbol: "COSUSDT",
      bucket: "breakout_watch",
      content: "OI is building alongside taker bid. I would only trust continuation if funding stays contained through the next run.",
      createdAt: "2026-03-20T20:10:00.000Z",
      runId: "run_vptd5wa1",
      timeframe: "4h",
    },
    {
      id: "p_cos_2",
      authorName: "TeamOps",
      authorRole: "admin",
      symbol: "COSUSDT",
      bucket: "breakout_watch",
      content: "Watch whether the composite delta holds above zero. If that rolls over while price stalls, the setup weakens quickly.",
      createdAt: "2026-03-20T18:32:00.000Z",
      runId: "run_vptd5wa1",
      timeframe: "4h",
    },
  ],
};

export function usePreviewCommunityData() {
  const runtime = usePreviewRuntime();

  return useMemo(
    () => ({
      getAdBySlot(slotIndex: number) {
        return ads[slotIndex] ?? ads[0];
      },
      getPostsForSymbol(symbol: string) {
        if (runtime.searchParams.get("state") === "unavailable") {
          return [];
        }
        return postsBySymbol[symbol.toUpperCase()] ?? [];
      },
    }),
    [runtime.searchParams],
  );
}
