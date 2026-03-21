export type V2Timeframe = "1h" | "4h" | "24h";
export type V2Preset = "breakout" | "positioning" | "squeeze" | "overheat";
export type V2Direction = "pump" | "dump";
export type V2Bucket = "breakout_watch" | "positioning_build" | "squeeze_watch" | "overheat_risk";
export type V2DashboardState = "ready" | "loading" | "empty" | "unavailable";
export type V2DetailState = "ready" | "loading" | "unavailable";

export interface V2RunContext {
  timeframe: V2Timeframe;
  updatedLabel: string;
  dataAgeLabel: string;
  runId: string;
  runStatus: "complete" | "partial";
  ingestionHealth: "ok" | "delayed" | "error";
  symbolCount: number;
}

export interface V2SponsoredSlotData {
  slot: "dashboard_top" | "dashboard_mid" | "detail_bottom";
  enabled: boolean;
  advertiser: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}

export interface V2PresetCard {
  key: V2Preset;
  label: string;
  description: string;
  bucket: V2Bucket;
  sortLabel: string;
}

export interface V2RankingRow {
  symbol: string;
  bucket: V2Bucket;
  reasonTags: string[];
  lastPrice: string;
  change24h: number;
  volumeLabel: string;
  compositeDelta: number;
  rankDelta: number;
  oiPercent: number;
  takerFlow: number;
  lsRatio: number;
  composite: number;
  momentum: number;
  setup: number;
  positioning: number;
  riskPenalty: number;
  funding: number;
  isPump: boolean;
}

export interface V2DashboardPreviewModel {
  state: V2DashboardState;
  guest: boolean;
  adsOn: boolean;
  trustCopy: string;
  guestCopy: string;
  searchValue: string;
  runContext: V2RunContext;
  presets: V2PresetCard[];
  activePreset: V2Preset;
  activeDirection: V2Direction;
  topSlot: V2SponsoredSlotData;
  midSlot: V2SponsoredSlotData;
  rankings: V2RankingRow[];
  unavailableTitle: string;
  unavailableBody: string;
}

export interface V2DetailScore {
  label: string;
  value: string;
  tone: "cyan" | "positive" | "neutral" | "warning" | "negative";
}

export interface V2DetailMetric {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "muted";
}

export interface V2DetailFunding {
  latest: string;
  absolute: string;
  bias: "positive" | "negative" | "neutral";
  interpretation: string;
}

export interface V2DetailHistoryRow {
  timestamp: string;
  lastPrice: string;
  composite: number;
  setup: number;
  positioning: number;
  oiPercent: number;
  takerFlow: number;
  lsRatio: number;
  riskPenalty: number;
  funding: number;
}

export interface V2DiscussionItem {
  id: string;
  author: string;
  ageLabel: string;
  body: string;
}

export interface V2DetailPreviewModel {
  state: V2DetailState;
  adsOn: boolean;
  runContext: V2RunContext;
  symbol: string;
  bucket: V2Bucket;
  trustCopy: string;
  whyThisCoin: string;
  reasonTags: string[];
  heroStats: Array<{ label: string; value: string; tone?: "default" | "positive" | "negative" }>;
  scores: V2DetailScore[];
  latestMetrics: V2DetailMetric[];
  funding: V2DetailFunding;
  history: V2DetailHistoryRow[];
  discussion: V2DiscussionItem[];
  sponsorBottom: V2SponsoredSlotData;
  unavailableTitle: string;
  unavailableBody: string;
}
