import { RebuildTimeframe } from "@/lib/rebuild/preview-state";

export type RebuildPresetId =
  | "breakout_watch"
  | "positioning_build"
  | "squeeze_watch"
  | "overheat_risk";

export type RebuildSponsorPlacement = "top" | "mid" | "bottom";

export type RebuildSponsor = {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  placement: RebuildSponsorPlacement;
};

export const REBUILD_PRESETS: Record<
  RebuildPresetId,
  {
    label: string;
    short: string;
    summary: string;
  }
> = {
  breakout_watch: {
    label: "Breakout",
    short: "Range reclaim and expansion candidates.",
    summary: "가격 재확인, 거래량 확장, 합성 점수 개선이 같이 나타난 심볼을 우선적으로 좁힌다.",
  },
  positioning_build: {
    label: "Positioning Build",
    short: "Positioning shift with improving structure.",
    summary: "포지셔닝이 쌓이면서 구조가 개선되는 심볼을 본다. 무리한 추격보다 build-up 문맥을 읽는 데 집중한다.",
  },
  squeeze_watch: {
    label: "Squeeze Watch",
    short: "Crowded setup with squeeze potential.",
    summary: "숏 또는 롱이 몰린 상태에서 되감기 가능성이 커지는 심볼을 본다. funding과 흐름 해석이 중요하다.",
  },
  overheat_risk: {
    label: "Overheat Risk",
    short: "Crowding and exhaustion to monitor.",
    summary: "과열과 crowding 리스크가 커진 심볼을 모아 본다. 진입 유도보다 위험 신호 해석이 목적이다.",
  },
};

export const REBUILD_GUEST_STRIP =
  "게스트 읽기 모드입니다. 랭킹과 해석은 볼 수 있지만, 저장된 런 문맥 안에서 의견을 남기려면 로그인해야 합니다.";

export const REBUILD_MEMBER_STRIP =
  "로그인 상태에서는 같은 run 문맥에서 해석 메모를 남기고 discussion에 참여할 수 있습니다.";

export const REBUILD_DISCUSSION_GUEST =
  "읽기 전용 상태입니다. 로그인 후 이 심볼에 대한 same-run 해석 메모를 남길 수 있습니다.";

export const REBUILD_FOOTER_COPY = {
  disclaimer: "Research / educational use only. Not financial advice.",
  detail: "Persisted runs, community notes, and sponsored placements may be delayed, incomplete, or stale.",
};

export const REBUILD_SPONSORS = {
  dashboardTop: {
    label: "Sponsored",
    eyebrow: "Scanner partner",
    title: "Calm execution tools for review workflows",
    body: "분석 본문과 분리된 별도 영역이다. 대시보드 스캔 흐름을 방해하지 않는 짧은 스폰서 메시지만 배치한다.",
    href: "https://example.com/sponsor/top",
    cta: "Open sponsor",
    placement: "top",
  } satisfies RebuildSponsor,
  dashboardMid: {
    label: "Sponsored",
    eyebrow: "Research workflow sponsor",
    title: "Run-aware notebook for derivatives desk notes",
    body: "랭킹 표 아래의 보조 슬롯이다. ads off여도 표와 disclaimer 사이의 리듬은 유지한다.",
    href: "https://example.com/sponsor/mid",
    cta: "View sponsor",
    placement: "mid",
  } satisfies RebuildSponsor,
  detailBottom: {
    label: "Sponsored",
    eyebrow: "Sponsored placement",
    title: "Structured review journal for post-run analysis",
    body: "디테일 분석 서사와 분리된 하단 슬롯이다. funding, history, discussion보다 먼저 읽히지 않게 설계한다.",
    href: "https://example.com/sponsor/detail",
    cta: "Learn more",
    placement: "bottom",
  } satisfies RebuildSponsor,
};

export const REBUILD_TIMEFRAME_LABEL: Record<RebuildTimeframe, string> = {
  "1h": "1 hour",
  "4h": "4 hour",
  "24h": "24 hour",
};
