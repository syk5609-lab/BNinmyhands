import { RebuildPreviewState, RebuildTimeframe } from "@/lib/rebuild/preview-state";

import { REBUILD_SPONSORS } from "@/fixtures/rebuild/runtime.fixture";

export type DetailFixture = {
  state: RebuildPreviewState;
  symbol: string;
  surfaceLabel: string;
  timeframe: RebuildTimeframe;
  runId: number;
  updatedLabel: string;
  dataAgeLabel: string;
  runStatus: string;
  bucket: string;
  heroSummary: string;
  heroStats: Array<{ label: string; value: string; tone?: "positive" | "negative" | "neutral" }>;
  scores: Array<{ label: string; value: string }>;
  latestMetrics: Array<{ label: string; value: string }>;
  whyTags: string[];
  whyBody: string;
  funding: {
    latest: string;
    absolute: string;
    bias: string;
    interpretation: string;
  };
  history: Array<{
    ts: string;
    last: string;
    composite: string;
    momentum: string;
    setup: string;
    positioning: string;
    oiChange: string;
    takerFlow: string;
    longShort: string;
  }>;
  discussion: {
    title: string;
    posts: Array<{
      author: string;
      role: string;
      body: string;
      meta: string;
    }>;
  };
  unavailableTitle?: string;
  unavailableBody?: string;
  sponsor: typeof REBUILD_SPONSORS.detailBottom;
};

function buildReadyFixture(symbol: string, timeframe: RebuildTimeframe, runId: number): DetailFixture {
  return {
    state: "ready",
    symbol,
    surfaceLabel: "Same-run detail",
    timeframe,
    runId,
    updatedLabel: "2026-03-21 09:00 UTC",
    dataAgeLabel: "11m ago",
    runStatus: "completed",
    bucket: "Breakout",
    heroSummary:
      "같은 persisted run 안에서 composite, setup, positioning이 함께 개선되었고 funding 과열이 상대적으로 덜한 상태라 상단 후보로 유지되고 있습니다.",
    heroStats: [
      { label: "Last price", value: "84,420.5", tone: "neutral" },
      { label: "24h change", value: "+2.84%", tone: "positive" },
      { label: "24h volume", value: "3.42B", tone: "neutral" },
    ],
    scores: [
      { label: "Composite", value: "82.6" },
      { label: "Momentum", value: "78.1" },
      { label: "Setup", value: "81.4" },
      { label: "Positioning", value: "75.8" },
      { label: "Data quality", value: "92.0" },
    ],
    latestMetrics: [
      { label: "Previous rank", value: "4" },
      { label: "Rank delta", value: "+3" },
      { label: "Composite delta", value: "+5.6" },
      { label: "Setup delta", value: "+3.1" },
      { label: "Positioning delta", value: "+2.2" },
      { label: "OI change", value: "+4.8%" },
      { label: "Taker flow", value: "+118M" },
      { label: "L/S ratio", value: "1.07" },
    ],
    whyTags: ["volume reclaim", "momentum +", "rank +", "funding calm"],
    whyBody:
      "이 심볼은 같은 run 안에서 가격 재확인과 거래량 확장이 동시에 나타났고, 순위와 composite score가 함께 개선되었습니다. funding이 과도하게 치우치지 않아 해석 문맥도 비교적 깔끔합니다.",
    funding: {
      latest: "0.0086",
      absolute: "0.0086",
      bias: "neutral to mildly positive",
      interpretation: "롱 crowding이 과도하다고 보기에는 아직 이르며, continuation 해석은 momentum 품질과 함께 봐야 합니다.",
    },
    history: [
      {
        ts: "08:55 UTC",
        last: "84,420.5",
        composite: "82.6",
        momentum: "78.1",
        setup: "81.4",
        positioning: "75.8",
        oiChange: "+4.8%",
        takerFlow: "+118M",
        longShort: "1.07",
      },
      {
        ts: "08:40 UTC",
        last: "84,180.2",
        composite: "79.8",
        momentum: "75.9",
        setup: "79.0",
        positioning: "74.6",
        oiChange: "+3.1%",
        takerFlow: "+92M",
        longShort: "1.05",
      },
      {
        ts: "08:25 UTC",
        last: "83,960.0",
        composite: "77.4",
        momentum: "72.6",
        setup: "76.8",
        positioning: "73.5",
        oiChange: "+2.6%",
        takerFlow: "+61M",
        longShort: "1.04",
      },
    ],
    discussion: {
      title: "Same-run interpretation notes",
      posts: [
        {
          author: "deltaframe",
          role: "member",
          body: "Funding이 얌전한 상태에서 순위가 같이 올라와서 chase보다 continuation 확인 대상으로 보는 쪽이 낫습니다.",
          meta: `run ${runId} · ${timeframe} · 7m ago`,
        },
        {
          author: "oiwatch",
          role: "moderator",
          body: "OI build가 price reclaim보다 느리게 따라오고 있어서 급격한 과열로 보이지는 않습니다.",
          meta: `run ${runId} · ${timeframe} · 4m ago`,
        },
      ],
    },
    sponsor: REBUILD_SPONSORS.detailBottom,
  };
}

function buildUnavailableFixture(symbol: string, timeframe: RebuildTimeframe, runId: number): DetailFixture {
  return {
    ...buildReadyFixture(symbol, timeframe, runId),
    state: "unavailable",
    runStatus: "unavailable",
    unavailableTitle: "Detail context unavailable",
    unavailableBody:
      "잘못된 run_id, timeframe mismatch, symbol not found, 또는 detail 데이터 부재로 인해 same-run detail을 구성하지 못했습니다. 대시보드에서 다시 진입해 주세요.",
  };
}

export function getDetailFixture(args: {
  symbol: string;
  timeframe: RebuildTimeframe;
  runId: number;
  state: RebuildPreviewState;
}): DetailFixture {
  const normalized = args.symbol.toUpperCase();
  if (args.state === "unavailable" || normalized === "INVALID") {
    return buildUnavailableFixture(normalized, args.timeframe, args.runId);
  }
  return buildReadyFixture(normalized, args.timeframe, args.runId);
}
