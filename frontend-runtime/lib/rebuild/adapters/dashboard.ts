import { DashboardFixture, DashboardRowFixture } from "@/fixtures/rebuild/dashboard.fixture";
import { REBUILD_SPONSORS, RebuildPresetId, RebuildSponsor } from "@/fixtures/rebuild/runtime.fixture";
import { RebuildTimeframe } from "@/lib/rebuild/preview-state";
import { AdSlotRender } from "@/lib/types/ads";
import { RuntimeFeatureFlags } from "@/lib/types/feature-flags";
import { ResearchRunDetail, SignalBucket, SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

type RuntimeDashboardStatus = "loading" | "ready" | "unavailable";

type DashboardAdapterInput = {
  timeframe: RebuildTimeframe;
  status: RuntimeDashboardStatus;
  run?: ResearchRunDetail | null;
  flags?: RuntimeFeatureFlags | null;
  topSlot?: AdSlotRender | null;
  midSlot?: AdSlotRender | null;
  errorKind?: "not_found" | "backend";
};

type FundingAwareRow = SymbolScanResult & {
  funding_rate_latest?: number | null;
};

const BUCKET_LABELS: Record<SignalBucket, string> = {
  breakout_watch: "Breakout",
  positioning_build: "Positioning",
  squeeze_watch: "Squeeze",
  overheat_risk: "Overheat",
};

const BUCKET_ORDER: SignalBucket[] = [
  "breakout_watch",
  "positioning_build",
  "squeeze_watch",
  "overheat_risk",
];

function formatUtcLabel(value: string) {
  const ts = new Date(value);
  if (!Number.isFinite(ts.getTime())) return "timestamp unavailable";
  const year = ts.getUTCFullYear();
  const month = String(ts.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ts.getUTCDate()).padStart(2, "0");
  const hour = String(ts.getUTCHours()).padStart(2, "0");
  const minute = String(ts.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute} UTC`;
}

function formatDataAge(value: string) {
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return "age unavailable";
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mapBucketToPreset(bucket: SignalBucket | undefined): RebuildPresetId {
  if (bucket === "positioning_build") return "positioning_build";
  if (bucket === "squeeze_watch") return "squeeze_watch";
  if (bucket === "overheat_risk") return "overheat_risk";
  return "breakout_watch";
}

function formatSigned(value: number | null | undefined, decimals = 2, suffix = "") {
  if (value === null || value === undefined) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}${suffix}`;
}

function formatSignedCompact(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  const abs = formatCompactNumber(Math.abs(value));
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${abs}`;
}

function formatFunding(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return value.toFixed(4);
}

function mapSponsor(slot: AdSlotRender | null | undefined, fallback: RebuildSponsor): RebuildSponsor | undefined {
  if (!slot) return undefined;
  return {
    label: "Sponsored",
    eyebrow: slot.label || fallback.eyebrow,
    title: slot.creative.title,
    body: slot.creative.body_copy ?? fallback.body,
    href: slot.creative.target_url,
    cta: slot.creative.cta_label ?? fallback.cta,
    placement: fallback.placement,
  };
}

function mapRow(row: SymbolScanResult): DashboardRowFixture {
  const fundingRow = row as FundingAwareRow;
  return {
    symbol: row.symbol,
    bucket: BUCKET_LABELS[row.signal_bucket],
    reasonTags: row.reason_tags,
    last: formatPrice(row.last_price),
    change24h: formatPercent(row.price_change_percent_24h),
    volume: formatCompactNumber(row.quote_volume_24h),
    composite: row.composite_score.toFixed(1),
    rankDelta: row.rank_change === null ? "-" : formatSigned(row.rank_change, 0),
    oiChange: formatSigned(row.oi_change_percent_recent, 1, "%"),
    takerFlow: formatSignedCompact(row.taker_net_flow_recent),
    longShort: row.long_short_ratio_recent === null ? "-" : row.long_short_ratio_recent.toFixed(2),
    funding: formatFunding(fundingRow.funding_rate_latest),
  };
}

function buildUnavailableFixture(timeframe: RebuildTimeframe, errorKind: DashboardAdapterInput["errorKind"]): DashboardFixture {
  return {
    state: "unavailable",
    surfaceLabel: "Scanner workspace",
    timeframe,
    runId: 0,
    updatedLabel: "Latest persisted run unavailable",
    dataAgeLabel: "not available",
    rowCount: 0,
    runStatus: "unavailable",
    activePreset: "breakout_watch",
    unavailableTitle:
      errorKind === "not_found" ? `No completed ${timeframe} run available` : "Scanner workspace unavailable",
    unavailableBody:
      "현재 persisted run을 읽지 못했습니다. 백엔드 연결 또는 완료된 research run 상태를 먼저 확인해 주세요.",
    topCandidates: [],
    bucketSummary: [
      { label: "Breakout", count: 0, share: "0%" },
      { label: "Positioning", count: 0, share: "0%" },
      { label: "Squeeze", count: 0, share: "0%" },
      { label: "Overheat", count: 0, share: "0%" },
    ],
    rows: [],
    sponsors: {},
  };
}

export function adaptRuntimeDashboard(input: DashboardAdapterInput): DashboardFixture {
  if (input.status === "loading") {
    return {
      ...buildUnavailableFixture(input.timeframe, "backend"),
      state: "loading",
      runId: input.run?.id ?? 0,
      updatedLabel: "Checking latest persisted run",
      dataAgeLabel: "refreshing",
      runStatus: "loading",
      unavailableTitle: undefined,
      unavailableBody: undefined,
    };
  }

  if (input.status === "unavailable" || !input.run) {
    return buildUnavailableFixture(input.timeframe, input.errorKind);
  }

  const rows = input.run.rows.map(mapRow);
  const activePreset = mapBucketToPreset(input.run.rows[0]?.signal_bucket);
  const totalRows = input.run.rows.length;
  const counts = new Map<SignalBucket, number>();
  BUCKET_ORDER.forEach((bucket) => counts.set(bucket, 0));
  input.run.rows.forEach((row) => counts.set(row.signal_bucket, (counts.get(row.signal_bucket) ?? 0) + 1));

  const adsEnabled = input.flags?.ads_enabled !== false;

  return {
    state: "ready",
    surfaceLabel: "Scanner workspace",
    timeframe: input.timeframe,
    runId: input.run.id,
    updatedLabel: formatUtcLabel(input.run.started_at),
    dataAgeLabel: formatDataAge(input.run.started_at),
    rowCount: totalRows,
    runStatus: input.run.status,
    activePreset,
    topCandidates: rows.slice(0, 5).map((row) => ({
      symbol: row.symbol,
      bucket: row.bucket,
      composite: row.composite,
      reasonTags: row.reasonTags,
    })),
    bucketSummary: BUCKET_ORDER.map((bucket) => {
      const count = counts.get(bucket) ?? 0;
      const share = totalRows > 0 ? `${Math.round((count / totalRows) * 100)}%` : "0%";
      return {
        label: BUCKET_LABELS[bucket],
        count,
        share,
      };
    }),
    rows,
    sponsors: {
      top: adsEnabled ? mapSponsor(input.topSlot, REBUILD_SPONSORS.dashboardTop) : undefined,
      mid: adsEnabled ? mapSponsor(input.midSlot, REBUILD_SPONSORS.dashboardMid) : undefined,
    },
  };
}
