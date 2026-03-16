"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

export type ScoreSortField = "composite_score" | "momentum_score" | "setup_score" | "positioning_score";

export function RankingsTable({
  results,
  sortField,
  onSortFieldChange,
}: {
  results: SymbolScanResult[];
  sortField: ScoreSortField;
  onSortFieldChange: (field: ScoreSortField) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Hot Futures Rankings</h2>
        <select
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as ScoreSortField)}
        >
          <option value="composite_score">Composite</option>
          <option value="momentum_score">Momentum</option>
          <option value="setup_score">Setup</option>
          <option value="positioning_score">Positioning</option>
        </select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-950 text-xs text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Symbol</th>
                <th className="px-3 py-2 text-right">Last</th>
                <th className="px-3 py-2 text-right">24h %</th>
                <th className="px-3 py-2 text-right">Volume</th>
                <th className="px-3 py-2 text-right">Composite</th>
                <th className="px-3 py-2 text-right">Momentum</th>
                <th className="px-3 py-2 text-right">Setup</th>
                <th className="px-3 py-2 text-right">Positioning</th>
                <th className="px-3 py-2 text-right">Heat</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={row.symbol} className="border-t border-zinc-800 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-400">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium text-zinc-100">
                    <Link href={`/coin/${row.symbol}`} className="text-emerald-300 hover:underline">
                      {row.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-200">{formatPrice(row.last_price)}</td>
                  <td className={`px-3 py-2 text-right ${row.price_change_percent_24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatPercent(row.price_change_percent_24h)}
                  </td>
                  <td className="px-3 py-2 text-right text-zinc-300">{formatCompactNumber(row.quote_volume_24h)}</td>
                  <td className="px-3 py-2 text-right text-zinc-100">{row.composite_score.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-zinc-200">{row.momentum_score.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-zinc-200">{row.setup_score.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-zinc-200">{row.positioning_score.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-right ${row.heat_score >= 0.8 ? "text-emerald-300" : "text-zinc-200"}`}>
                    {row.heat_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function RankingsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-700" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-zinc-800" />
        ))}
      </CardContent>
    </Card>
  );
}
