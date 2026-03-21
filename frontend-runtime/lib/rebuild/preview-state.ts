export type RebuildTimeframe = "1h" | "4h" | "24h";
export type RebuildPreviewState = "ready" | "loading" | "unavailable";
export type RebuildAdsMode = "on" | "off";
export type RebuildPreviewMode = "fixture" | "runtime";

type SearchValue = string | string[] | undefined;

export type RebuildPreviewParams = {
  timeframe: RebuildTimeframe;
  state: RebuildPreviewState;
  ads: RebuildAdsMode;
  guest: boolean;
  mode: RebuildPreviewMode;
  runId: number | null;
};

function pickFirst(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function parseTimeframe(value: SearchValue): RebuildTimeframe {
  const next = pickFirst(value);
  if (next === "4h" || next === "24h") return next;
  return "1h";
}

function parseMode(value: SearchValue): RebuildPreviewMode {
  return pickFirst(value) === "runtime" ? "runtime" : "fixture";
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
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  const integer = Math.trunc(parsed);
  return integer > 0 ? integer : null;
}

export function parsePreviewParams(searchParams: Record<string, SearchValue>): RebuildPreviewParams {
  return {
    timeframe: parseTimeframe(searchParams.timeframe),
    state: parseState(searchParams.state),
    ads: parseAds(searchParams.ads),
    guest: parseGuest(searchParams.guest),
    mode: parseMode(searchParams.mode),
    runId: parseRunId(searchParams.run_id),
  };
}

export function buildPreviewQuery(params: {
  timeframe: RebuildTimeframe;
  runId?: number;
  state?: RebuildPreviewState;
  ads: RebuildAdsMode;
  guest: boolean;
  mode?: RebuildPreviewMode;
}) {
  const search = new URLSearchParams({
    timeframe: params.timeframe,
    state: params.state ?? "ready",
    ads: params.ads,
    guest: params.guest ? "1" : "0",
  });

  if (params.mode === "runtime") {
    search.set("mode", "runtime");
  }

  if (typeof params.runId === "number" && params.runId > 0) {
    search.set("run_id", String(params.runId));
  }

  return search.toString();
}
