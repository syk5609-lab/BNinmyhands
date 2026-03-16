"use client";

import { useMemo, useState } from "react";

import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { RankingsTable, ScoreSortField } from "@/components/dashboard/rankings-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";

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

  const filteredResults = useMemo(() => {
    const q = symbolSearch.trim().toUpperCase();
    const base = q ? results.filter((item) => item.symbol.includes(q)) : results;
    return [...base].sort((a, b) => (b[sortField] as number) - (a[sortField] as number));
  }, [results, symbolSearch, sortField]);

  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[300px_1fr]">
      <div>
        <FiltersPanel
          timeframe={timeframe}
          limit={limit}
          volumePercentile={volumePercentile}
          symbolSearch={symbolSearch}
          onSymbolSearchChange={setSymbolSearch}
        />
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-sm font-semibold text-zinc-100">Research entry</h3>
          </CardHeader>
          <CardContent className="text-xs text-zinc-400">
            Click a symbol in the table to open its coin research page with latest + history API data.
          </CardContent>
        </Card>
      </div>
      <div>
        <RankingsTable results={filteredResults} sortField={sortField} onSortFieldChange={setSortField} />
      </div>
    </div>
  );
}
