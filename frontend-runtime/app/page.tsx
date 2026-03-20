import { AppHeader, summarizeHeat } from "@/components/layout/app-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RetryButton } from "@/components/dashboard/retry-button";
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

function DashboardState({
  timeframe,
  title,
  body,
}: {
  timeframe: ScannerTimeframe;
  title: string;
  body: string;
}) {
  return (
    <>
      <AppHeader timeframe={timeframe} />
      <main className="mx-auto max-w-[1600px] px-4 py-10 sm:px-5">
        <section className="mx-auto max-w-3xl rounded-lg border border-[color:var(--bn-border)] bg-[#0a0f16] p-6 text-center">
          <p className="bn-kicker">Dashboard state</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--bn-text-strong)]">{title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color:var(--bn-text-muted)]">{body}</p>
          <div className="mt-6 inline-flex">
            <RetryButton />
          </div>
        </section>
      </main>
    </>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = parseSearchParams(await searchParams);
  let run;

  try {
    run = await fetchLatestResearchRun(params.timeframe);
  } catch (error) {
    if (error instanceof ScannerApiError && error.status === 404) {
      return (
        <DashboardState
          timeframe={params.timeframe}
          title={`No completed ${params.timeframe} run yet`}
          body="Launch dashboard only renders persisted completed runs. Try another timeframe or trigger a research snapshot first."
        />
      );
    }

    return (
      <DashboardState
        timeframe={params.timeframe}
        title="Scanner unavailable"
        body="Could not load persisted run data from FastAPI. Confirm the backend is reachable and try refreshing this dashboard."
      />
    );
  }

  const summary = summarizeHeat(run.rows);

  return (
    <>
      <AppHeader
        timeframe={params.timeframe}
        resultCount={run.rows.length}
        averageHeat={summary.avg}
        maxHeat={summary.max}
        runId={run.id}
        latestRunAt={run.started_at}
        dataAgeLabel={formatDataAge(run.started_at)}
        runStatus={run.status}
      />
      <DashboardShell timeframe={params.timeframe} runId={run.id} results={run.rows} />
    </>
  );
}
