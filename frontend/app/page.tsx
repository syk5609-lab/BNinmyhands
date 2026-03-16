import { AppHeader, summarizeHeat } from "@/components/layout/app-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RetryButton } from "@/components/dashboard/retry-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchTodayScan } from "@/lib/api/scanner";
import { ScannerTimeframe } from "@/lib/types/scanner";

type SearchParams = {
  limit?: string;
  volume_percentile?: string;
  timeframe?: string;
};

function parseSearchParams(params: SearchParams) {
  const limit = Number(params.limit ?? 50);
  const volumePercentile = Number(params.volume_percentile ?? 0.7);
  const timeframe = (["1h", "4h", "24h"].includes(params.timeframe ?? "")
    ? params.timeframe
    : "1h") as ScannerTimeframe;

  return {
    limit: Number.isFinite(limit) ? Math.min(200, Math.max(1, limit)) : 50,
    volumePercentile: Number.isFinite(volumePercentile) ? Math.min(1, Math.max(0, volumePercentile)) : 0.7,
    timeframe,
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = parseSearchParams(await searchParams);

  try {
    const data = await fetchTodayScan({
      limit: params.limit,
      volumePercentile: params.volumePercentile,
      timeframe: params.timeframe,
    });

    const summary = summarizeHeat(data.results);

    return (
      <main>
        <AppHeader
          timeframe={params.timeframe}
          resultCount={data.results.length}
          averageHeat={summary.avg}
          maxHeat={summary.max}
        />
        <DashboardShell
          timeframe={params.timeframe}
          limit={params.limit}
          volumePercentile={params.volumePercentile}
          results={data.results}
        />
      </main>
    );
  } catch {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-semibold">Scanner unavailable</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-300">
              Could not load data from FastAPI. Confirm backend is running at
              <code className="ml-1 rounded bg-zinc-800 px-1 py-0.5 text-xs">http://127.0.0.1:8000</code>.
            </p>
            <RetryButton />
          </CardContent>
        </Card>
      </main>
    );
  }
}
