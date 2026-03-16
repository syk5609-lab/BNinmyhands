"use client";

import { useMemo, useState } from "react";

import { SymbolDetailsNotes } from "@/components/community/symbol-details-notes";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { RankingsTable } from "@/components/dashboard/rankings-table";
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
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(results[0]?.symbol ?? null);

  const filteredResults = useMemo(() => {
    const q = symbolSearch.trim().toUpperCase();
    if (!q) return results;
    return results.filter((item) => item.symbol.includes(q));
  }, [results, symbolSearch]);

  const selected = filteredResults.find((item) => item.symbol === selectedSymbol) ?? filteredResults[0];

  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[300px_1fr_360px]">
      <div>
        <FiltersPanel
          timeframe={timeframe}
          limit={limit}
          volumePercentile={volumePercentile}
          symbolSearch={symbolSearch}
          onSymbolSearchChange={setSymbolSearch}
        />
      </div>
      <div>
        <RankingsTable
          results={filteredResults}
          selectedSymbol={selected?.symbol ?? null}
          onSelectSymbol={setSelectedSymbol}
        />
      </div>
      <div>
        <SymbolDetailsNotes selected={selected} />
      </div>
    </div>
  );
}
