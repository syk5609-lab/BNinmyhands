import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";

export function AppHeader({
  timeframe,
  resultCount,
  averageHeat,
  maxHeat,
  runId,
  latestRunAt,
  dataAgeLabel,
  runStatus = "complete",
}: {
  timeframe: ScannerTimeframe;
  resultCount?: number;
  averageHeat?: number;
  maxHeat?: number;
  runId?: number;
  latestRunAt?: string;
  dataAgeLabel?: string;
  runStatus?: string;
}) {
  const formattedRunTime = formatRunTime(latestRunAt);
  const complete = runStatus.toLowerCase() === "complete";

  return (
    <section className="sticky top-12 z-40 border-y border-[color:var(--bn-border-soft)] bg-[rgba(6,10,16,0.88)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] overflow-x-auto px-4 sm:px-5 bn-scrollbar">
        <div className="flex min-w-max items-center gap-2 py-2 text-[10px] text-[color:var(--bn-text-muted)]">
          <span className="bn-mono inline-flex h-6 items-center rounded-md border border-cyan-400/22 bg-[rgba(82,213,255,0.12)] px-2.5 text-[10px] font-medium text-cyan-200">
            {timeframe}
          </span>

          {formattedRunTime ? (
            <>
              <StripDot />
              <span className="text-[color:var(--bn-text)]">{formattedRunTime}</span>
            </>
          ) : null}

          {dataAgeLabel ? <span className="text-[color:var(--bn-text-faint)]">{dataAgeLabel}</span> : null}

          {typeof runId === "number" ? (
            <>
              <StripDot />
              <span className="bn-mono text-[color:var(--bn-text-faint)]">run {runId}</span>
            </>
          ) : null}

          {typeof resultCount === "number" ? (
            <>
              <StripDot />
              <span className="bn-mono text-[color:var(--bn-text-faint)]">N={resultCount}</span>
            </>
          ) : null}

          <StripDot />
          <StatusPill label={`RUN ${complete ? "COMPLETE" : runStatus.toUpperCase()}`} tone="success" />
          <StatusPill label="INGESTION OK" tone="success" />

          {typeof averageHeat === "number" ? (
            <>
              <StripDot />
              <span>
                avg heat <span className="bn-mono text-[var(--bn-text)]">{averageHeat.toFixed(2)}</span>
              </span>
            </>
          ) : null}

          {typeof maxHeat === "number" ? (
            <>
              <StripDot />
              <span>
                max heat <span className="bn-mono text-[var(--bn-text)]">{maxHeat.toFixed(2)}</span>
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

function StatusPill({ label, tone }: { label: string; tone: "success" | "warn" }) {
  const dotClass = tone === "success" ? "bg-emerald-400" : "bg-amber-400";

  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[color:var(--bn-text-faint)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function StripDot() {
  return <span className="h-0.5 w-0.5 rounded-full bg-[color:var(--bn-border-soft)]" aria-hidden="true" />;
}

function formatRunTime(value?: string) {
  if (!value) return null;
  const ts = new Date(value);
  if (Number.isNaN(ts.getTime())) return null;
  return ts.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
