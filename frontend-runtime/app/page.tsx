import "@/components/rebuild/foundation/rebuild-tokens.css";

import { RuntimeDashboardPreview } from "@/components/rebuild/dashboard/runtime-dashboard-preview";
import { ScannerTimeframe } from "@/lib/types/scanner";

type SearchParams = {
  timeframe?: string;
  run_id?: string;
};

function parseSearchParams(params: SearchParams) {
  const timeframe = (["1h", "4h", "24h"].includes(params.timeframe ?? "")
    ? params.timeframe
    : "1h") as ScannerTimeframe;

  const parsedRunId = Number(params.run_id);
  const runId = Number.isFinite(parsedRunId) && parsedRunId > 0 && Math.trunc(parsedRunId) === parsedRunId ? parsedRunId : null;

  return { timeframe, runId };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = parseSearchParams(await searchParams);
  return <RuntimeDashboardPreview routeKind="live" runId={params.runId} timeframe={params.timeframe} />;
}
