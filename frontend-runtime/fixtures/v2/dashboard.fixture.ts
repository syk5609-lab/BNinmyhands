import {
  V2DashboardPreviewModel,
  V2PresetCard,
  V2Preset,
  V2Timeframe,
  V2Direction,
  V2RankingRow,
  V2DashboardState,
} from "@/components/v2/types";
import { getRunContextFixture } from "@/fixtures/v2/run-context.fixture";

const PRESETS: V2PresetCard[] = [
  {
    key: "breakout",
    label: "Breakout View",
    description:
      "Sorted by composite score. Highlights coins with strong momentum, rising volume, and technical breakout setups.",
    bucket: "breakout_watch",
    sortLabel: "composite",
  },
  {
    key: "positioning",
    label: "Positioning Build View",
    description:
      "Sorted by positioning score. Highlights coins where smart money is building positions with OI, taker flow, and L/S shifts.",
    bucket: "positioning_build",
    sortLabel: "positioning",
  },
  {
    key: "squeeze",
    label: "Squeeze Watch View",
    description:
      "Sorted by setup score. Identifies squeeze candidates with crowded positioning, extreme funding, and low-liquidity pockets.",
    bucket: "squeeze_watch",
    sortLabel: "setup",
  },
  {
    key: "overheat",
    label: "Overheat Risk View",
    description:
      "Sorted by risk penalty. Flags overheated coins with extreme funding, rapid OI growth, and extended price moves.",
    bucket: "overheat_risk",
    sortLabel: "risk",
  },
];

const DASHBOARD_ROWS: V2RankingRow[] = [
  {
    symbol: "COSUSDT",
    bucket: "breakout_watch",
    reasonTags: ["range_break", "momentum_flip", "oi_ramp"],
    lastPrice: "0.001607",
    change24h: 0.19,
    volumeLabel: "73.88M",
    compositeDelta: 1.0,
    rankDelta: 2,
    oiPercent: 2.63,
    takerFlow: 49.98,
    lsRatio: 1.13,
    composite: 63.7,
    momentum: 78.5,
    setup: 28.5,
    positioning: 14.4,
    riskPenalty: 4.8,
    funding: 6.045,
    isPump: true,
  },
  {
    symbol: "DOGEUSDT",
    bucket: "breakout_watch",
    reasonTags: ["vol_surge", "taker_bid", "range_break"],
    lastPrice: "0.09411",
    change24h: -1.37,
    volumeLabel: "471.42M",
    compositeDelta: 0.01,
    rankDelta: 4,
    oiPercent: 0.82,
    takerFlow: 17.16,
    lsRatio: 2.29,
    composite: 1.3,
    momentum: 0.46,
    setup: 1.73,
    positioning: 1.67,
    riskPenalty: 0.0,
    funding: 0.46,
    isPump: false,
  },
  {
    symbol: "RESOLVUSDT",
    bucket: "breakout_watch",
    reasonTags: ["momentum_flip", "oi_ramp"],
    lastPrice: "0.06149",
    change24h: 1.22,
    volumeLabel: "16.5M",
    compositeDelta: -0.1,
    rankDelta: 4,
    oiPercent: 0.16,
    takerFlow: 50.90,
    lsRatio: 0.53,
    composite: 1.5,
    momentum: 2.28,
    setup: 1.39,
    positioning: 1.57,
    riskPenalty: -0.26,
    funding: 2.28,
    isPump: true,
  },
  {
    symbol: "QNTUSDT",
    bucket: "breakout_watch",
    reasonTags: ["high_composite", "momentum_strong"],
    lastPrice: "76.8500",
    change24h: 0.35,
    volumeLabel: "15.71M",
    compositeDelta: 0.29,
    rankDelta: 11,
    oiPercent: 0.33,
    takerFlow: 0.91,
    lsRatio: 1.01,
    composite: 1.2,
    momentum: 1.81,
    setup: 1.34,
    positioning: 1.46,
    riskPenalty: -0.29,
    funding: 1.81,
    isPump: true,
  },
  {
    symbol: "FETUSDT",
    bucket: "positioning_build",
    reasonTags: ["oi_build", "whale_flow"],
    lastPrice: "2.1800",
    change24h: 3.5,
    volumeLabel: "734M",
    compositeDelta: -1.7,
    rankDelta: 5,
    oiPercent: 21.1,
    takerFlow: -0.4,
    lsRatio: 0.56,
    composite: 63.7,
    momentum: 78.5,
    setup: 28.5,
    positioning: 14.4,
    riskPenalty: 4.8,
    funding: 6.045,
    isPump: true,
  },
  {
    symbol: "XRPUSDT",
    bucket: "squeeze_watch",
    reasonTags: ["crowded_short", "funding_extreme"],
    lastPrice: "2.3400",
    change24h: -1.31,
    volumeLabel: "903.17M",
    compositeDelta: 0.12,
    rankDelta: -1,
    oiPercent: 9.8,
    takerFlow: -11.2,
    lsRatio: 0.88,
    composite: 0.4,
    momentum: 0.75,
    setup: 2.4,
    positioning: 1.9,
    riskPenalty: 14.2,
    funding: -7.2,
    isPump: false,
  },
  {
    symbol: "TRXUSDT",
    bucket: "overheat_risk",
    reasonTags: ["funding_hot", "price_extended"],
    lastPrice: "0.1425",
    change24h: -0.19,
    volumeLabel: "56.62M",
    compositeDelta: -0.22,
    rankDelta: -2,
    oiPercent: 11.7,
    takerFlow: -8.5,
    lsRatio: 1.74,
    composite: 0.4,
    momentum: 1.07,
    setup: 0.8,
    positioning: 0.9,
    riskPenalty: 31.0,
    funding: 9.4,
    isPump: false,
  },
  {
    symbol: "1000PEPEUSDT",
    bucket: "overheat_risk",
    reasonTags: ["oi_overextend", "divergence"],
    lastPrice: "0.0132",
    change24h: -2.85,
    volumeLabel: "321.17M",
    compositeDelta: -1.4,
    rankDelta: -6,
    oiPercent: 18.6,
    takerFlow: -16.3,
    lsRatio: 1.91,
    composite: 0.2,
    momentum: -1.2,
    setup: 0.7,
    positioning: 0.4,
    riskPenalty: 35.4,
    funding: 10.2,
    isPump: false,
  },
];

function presetBucket(preset: V2Preset) {
  return PRESETS.find((item) => item.key === preset)?.bucket ?? "breakout_watch";
}

function sortRows(rows: V2RankingRow[], preset: V2Preset) {
  const sortField =
    preset === "positioning"
      ? "positioning"
      : preset === "squeeze"
        ? "setup"
        : preset === "overheat"
          ? "riskPenalty"
          : "composite";

  return [...rows].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    return typeof av === "number" && typeof bv === "number" ? bv - av : 0;
  });
}

export function buildDashboardPreviewModel({
  state = "ready",
  adsOn = true,
  guest = true,
  timeframe = "4h",
  preset = "breakout",
  direction = "pump",
  search = "",
}: {
  state?: V2DashboardState;
  adsOn?: boolean;
  guest?: boolean;
  timeframe?: V2Timeframe;
  preset?: V2Preset;
  direction?: V2Direction;
  search?: string;
}): V2DashboardPreviewModel {
  const activeBucket = presetBucket(preset);
  const slice = sortRows(
    DASHBOARD_ROWS.filter((row) => row.bucket === activeBucket && row.isPump === (direction === "pump")).filter((row) =>
      search ? row.symbol.toLowerCase().includes(search.toLowerCase()) : true,
    ),
    preset,
  );

  return {
    state,
    guest,
    adsOn,
    trustCopy:
      "Research / educational use only — not financial advice. Scanner results are derived from persisted run snapshots, not live data.",
    guestCopy: "Browsing as guest. Sign in to access community discussion and save preferences.",
    searchValue: search,
    runContext: getRunContextFixture(timeframe),
    presets: PRESETS,
    activePreset: preset,
    activeDirection: direction,
    topSlot: {
      slot: "dashboard_top",
      enabled: adsOn,
      advertiser: "DataVault Pro",
      title: "Institutional-Grade Data API",
      description: "Access real-time derivatives data for 500+ pairs with 99.9% uptime SLA.",
      ctaLabel: "Learn More",
      href: "#",
    },
    midSlot: {
      slot: "dashboard_mid",
      enabled: adsOn,
      advertiser: "RiskShield",
      title: "Risk Management Platform",
      description: "Automated position sizing, liquidation alerts, and portfolio heat maps for derivatives traders.",
      ctaLabel: "Try Free",
      href: "#",
    },
    rankings: state === "ready" ? slice : [],
    unavailableTitle: "Dashboard unavailable",
    unavailableBody:
      "Previewing the unavailable state for the scanner workspace. Live runtime routes stay untouched until the V2 shell is approved.",
  };
}
