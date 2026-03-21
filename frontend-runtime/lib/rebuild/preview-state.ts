export type RebuildTimeframe = "1h" | "4h" | "24h";
export type RebuildPreviewState = "ready" | "loading" | "unavailable";
export type RebuildAdsMode = "on" | "off";

type SearchValue = string | string[] | undefined;

export type RebuildPreviewParams = {
  timeframe: RebuildTimeframe;
  state: RebuildPreviewState;
  ads: RebuildAdsMode;
  guest: boolean;
  runId: number;
};

function pickFirst(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTimeframe(value: SearchValue): RebuildTimeframe {
  const next = pickFirst(value);
  if (next === "4h" || next === "24h") return next;
  return "1h";
}

function parseState(value: SearchValue): RebuildPreviewState {
  const next = pickFirst(value);
  if (next === "loading" || next === "unavailable") return next;
  return "ready";
}

function parseAds(value: SearchValue): RebuildAdsMode {
  return pickFirst(value) === "off" ? "off" : "on";
}

function parseGuest(value: SearchValue) {
  return pickFirst(value) !== "0";
}

function parseRunId(value: SearchValue) {
  const raw = pickFirst(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 101;
  const integer = Math.trunc(parsed);
  return integer > 0 ? integer : 101;
}

export function parsePreviewParams(searchParams: Record<string, SearchValue>): RebuildPreviewParams {
  return {
    timeframe: parseTimeframe(searchParams.timeframe),
    state: parseState(searchParams.state),
    ads: parseAds(searchParams.ads),
    guest: parseGuest(searchParams.guest),
    runId: parseRunId(searchParams.run_id),
  };
}

export function buildPreviewQuery(params: {
  timeframe: RebuildTimeframe;
  runId?: number;
  state?: RebuildPreviewState;
  ads: RebuildAdsMode;
  guest: boolean;
}) {
  const search = new URLSearchParams({
    timeframe: params.timeframe,
    state: params.state ?? "ready",
    ads: params.ads,
    guest: params.guest ? "1" : "0",
  });

  if (typeof params.runId === "number") {
    search.set("run_id", String(params.runId));
  }

  return search.toString();
}
