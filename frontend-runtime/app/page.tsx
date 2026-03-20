import Link from "next/link";

import { AdPlacement } from "@/components/ads/ad-placement";
import { AppHeader, summarizeHeat } from "@/components/layout/app-header";
import { TrustNote } from "@/components/trust/trust-note";
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
  let run;

  try {
    run = await fetchLatestResearchRun(params.timeframe);
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

  const summary = summarizeHeat(run.rows);
  const topCandidates = run.rows.slice(0, 5);

  return (
    <main>
      <AppHeader
        timeframe={params.timeframe}
        resultCount={run.rows.length}
        averageHeat={summary.avg}
        maxHeat={summary.max}
        runId={run.id}
        latestRunAt={run.started_at}
        dataAgeLabel={formatDataAge(run.started_at)}
      />
      <section className="mx-auto max-w-[1700px] px-4 pt-4">
        <TrustNote
          body="Rankings, community notes, and sponsored placements should be treated as inputs for your own review, not as trade instructions."
        />
      </section>
      <section className="mx-auto max-w-[1700px] px-4 pt-4">
        <AdPlacement placement="dashboard_top" className="mb-4" />
        <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-950">
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Top candidates</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {topCandidates.map((candidate, index) => (
                <Link
                  key={`${candidate.symbol}-${index}`}
                  href={`/coin/${candidate.symbol}?timeframe=${params.timeframe}&run_id=${run.id}`}
                  className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 transition hover:border-emerald-400/40 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">#{index + 1}</p>
                      <p className="mt-1 text-lg font-semibold text-zinc-100">{candidate.symbol}</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-emerald-300">
                      {candidate.composite_score.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">{candidate.signal_bucket}</p>
                  <p className="mt-2 text-sm text-zinc-300">
                    {candidate.reason_tags.slice(0, 3).join(", ") || "No reason tags"}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      <DashboardShell timeframe={params.timeframe} runId={run.id} results={run.rows} />
    </main>
  );
}
