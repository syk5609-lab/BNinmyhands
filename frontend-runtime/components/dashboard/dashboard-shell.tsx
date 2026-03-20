"use client";

import { useMemo, useState } from "react";

import { AdPlacement } from "@/components/ads/ad-placement";
import { FiltersPanel } from "@/components/dashboard/filters-panel";
import { RankingsTable, ScoreSortField } from "@/components/dashboard/rankings-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";

type BucketFilter = "all" | "breakout_watch" | "positioning_build" | "squeeze_watch" | "overheat_risk";
type StrategyPreset = "breakout" | "positioning_build" | "squeeze_watch" | "overheat_risk";

const PRESET_CONFIG: Record<
  StrategyPreset,
  { label: string; bucket: Exclude<BucketFilter, "all">; sortField: ScoreSortField; description: string }
> = {
  breakout: {
    label: "Breakout",
    bucket: "breakout_watch",
    sortField: "setup_score",
    description: "Focus on expansion setups with strong confirmation and breakout-style follow-through.",
  },
  positioning_build: {
    label: "Positioning Build",
    bucket: "positioning_build",
    sortField: "positioning_score",
    description: "Surface names where positioning is building before price has fully expanded.",
  },
  squeeze_watch: {
    label: "Squeeze Watch",
    bucket: "squeeze_watch",
    sortField: "positioning_score",
    description: "Emphasize crowded setups that may unwind fast if momentum starts to squeeze.",
  },
  overheat_risk: {
    label: "Overheat Risk",
    bucket: "overheat_risk",
    sortField: "composite_score",
    description: "Highlight stretched names where the move looks hot but confirmation quality is weaker.",
  },
};

export function DashboardShell({
  timeframe,
  runId,
  results,
}: {
  timeframe: ScannerTimeframe;
  runId: number;
  results: SymbolScanResult[];
}) {
  const defaultPreset: StrategyPreset = "breakout";
  const [symbolSearch, setSymbolSearch] = useState("");
  const [sortField, setSortField] = useState<ScoreSortField>(PRESET_CONFIG[defaultPreset].sortField);
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>(PRESET_CONFIG[defaultPreset].bucket);
  const [preset, setPreset] = useState<StrategyPreset>(defaultPreset);

  const counts = useMemo(
    () => ({
      breakout_watch: results.filter((x) => x.signal_bucket === "breakout_watch").length,
      positioning_build: results.filter((x) => x.signal_bucket === "positioning_build").length,
      squeeze_watch: results.filter((x) => x.signal_bucket === "squeeze_watch").length,
      overheat_risk: results.filter((x) => x.signal_bucket === "overheat_risk").length,
    }),
    [results],
  );
  const presetDetails = PRESET_CONFIG[preset];

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
          symbolSearch={symbolSearch}
          onSymbolSearchChange={setSymbolSearch}
        />
      </div>
      <div className="space-y-4">
        <Card className="border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-950 to-zinc-950">
          <CardHeader className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Strategy presets</h2>
              <p className="mt-1 text-sm text-zinc-400">{presetDetails.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(PRESET_CONFIG) as [StrategyPreset, (typeof PRESET_CONFIG)[StrategyPreset]][]).map(
                ([value, config]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPreset(value);
                      setBucketFilter(config.bucket);
                      setSortField(config.sortField);
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs transition ${
                      preset === value ? "bg-cyan-500/20 text-cyan-300" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {config.label}
                  </button>
                ),
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card><CardHeader className="text-xs text-zinc-400">Breakout candidates</CardHeader><CardContent className="text-xl font-semibold">{counts.breakout_watch}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Positioning build</CardHeader><CardContent className="text-xl font-semibold">{counts.positioning_build}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Squeeze watch</CardHeader><CardContent className="text-xl font-semibold">{counts.squeeze_watch}</CardContent></Card>
          <Card><CardHeader className="text-xs text-zinc-400">Overheat risk</CardHeader><CardContent className="text-xl font-semibold">{counts.overheat_risk}</CardContent></Card>
        </div>

        <AdPlacement placement="dashboard_mid" />

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
          runId={runId}
          onSortFieldChange={setSortField}
        />
      </div>
    </div>
  );
}
