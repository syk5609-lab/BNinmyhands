import { RebuildPreviewState, RebuildTimeframe } from "@/lib/rebuild/preview-state";

import { REBUILD_PRESETS, REBUILD_SPONSORS, RebuildPresetId, RebuildSponsor } from "@/fixtures/rebuild/runtime.fixture";

export type DashboardRowFixture = {
  symbol: string;
  bucket: string;
  reasonTags: string[];
  last: string;
  change24h: string;
  volume: string;
  composite: string;
  rankDelta: string;
  oiChange: string;
  takerFlow: string;
  longShort: string;
  funding: string;
};

export type DashboardFixture = {
  state: RebuildPreviewState;
  surfaceLabel: string;
  timeframe: RebuildTimeframe;
  runId: number;
  updatedLabel: string;
  dataAgeLabel: string;
  rowCount: number;
  runStatus: string;
  activePreset: RebuildPresetId;
  unavailableTitle?: string;
  unavailableBody?: string;
  topCandidates: Array<{
    symbol: string;
    bucket: string;
    composite: string;
    reasonTags: string[];
  }>;
  bucketSummary: Array<{
    label: string;
    count: number;
    share: string;
  }>;
  rows: DashboardRowFixture[];
  sponsors: {
    top?: RebuildSponsor;
    mid?: RebuildSponsor;
  };
};

const BASE_ROWS: DashboardRowFixture[] = [
  {
    symbol: "BTCUSDT",
    bucket: "Breakout",
    reasonTags: ["volume reclaim", "momentum +", "funding calm"],
    last: "84,420.5",
    change24h: "+2.84%",
    volume: "3.42B",
    composite: "82.6",
    rankDelta: "+3",
    oiChange: "+4.8%",
    takerFlow: "+118M",
    longShort: "1.07",
    funding: "0.0086",
  },
  {
    symbol: "ETHUSDT",
    bucket: "Positioning",
    reasonTags: ["OI build", "setup +", "basis steady"],
    last: "4,326.8",
    change24h: "+1.76%",
    volume: "2.08B",
    composite: "79.2",
    rankDelta: "+1",
    oiChange: "+5.1%",
    takerFlow: "+74M",
    longShort: "1.03",
    funding: "0.0079",
  },
  {
    symbol: "SOLUSDT",
    bucket: "Squeeze",
    reasonTags: ["short crowding", "taker bid", "delta +"],
    last: "196.44",
    change24h: "+4.31%",
    volume: "918M",
    composite: "78.4",
    rankDelta: "+5",
    oiChange: "+7.0%",
    takerFlow: "+52M",
    longShort: "0.94",
    funding: "-0.0034",
  },
  {
    symbol: "XRPUSDT",
    bucket: "Breakout",
    reasonTags: ["range reclaim", "rank +", "setup +"],
    last: "0.7442",
    change24h: "+3.08%",
    volume: "612M",
    composite: "76.8",
    rankDelta: "+2",
    oiChange: "+3.1%",
    takerFlow: "+26M",
    longShort: "1.01",
    funding: "0.0042",
  },
  {
    symbol: "DOGEUSDT",
    bucket: "Overheat",
    reasonTags: ["crowding", "funding rich", "watch risk"],
    last: "0.2128",
    change24h: "+6.12%",
    volume: "488M",
    composite: "73.9",
    rankDelta: "-1",
    oiChange: "+8.9%",
    takerFlow: "+18M",
    longShort: "1.18",
    funding: "0.0198",
  },
  {
    symbol: "BNBUSDT",
    bucket: "Positioning",
    reasonTags: ["build-up", "stable flow", "quality high"],
    last: "716.10",
    change24h: "+1.14%",
    volume: "402M",
    composite: "72.4",
    rankDelta: "+1",
    oiChange: "+2.4%",
    takerFlow: "+14M",
    longShort: "1.00",
    funding: "0.0061",
  },
  {
    symbol: "LINKUSDT",
    bucket: "Squeeze",
    reasonTags: ["short bias", "OI +", "setup improve"],
    last: "22.86",
    change24h: "+2.06%",
    volume: "286M",
    composite: "71.7",
    rankDelta: "+4",
    oiChange: "+4.5%",
    takerFlow: "+11M",
    longShort: "0.92",
    funding: "-0.0018",
  },
  {
    symbol: "AVAXUSDT",
    bucket: "Breakout",
    reasonTags: ["volume base", "trend +", "rank stable"],
    last: "58.90",
    change24h: "+2.21%",
    volume: "252M",
    composite: "70.9",
    rankDelta: "0",
    oiChange: "+3.7%",
    takerFlow: "+9M",
    longShort: "1.04",
    funding: "0.0055",
  },
];

function buildReadyFixture(timeframe: RebuildTimeframe): DashboardFixture {
  const timeframeMeta = {
    "1h": { runId: 101, updatedLabel: "2026-03-21 09:00 UTC", dataAgeLabel: "11m ago" },
    "4h": { runId: 88, updatedLabel: "2026-03-21 08:00 UTC", dataAgeLabel: "1h ago" },
    "24h": { runId: 42, updatedLabel: "2026-03-21 00:10 UTC", dataAgeLabel: "9h ago" },
  }[timeframe];

  return {
    state: "ready",
    surfaceLabel: "Scanner workspace",
    timeframe,
    runId: timeframeMeta.runId,
    updatedLabel: timeframeMeta.updatedLabel,
    dataAgeLabel: timeframeMeta.dataAgeLabel,
    rowCount: 18,
    runStatus: "completed",
    activePreset: timeframe === "24h" ? "positioning_build" : "breakout_watch",
    topCandidates: BASE_ROWS.slice(0, 5).map((row) => ({
      symbol: row.symbol,
      bucket: row.bucket,
      composite: row.composite,
      reasonTags: row.reasonTags,
    })),
    bucketSummary: [
      { label: "Breakout", count: 5, share: "28%" },
      { label: "Positioning", count: 4, share: "22%" },
      { label: "Squeeze", count: 5, share: "28%" },
      { label: "Overheat", count: 4, share: "22%" },
    ],
    rows: BASE_ROWS,
    sponsors: {
      top: REBUILD_SPONSORS.dashboardTop,
      mid: REBUILD_SPONSORS.dashboardMid,
    },
  };
}

function buildLoadingFixture(timeframe: RebuildTimeframe): DashboardFixture {
  return {
    ...buildReadyFixture(timeframe),
    state: "loading",
    runStatus: "loading",
    dataAgeLabel: "refreshing",
    updatedLabel: "Checking latest persisted run",
  };
}

function buildUnavailableFixture(timeframe: RebuildTimeframe): DashboardFixture {
  return {
    ...buildReadyFixture(timeframe),
    state: "unavailable",
    runStatus: "unavailable",
    unavailableTitle: `No completed ${timeframe} run available`,
    unavailableBody: "현재 persisted run을 읽지 못했습니다. 백엔드 연결 또는 완료된 research run 상태를 먼저 확인해 주세요.",
  };
}

export function getDashboardFixture(timeframe: RebuildTimeframe, state: RebuildPreviewState): DashboardFixture {
  if (state === "loading") return buildLoadingFixture(timeframe);
  if (state === "unavailable") return buildUnavailableFixture(timeframe);
  return buildReadyFixture(timeframe);
}

export function getActivePresetSummary(presetId: RebuildPresetId) {
  return REBUILD_PRESETS[presetId];
}
