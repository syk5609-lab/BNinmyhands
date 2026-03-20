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
  resultCount: number;
  averageHeat: number;
  maxHeat: number;
  runId?: number;
  latestRunAt?: string;
  dataAgeLabel?: string;
}) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-3">
        <div className="text-sm font-semibold tracking-wide text-zinc-100">BN Futures Heat Scanner</div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-300">
          <p>Latest persisted snapshot · {timeframe}</p>
          <p className="mt-1">
            {resultCount} symbols · avg heat {averageHeat.toFixed(2)} · max heat {maxHeat.toFixed(2)}
          </p>
          {typeof runId === "number" ? <p className="mt-1 text-zinc-400">run_id: {runId}</p> : null}
          {latestRunAt ? (
            <p className="mt-1 text-zinc-400">
              Updated {new Date(latestRunAt).toLocaleString()} {dataAgeLabel ? `(${dataAgeLabel})` : ""}
            </p>
          ) : null}
        </div>
        <div className="text-right text-xs text-zinc-400">Theme toggle placeholder</div>
      </div>
    </header>
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
