import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";

export function AppHeader({
  timeframe,
  resultCount,
  averageHeat,
  maxHeat,
  runId,
  latestRunAt,
  dataAgeLabel,
}: {
  timeframe: ScannerTimeframe;
  resultCount?: number;
  averageHeat?: number;
  maxHeat?: number;
  runId?: number;
  latestRunAt?: string;
  dataAgeLabel?: string;
}) {
  const formattedRunTime = formatRunTime(latestRunAt);

  return (
    <section className="sticky top-[65px] z-40 border-y border-[color:var(--bn-border-soft)] bg-[rgba(6,9,15,0.82)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1700px] overflow-x-auto px-4 bn-scrollbar">
        <div className="flex min-w-max items-center gap-2 py-2 text-[11px] text-[color:var(--bn-text-muted)]">
          <span className="bn-mono inline-flex h-6 items-center rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200">
            {timeframe}
          </span>

          {typeof runId === "number" ? (
            <>
              <StripDot />
              <span className="bn-mono text-[10px] text-[color:var(--bn-text-faint)]">run_id {runId}</span>
            </>
          ) : null}

          {formattedRunTime ? (
            <>
              <StripDot />
              <span>Updated {formattedRunTime}</span>
            </>
          ) : null}

          {dataAgeLabel ? (
            <>
              <StripDot />
              <span>{dataAgeLabel}</span>
            </>
          ) : null}

          {typeof resultCount === "number" ? (
            <>
              <StripDot />
              <span className="bn-mono text-[10px] text-[color:var(--bn-text-faint)]">N={resultCount}</span>
            </>
          ) : null}

          {typeof averageHeat === "number" ? (
            <>
              <StripDot />
              <span>
                avg heat <span className="bn-mono text-[10px] text-[var(--bn-text)]">{averageHeat.toFixed(2)}</span>
              </span>
            </>
          ) : null}

          {typeof maxHeat === "number" ? (
            <>
              <StripDot />
              <span>
                max heat <span className="bn-mono text-[10px] text-[var(--bn-text)]">{maxHeat.toFixed(2)}</span>
              </span>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function summarizeHeat(results: SymbolScanResult[]) {
  if (!results.length) {
    return { avg: 0, max: 0 };
  }
  const total = results.reduce((acc, item) => acc + item.heat_score, 0);
  const max = results.reduce((acc, item) => Math.max(acc, item.heat_score), Number.NEGATIVE_INFINITY);
  return { avg: total / results.length, max };
}

function StripDot() {
  return <span className="h-1 w-1 rounded-full bg-[color:var(--bn-border-soft)]" aria-hidden="true" />;
}

function formatRunTime(value?: string) {
  if (!value) return null;
  const ts = new Date(value);
  if (Number.isNaN(ts.getTime())) return null;
  return ts.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
