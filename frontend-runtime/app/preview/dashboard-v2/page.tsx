import { DashboardV2 } from "@/components/v2/dashboard/dashboard-v2";
import { buildDashboardPreviewModel } from "@/fixtures/v2/dashboard.fixture";
import { V2Direction, V2Preset, V2Timeframe } from "@/components/v2/types";

function parseTimeframe(input?: string): V2Timeframe {
  return input === "1h" || input === "24h" ? input : "4h";
}

function parsePreset(input?: string): V2Preset {
  return input === "positioning" || input === "squeeze" || input === "overheat" ? input : "breakout";
}

function parseMode(input?: string): V2Direction {
  return input === "dump" ? "dump" : "pump";
}

function parseState(input?: string) {
  return input === "loading" || input === "empty" || input === "unavailable" ? input : "ready";
}

export default async function DashboardV2PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    ads?: string;
    guest?: string;
    timeframe?: string;
    preset?: string;
    mode?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;
  const query = {
    state: parseState(params.state),
    ads: params.ads === "off" ? "off" : "on",
    guest: params.guest === "0" ? "0" : "1",
    timeframe: parseTimeframe(params.timeframe),
    preset: parsePreset(params.preset),
    mode: parseMode(params.mode),
    search: params.search ?? "",
  } as const;

  const model = buildDashboardPreviewModel({
    state: query.state,
    adsOn: query.ads === "on",
    guest: query.guest === "1",
    timeframe: query.timeframe,
    preset: query.preset,
    direction: query.mode,
    search: query.search,
  });

  return <DashboardV2 model={model} query={query} />;
}
