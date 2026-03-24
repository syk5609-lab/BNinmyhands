import { DetailFixture } from "@/fixtures/rebuild/detail.fixture";
import { REBUILD_SPONSORS, RebuildSponsor } from "@/fixtures/rebuild/runtime.fixture";
import { CurrentUser } from "@/lib/types/auth";
import { AdSlotRender } from "@/lib/types/ads";
import { CommunityPost } from "@/lib/types/community";
import { RuntimeFeatureFlags } from "@/lib/types/feature-flags";
import { AssetHistoryResponse, AssetLatestResponse, ResearchRunDetail, SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

type RuntimeDetailStatus = "loading" | "ready" | "unavailable";

type DetailAdapterInput = {
  symbol: string;
  timeframe: DetailFixture["timeframe"];
  runId: number | null;
  status: RuntimeDetailStatus;
  run?: ResearchRunDetail | null;
  latest?: AssetLatestResponse | null;
  history?: AssetHistoryResponse | null;
  posts?: CommunityPost[];
  flags?: RuntimeFeatureFlags | null;
  sponsorSlot?: AdSlotRender | null;
  user?: CurrentUser | null;
  errorKind?: "invalid_context" | "timeframe_mismatch" | "symbol_not_found" | "run_not_found" | "backend";
  communityState?: "ready" | "disabled" | "unavailable";
};

type FundingAwareRow = SymbolScanResult & {
  funding_rate_latest?: number | null;
  funding_rate_abs?: number | null;
  funding_bias?: string | null;
};

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

function formatSigned(value: number | null | undefined, decimals = 2, suffix = "") {
  if (value === null || value === undefined) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}${suffix}`;
}

function formatFunding(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return value.toFixed(8);
}

function mapBucketLabel(bucket: SymbolScanResult["signal_bucket"]) {
  if (bucket === "positioning_build") return "Positioning";
  if (bucket === "squeeze_watch") return "Squeeze";
  if (bucket === "overheat_risk") return "Overheat";
  return "Breakout";
}

function buildReasonSummary(row: SymbolScanResult): string {
  const reasons: string[] = [...row.reason_tags];
  if (row.rank_change !== null && row.rank_change > 0) reasons.push("improving rank");
  if ((row.composite_delta ?? 0) > 0) reasons.push("composite improving");
  if ((row.setup_delta ?? 0) > 0) reasons.push("setup strengthening");
  if ((row.positioning_delta ?? 0) > 0) reasons.push("positioning strengthening");
  if (reasons.length === 0) {
    return "같은 persisted run 안에서 상대 스캔 랭킹과 현재 feature blend를 기준으로 surfaced 되었습니다.";
  }
  return `같은 persisted run 안에서 ${Array.from(new Set(reasons)).slice(0, 6).join(", ")} 문맥이 함께 감지되어 surfaced 되었습니다.`;
}

function getFundingInterpretation(bias: string | null | undefined) {
  if (bias === "positive") return "롱 crowding 해석 여지가 있어 continuation은 follow-through 품질과 함께 봐야 합니다.";
  if (bias === "negative") return "숏 crowding 문맥이라 squeeze 가능성을 열어 두고 momentum 품질을 함께 봐야 합니다.";
  if (bias === "neutral") return "Funding이 크게 기울지 않아 같은 run 안의 구조 해석을 방해하지 않는 상태입니다.";
  return "이 persisted snapshot에는 funding 해석에 필요한 값이 충분하지 않습니다.";
}

function mapSponsor(slot: AdSlotRender | null | undefined): RebuildSponsor | undefined {
  if (!slot) return undefined;
  return {
    label: "Sponsored",
    eyebrow: slot.label || REBUILD_SPONSORS.detailBottom.eyebrow,
    title: slot.creative.title,
    body: slot.creative.body_copy ?? REBUILD_SPONSORS.detailBottom.body,
    href: slot.creative.target_url,
    cta: slot.creative.cta_label ?? REBUILD_SPONSORS.detailBottom.cta,
    placement: "bottom",
  };
}

function getUnavailableCopy(errorKind: DetailAdapterInput["errorKind"]) {
  if (errorKind === "invalid_context") {
    return {
      title: "Invalid run context",
      body: "잘못된 run 문맥입니다. run_id가 없거나 유효하지 않습니다. 대시보드에서 다시 진입해 주세요.",
      funding: "잘못된 run 문맥 때문에 same-run detail을 구성할 수 없습니다.",
    };
  }

  if (errorKind === "timeframe_mismatch") {
    return {
      title: "Context mismatch",
      body: "요청한 timeframe과 run 문맥이 맞지 않습니다. 같은 run의 timeframe으로 다시 진입해 주세요.",
      funding: "timeframe 문맥이 맞지 않아 같은 run detail을 구성할 수 없습니다.",
    };
  }

  if (errorKind === "run_not_found") {
    return {
      title: "Requested run is unavailable",
      body: "요청한 run_id를 찾을 수 없습니다. 이미 사라졌거나 유효하지 않은 run일 수 있습니다.",
      funding: "요청한 run 자체를 찾을 수 없어 same-run detail을 구성할 수 없습니다.",
    };
  }

  if (errorKind === "symbol_not_found") {
    return {
      title: "Requested detail is unavailable",
      body: "요청한 symbol detail을 이 run 문맥에서 찾을 수 없습니다. symbol 또는 run 조합을 다시 확인해 주세요.",
      funding: "요청한 symbol detail을 찾을 수 없어 funding 문맥도 함께 제공할 수 없습니다.",
    };
  }

  return {
    title: "Requested run is unavailable",
    body: "요청한 run 또는 detail 데이터를 불러오지 못했습니다. 잠시 후 다시 시도하거나 대시보드에서 다시 진입해 주세요.",
    funding: "요청한 run 또는 detail 데이터를 불러오지 못해 same-run detail을 구성할 수 없습니다.",
  };
}

function buildUnavailableFixture(
  symbol: string,
  timeframe: DetailFixture["timeframe"],
  runId: number | null,
  errorKind?: DetailAdapterInput["errorKind"],
): DetailFixture {
  const copy = getUnavailableCopy(errorKind);
  return {
    state: "unavailable",
    symbol,
    surfaceLabel: "Same-run detail",
    timeframe,
    runId: runId ?? 0,
    updatedLabel: "Detail context unavailable",
    dataAgeLabel: "not available",
    runStatus: "unavailable",
    bucket: "Unavailable",
    heroSummary: "",
    heroStats: [],
    scores: [],
    latestMetrics: [],
    whyTags: [],
    whyBody: "",
    funding: {
      latest: "-",
      absolute: "-",
      bias: "-",
      interpretation: copy.funding,
    },
    history: [],
    discussion: {
      title: "Same-run interpretation notes",
      actionLabel: "Log in to write",
      actionHref: "/login",
      posts: [],
    },
    unavailableTitle: copy.title,
    unavailableBody: copy.body,
  };
}

export function adaptRuntimeDetail(input: DetailAdapterInput): DetailFixture {
  const normalizedSymbol = input.symbol.toUpperCase();

  if (input.status === "loading") {
    return {
      ...buildUnavailableFixture(normalizedSymbol, input.timeframe, input.runId, "backend"),
      state: "loading",
      runStatus: "loading",
      updatedLabel: "Checking same-run detail",
      dataAgeLabel: "refreshing",
      unavailableTitle: undefined,
      unavailableBody: undefined,
    };
  }

  if (
    input.status === "unavailable" ||
    !input.runId ||
    !input.run ||
    !input.latest ||
    !input.history
  ) {
    return buildUnavailableFixture(normalizedSymbol, input.timeframe, input.runId, input.errorKind);
  }

  const row = input.latest.row as FundingAwareRow;
  const communityEnabled = input.flags?.community_enabled !== false;
  const writeEnabled = communityEnabled && input.flags?.write_actions_enabled !== false;
  const posts =
    input.communityState === "disabled"
      ? [
          {
            author: "system",
            role: "status",
            body: "Community is currently paused for launch hardening. Read-only analysis remains available.",
            meta: `run ${input.runId} · ${input.timeframe}`,
          },
        ]
      : input.communityState === "unavailable"
        ? [
            {
              author: "system",
              role: "status",
              body: "Community is temporarily unavailable. The rest of the coin detail remains available.",
              meta: `run ${input.runId} · ${input.timeframe}`,
            },
          ]
        : (input.posts ?? []).map((post) => ({
            author: post.author.nickname,
            role: post.author.role,
            body: post.body,
            meta: `${post.run_id ? `run ${post.run_id} · ` : ""}${post.timeframe ?? input.timeframe} · ${formatDataAge(post.created_at)}`,
          }));

  return {
    state: "ready",
    symbol: input.latest.symbol,
    surfaceLabel: "Same-run detail",
    timeframe: input.timeframe,
    runId: input.runId,
    updatedLabel: formatUtcLabel(input.latest.ts),
    dataAgeLabel: formatDataAge(input.latest.ts),
    runStatus: input.run.status,
    bucket: mapBucketLabel(row.signal_bucket),
    heroSummary: buildReasonSummary(row),
    heroStats: [
      { label: "Last price", value: formatPrice(row.last_price), tone: "neutral" },
      {
        label: "24h change",
        value: formatPercent(row.price_change_percent_24h),
        tone: row.price_change_percent_24h >= 0 ? "positive" : "negative",
      },
      { label: "24h volume", value: formatCompactNumber(row.quote_volume_24h), tone: "neutral" },
    ],
    scores: [
      { label: "Composite", value: row.composite_score.toFixed(1) },
      { label: "Momentum", value: row.momentum_score.toFixed(1) },
      { label: "Setup", value: row.setup_score.toFixed(1) },
      { label: "Positioning", value: row.positioning_score.toFixed(1) },
      { label: "Data quality", value: row.data_quality_score.toFixed(1) },
    ],
    latestMetrics: [
      { label: "Previous rank", value: row.previous_rank?.toString() ?? "-" },
      { label: "Rank delta", value: formatSigned(row.rank_change, 0) },
      { label: "Composite delta", value: formatSigned(row.composite_delta) },
      { label: "Setup delta", value: formatSigned(row.setup_delta) },
      { label: "Positioning delta", value: formatSigned(row.positioning_delta) },
      { label: "OI change", value: formatSigned(row.oi_change_percent_recent, 2, "%") },
      { label: "Taker flow", value: formatSigned(row.taker_net_flow_recent) },
      { label: "L/S ratio", value: row.long_short_ratio_recent?.toFixed(3) ?? "-" },
    ],
    whyTags: row.reason_tags,
    whyBody:
      "이 심볼은 같은 run 안에서 composite, setup, positioning 변화가 함께 읽히는 상태이며, ranking context와 funding 해석을 같은 화면에서 이어서 보도록 구성했습니다.",
    funding: {
      latest: formatFunding(row.funding_rate_latest),
      absolute: formatFunding(row.funding_rate_abs),
      bias: row.funding_bias ?? "unavailable",
      interpretation: getFundingInterpretation(row.funding_bias),
    },
    history: input.history.points.slice(0, 8).map((point) => ({
      ts: formatUtcLabel(point.ts),
      last: formatPrice(point.last_price),
      composite: point.composite_score.toFixed(1),
      momentum: point.momentum_score.toFixed(1),
      setup: point.setup_score.toFixed(1),
      positioning: point.positioning_score.toFixed(1),
      oiChange: formatSigned(point.oi_change_percent_recent, 2, "%"),
      takerFlow: formatSigned(point.taker_net_flow_recent),
      longShort: point.long_short_ratio_recent?.toFixed(3) ?? "-",
    })),
    discussion: {
      title: "Same-run interpretation notes",
      actionLabel: !communityEnabled
        ? "Community paused"
        : !input.user
          ? "Log in to write"
          : writeEnabled
            ? "Write enabled"
            : "Write paused",
      actionHref: !input.user ? "/login" : undefined,
      statusMessage:
        !communityEnabled
          ? "Community is currently paused for launch hardening. Read-only analysis remains available."
          : !writeEnabled
            ? "Posting, deleting, and reporting are temporarily paused. Existing discussion remains visible in read-only mode."
            : undefined,
      posts,
    },
    sponsor: input.flags?.ads_enabled === false ? undefined : mapSponsor(input.sponsorSlot),
  };
}
