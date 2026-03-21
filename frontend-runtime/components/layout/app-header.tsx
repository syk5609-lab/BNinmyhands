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
    <section className="sticky top-14 z-40 border-y border-[color:var(--bn-border-soft)] bg-[rgba(6,10,16,0.9)] backdrop-blur-xl">
      <div className="bn-dashboard-width mx-auto overflow-x-auto px-4 sm:px-5 bn-scrollbar">
        <div className="flex min-w-max items-center gap-2 py-2.5 text-[10px] text-[color:var(--bn-text-muted)]">
          <span className="bn-mono inline-flex h-7 items-center rounded-lg border border-cyan-400/22 bg-[rgba(82,213,255,0.12)] px-3 text-[10px] font-medium text-cyan-200">
            {timeframe}
          </span>

          {formattedRunTime ? <MetaPill label={`Updated ${formattedRunTime}`} strong /> : null}

          {dataAgeLabel ? <MetaPill label={dataAgeLabel} /> : null}

          {typeof runId === "number" ? <MetaPill label={`run ${runId}`} mono /> : null}

          {typeof resultCount === "number" ? <MetaPill label={`N=${resultCount}`} mono /> : null}

          <StatusPill label={`RUN ${complete ? "COMPLETE" : runStatus.toUpperCase()}`} tone="success" />
          <StatusPill label="INGESTION OK" tone="success" />

          {typeof averageHeat === "number" ? <MetaPill label={`avg heat ${averageHeat.toFixed(2)}`} mono /> : null}

          {typeof maxHeat === "number" ? <MetaPill label={`max heat ${maxHeat.toFixed(2)}`} mono /> : null}
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
    <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[rgba(42,53,69,0.55)] bg-[#0d141d] px-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[color:var(--bn-text-faint)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function MetaPill({ label, mono = false, strong = false }: { label: string; mono?: boolean; strong?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-lg border border-[rgba(42,53,69,0.55)] bg-[#0d141d] px-3 text-[10px] ${
        mono ? "bn-mono" : ""
      } ${strong ? "text-[var(--bn-text)]" : "text-[color:var(--bn-text-faint)]"}`}
    >
      {label}
    </span>
  );
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
