"use client";

import { useMemo, useState } from "react";

import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { RankingsTable, ScoreSortField } from "@/components/dashboard/rankings-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";

type BucketFilter = "all" | "breakout_watch" | "positioning_build" | "squeeze_watch" | "overheat_risk";

export function DashboardShell({
  timeframe,
  limit,
  volumePercentile,
  results,
}: {
  timeframe: ScannerTimeframe;
  limit: number;
  volumePercentile: number;
  results: SymbolScanResult[];
}) {
  const [symbolSearch, setSymbolSearch] = useState("");
  const [sortField, setSortField] = useState<ScoreSortField>("composite_score");
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>("all");

  const counts = useMemo(
    () => ({
      breakout_watch: results.filter((x) => x.signal_bucket === "breakout_watch").length,
      positioning_build: results.filter((x) => x.signal_bucket === "positioning_build").length,
      squeeze_watch: results.filter((x) => x.signal_bucket === "squeeze_watch").length,
      overheat_risk: results.filter((x) => x.signal_bucket === "overheat_risk").length,
    }),
    [results],
  );

  const filteredResults = useMemo(() => {
    const q = symbolSearch.trim().toUpperCase();
    const base = q ? results.filter((item) => item.symbol.includes(q)) : results;
    const bucketed = bucketFilter === "all" ? base : base.filter((item) => item.signal_bucket === bucketFilter);
    return [...bucketed].sort((a, b) => (b[sortField] as number) - (a[sortField] as number));
  }, [results, symbolSearch, sortField, bucketFilter]);

  return (
    <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-4 p-4 lg:grid-cols-[300px_1fr]">
      <div>
        <FiltersPanel
          timeframe={timeframe}
          limit={limit}
          volumePercentile={volumePercentile}
          symbolSearch={symbolSearch}
          onSymbolSearchChange={setSymbolSearch}
        />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card><CardHeader className="text-xs text-zinc-400">Breakout candidates</CardHeader><CardContent className="text-xl font-semibold">{counts.breakout_watch}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Positioning build</CardHeader><CardContent className="text-xl font-semibold">{counts.positioning_build}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Squeeze watch</CardHeader><CardContent className="text-xl font-semibold">{counts.squeeze_watch}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Overheat risk</CardHeader><CardContent className="text-xl font-semibold">{counts.overheat_risk}</CardContent></Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All"],
            ["breakout_watch", "Breakout"],
            ["positioning_build", "Positioning Build"],
            ["squeeze_watch", "Squeeze Watch"],
            ["overheat_risk", "Overheat Risk"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setBucketFilter(value)}
              className={`rounded px-3 py-1 text-xs ${bucketFilter === value ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <RankingsTable
          results={filteredResults}
          sortField={sortField}
          timeframe={timeframe}
          onSortFieldChange={setSortField}
        />
      </div>
    </div>
  );
}
