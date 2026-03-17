import { AppHeader, summarizeHeat } from "@/components/layout/app-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RetryButton } from "@/components/dashboard/retry-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScannerApiError, fetchLatestResearchRun } from "@/lib/api/scanner";
import { ScannerTimeframe } from "@/lib/types/scanner";

type SearchParams = {
  timeframe?: string;
};

function parseSearchParams(params: SearchParams) {
  const timeframe = (["1h", "4h", "24h"].includes(params.timeframe ?? "")
    ? params.timeframe
    : "1h") as ScannerTimeframe;

  return { timeframe };
}

function formatDataAge(isoTs: string): string {
  const ts = new Date(isoTs).getTime();
  if (!Number.isFinite(ts)) return "age unavailable";
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NoRunState({ timeframe }: { timeframe: ScannerTimeframe }) {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">No completed run for {timeframe}</h1>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          <p>
            Launch dashboard uses persisted completed runs. There is no saved run yet for this timeframe.
          </p>
          <p>Try another timeframe or run a research snapshot job first.</p>
          <RetryButton />
        </CardContent>
      </Card>
    </main>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = parseSearchParams(await searchParams);

  try {
    const run = await fetchLatestResearchRun(params.timeframe);
    const summary = summarizeHeat(run.rows);

    return (
      <main>
        <AppHeader
          timeframe={params.timeframe}
          resultCount={run.rows.length}
          averageHeat={summary.avg}
          maxHeat={summary.max}
          latestRunAt={run.started_at}
          dataAgeLabel={formatDataAge(run.started_at)}
        />
        <DashboardShell timeframe={params.timeframe} results={run.rows} />
      </main>
    );
  } catch (error) {
    if (error instanceof ScannerApiError && error.status === 404) {
      return <NoRunState timeframe={params.timeframe} />;
    }

    return (
      <main className="mx-auto max-w-3xl p-8">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-semibold">Scanner unavailable</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-300">
              Could not load persisted run data from FastAPI. Confirm backend is running at
              <code className="ml-1 rounded bg-zinc-800 px-1 py-0.5 text-xs">http://127.0.0.1:8000</code>.
            </p>
            <RetryButton />
          </CardContent>
        </Card>
      </main>
    );
  }
}
