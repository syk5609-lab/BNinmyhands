"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdPlacement } from "@/components/ads/ad-placement";
import { useAuth } from "@/components/auth/auth-provider";
import { RankingsTable, ScoreSortField } from "@/components/dashboard/rankings-table";
import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent } from "@/lib/utils/format";

type DashboardBucketFilter =
  | "all"
  | "breakout_watch"
  | "positioning_build"
  | "squeeze_watch"
  | "overheat_risk";

type StrategyPreset = "breakout" | "positioning_build" | "squeeze_watch" | "overheat_risk";

const PRESET_CONFIG: Record<
  StrategyPreset,
  {
    label: string;
    bucket: Exclude<DashboardBucketFilter, "all">;
    sortField: ScoreSortField;
    description: string;
    activeClass: string;
    inactiveIconClass: string;
    icon: string;
  }
> = {
  breakout: {
    label: "Breakout",
    bucket: "breakout_watch",
    sortField: "setup_score",
    description: "Expansion setups with stronger confirmation and clean follow-through.",
    activeClass: "border-cyan-400/24 bg-cyan-400/[0.08] text-cyan-100 ring-1 ring-cyan-400/16",
    inactiveIconClass: "text-cyan-300/45",
    icon: "B",
  },
  positioning_build: {
    label: "Positioning",
    bucket: "positioning_build",
    sortField: "positioning_score",
    description: "Positioning pressure that can mature before price fully expands.",
    activeClass: "border-violet-400/24 bg-violet-400/[0.08] text-violet-100 ring-1 ring-violet-400/16",
    inactiveIconClass: "text-violet-300/45",
    icon: "P",
  },
  squeeze_watch: {
    label: "Squeeze",
    bucket: "squeeze_watch",
    sortField: "positioning_score",
    description: "Crowded setups where pressure unwind could move quickly.",
    activeClass: "border-amber-400/24 bg-amber-400/[0.08] text-amber-100 ring-1 ring-amber-400/16",
    inactiveIconClass: "text-amber-300/45",
    icon: "S",
  },
  overheat_risk: {
    label: "Overheat",
    bucket: "overheat_risk",
    sortField: "composite_score",
    description: "Stretched names with elevated heat and thinner confirmation.",
    activeClass: "border-rose-400/24 bg-rose-400/[0.08] text-rose-100 ring-1 ring-rose-400/16",
    inactiveIconClass: "text-rose-300/45",
    icon: "O",
  },
};

const BUCKET_FILTERS: Array<{ value: DashboardBucketFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "breakout_watch", label: "Breakout" },
  { value: "positioning_build", label: "Positioning" },
  { value: "squeeze_watch", label: "Squeeze" },
  { value: "overheat_risk", label: "Overheat" },
];

const BUCKET_META: Record<
  Exclude<DashboardBucketFilter, "all">,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    statClass: string;
    progressClass: string;
    icon: string;
  }
> = {
  breakout_watch: {
    label: "Breakout",
    shortLabel: "BRK",
    badgeClass: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
    statClass: "text-cyan-300",
    progressClass: "bg-cyan-400/40",
    icon: "B",
  },
  positioning_build: {
    label: "Positioning",
    shortLabel: "POS",
    badgeClass: "border-violet-400/18 bg-violet-400/10 text-violet-100",
    statClass: "text-violet-300",
    progressClass: "bg-violet-400/40",
    icon: "P",
  },
  squeeze_watch: {
    label: "Squeeze",
    shortLabel: "SQZ",
    badgeClass: "border-amber-400/18 bg-amber-400/10 text-amber-100",
    statClass: "text-amber-300",
    progressClass: "bg-amber-400/40",
    icon: "S",
  },
  overheat_risk: {
    label: "Overheat",
    shortLabel: "OVH",
    badgeClass: "border-rose-400/18 bg-rose-400/10 text-rose-100",
    statClass: "text-rose-300",
    progressClass: "bg-rose-400/40",
    icon: "O",
  },
};

const TIMEFRAMES: ScannerTimeframe[] = ["1h", "4h", "24h"];

export function DashboardShell({
  timeframe,
  runId,
  results,
}: {
  timeframe: ScannerTimeframe;
  runId: number;
  results: SymbolScanResult[];
}) {
  const { user } = useAuth();
  const defaultPreset: StrategyPreset = "breakout";
  const [symbolSearch, setSymbolSearch] = useState("");
  const [sortField, setSortField] = useState<ScoreSortField>(PRESET_CONFIG[defaultPreset].sortField);
  const [bucketFilter, setBucketFilter] = useState<DashboardBucketFilter>(PRESET_CONFIG[defaultPreset].bucket);
  const [preset, setPreset] = useState<StrategyPreset>(defaultPreset);

  const counts = useMemo(
    () => ({
      breakout_watch: results.filter((item) => item.signal_bucket === "breakout_watch").length,
      positioning_build: results.filter((item) => item.signal_bucket === "positioning_build").length,
      squeeze_watch: results.filter((item) => item.signal_bucket === "squeeze_watch").length,
      overheat_risk: results.filter((item) => item.signal_bucket === "overheat_risk").length,
    }),
    [results],
  );

  const presetDetails = PRESET_CONFIG[preset];

  const filteredResults = useMemo(() => {
    const query = symbolSearch.trim().toUpperCase();
    const bySearch = query ? results.filter((item) => item.symbol.includes(query)) : results;
    const byBucket = bucketFilter === "all" ? bySearch : bySearch.filter((item) => item.signal_bucket === bucketFilter);
    return [...byBucket].sort((a, b) => (b[sortField] as number) - (a[sortField] as number));
  }, [results, symbolSearch, sortField, bucketFilter]);

  const topCandidates = filteredResults.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-2 sm:px-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 py-0.5 text-[10px] text-[color:var(--bn-text-faint)]">
          <span className="h-1 w-1 rounded-full bg-[#2a3545]" aria-hidden="true" />
          <p>Research / educational use only. Rankings reflect persisted run snapshots, not live execution data.</p>
        </div>

        {!user ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--bn-border-soft)] bg-[#0a0f16] px-4 py-2">
            <span className="text-[11px] text-[color:var(--bn-text-muted)]">
              Browsing as guest. Sign in to access community actions and account preferences.
            </span>
            <Link
              href="/login"
              className="text-[10px] font-medium text-cyan-300 transition-colors hover:text-cyan-100"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        <AdPlacement placement="dashboard_top" />

        <section className="rounded-lg border border-[color:var(--bn-border)] bg-[#0a0f16] px-3.5 py-3.5 sm:px-4">
          <span className="block text-[10px] uppercase tracking-[0.15em] text-[color:var(--bn-text-faint)]">
            Strategy Preset
          </span>

          <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {(Object.entries(PRESET_CONFIG) as [StrategyPreset, (typeof PRESET_CONFIG)[StrategyPreset]][]).map(
              ([value, config]) => {
                const active = preset === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setPreset(value);
                      setBucketFilter(config.bucket);
                      setSortField(config.sortField);
                    }}
                    className={`rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      active
                        ? config.activeClass
                        : "border-[color:var(--bn-border-soft)] bg-[#0a0f16] text-[color:var(--bn-text-faint)] hover:border-[#2a3545] hover:text-[var(--bn-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-semibold ${
                          active ? "bg-white/8 text-current" : config.inactiveIconClass
                        }`}
                      >
                        {config.icon}
                      </span>
                      <span className="text-[12px] font-medium">{config.label}</span>
                    </div>
                    {active ? (
                      <p className="mt-1.5 text-[10px] leading-5 text-[color:var(--bn-text-muted)]">{config.description}</p>
                    ) : null}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-[color:var(--bn-border)]">
                {TIMEFRAMES.map((value) => (
                  <Link
                    key={value}
                    href={`/?timeframe=${value}`}
                    className={`bn-mono border-r border-[color:var(--bn-border)] px-3.5 py-1.5 text-[11px] transition-colors last:border-r-0 ${
                      timeframe === value
                        ? "bg-[#1a2332] text-[var(--bn-text-strong)]"
                        : "bg-[#080d14] text-[color:var(--bn-text-faint)] hover:bg-[#0d1219] hover:text-[var(--bn-text)]"
                    }`}
                  >
                    {value}
                  </Link>
                ))}
              </div>

              <div className="hidden items-center gap-1.5 rounded bg-[#0f1520] px-2 py-1 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" aria-hidden="true" />
                <span className="text-[10px] text-[color:var(--bn-text-muted)]">{presetDetails.label}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2">
              {BUCKET_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setBucketFilter(filter.value)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    bucketFilter === filter.value
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-[color:var(--bn-border-soft)] bg-[#0a0f16] text-[color:var(--bn-text-faint)] hover:border-[#2a3545] hover:text-[var(--bn-text)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="relative block w-full lg:ml-auto lg:max-w-[220px]">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[color:var(--bn-text-faint)]">
                /
              </span>
              <input
                type="text"
                placeholder="Search symbol..."
                value={symbolSearch}
                onChange={(event) => setSymbolSearch(event.target.value)}
                className="w-full rounded-lg border border-[color:var(--bn-border)] bg-[#080d14] py-1.5 pl-8 pr-3 text-[11px] text-[var(--bn-text)] outline-none transition-colors placeholder:text-[color:var(--bn-text-faint)] focus:border-cyan-400/20 focus:bg-[#0b1018]"
              />
            </label>
          </div>
        </section>

        <section>
          <div className="mb-2.5 flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-[color:var(--bn-text-muted)]">
              <span className="text-[10px] text-[color:var(--bn-text-faint)]">#</span>
              <span className="font-medium">Top Candidates</span>
            </div>
            <span className="text-[color:var(--bn-text-faint)]">·</span>
            <span className="rounded border border-[color:var(--bn-border-soft)] bg-[#0f1520] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--bn-text-muted)]">
              {presetDetails.label}
            </span>
            <span className="text-[10px] text-[color:var(--bn-text-faint)]">
              {filteredResults.length} result{filteredResults.length === 1 ? "" : "s"} in view
            </span>
          </div>

          {topCandidates.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {topCandidates.map((candidate, index) => {
                const bucket = BUCKET_META[candidate.signal_bucket];

                return (
                  <Link
                    key={`${candidate.symbol}-${index}`}
                    href={`/coin/${candidate.symbol}?timeframe=${timeframe}&run_id=${runId}`}
                    className={`group relative rounded-lg border bg-[#0a0f16] p-3.5 transition-colors ${
                      index === 0
                        ? "border-cyan-400/20 ring-1 ring-cyan-400/12 hover:border-cyan-400/30"
                        : "border-[color:var(--bn-border)] hover:border-[#2a3545] hover:bg-[#0d1219]"
                    }`}
                  >
                    <span className={`absolute right-3 top-2.5 bn-mono text-[10px] ${index === 0 ? "text-cyan-300/60" : "text-[color:var(--bn-text-faint)]"}`}>
                      #{index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[var(--bn-text-strong)]">{candidate.symbol}</span>
                      <span className={`rounded border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.04em] ${bucket.badgeClass}`}>
                        {bucket.shortLabel}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-end justify-between gap-3">
                      <div>
                        <span className="block text-[9px] text-[color:var(--bn-text-faint)]">Composite</span>
                        <span className={`bn-mono text-lg ${index === 0 ? "text-cyan-300" : "text-[var(--bn-text)]"}`}>
                          {candidate.composite_score.toFixed(1)}
                        </span>
                      </div>
                      <div className={`bn-mono text-[11px] ${candidate.price_change_percent_24h >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {formatPercent(candidate.price_change_percent_24h)}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <CompactMetric label="Heat" value={candidate.heat_score.toFixed(2)} />
                      <CompactMetric label="Vol" value={formatCompactNumber(candidate.quote_volume_24h)} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.reason_tags.length ? (
                        candidate.reason_tags.slice(0, 2).map((reason) => (
                          <span
                            key={reason}
                            className="rounded border border-[color:var(--bn-border-soft)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[color:var(--bn-text-faint)]"
                          >
                            {reason}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-[color:var(--bn-text-faint)]">No reason tags</span>
                      )}
                    </div>

                    <span className="absolute bottom-3 right-3 text-[11px] text-[color:var(--bn-text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                      {">"}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--bn-border)] bg-[#0a0f16] px-5 py-8 text-center">
              <p className="text-sm font-medium text-[var(--bn-text-strong)]">No candidates match the active slice.</p>
              <p className="mt-1.5 text-sm text-[color:var(--bn-text-muted)]">
                Adjust the preset, bucket, or symbol search to widen the dashboard view.
              </p>
            </div>
          )}
        </section>

        <section>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-[color:var(--bn-text-faint)]">
            Bucket Distribution
          </span>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {(Object.entries(BUCKET_META) as [keyof typeof BUCKET_META, (typeof BUCKET_META)[keyof typeof BUCKET_META]][]).map(
              ([bucket, meta]) => {
                const total = results.length || 1;
                const count = counts[bucket];
                const percent = (count / total) * 100;

                return (
                  <div key={bucket} className="rounded-lg border border-[color:var(--bn-border-soft)] bg-[#0a0f16] p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-semibold ${meta.statClass}`}>
                          {meta.icon}
                        </span>
                        <span className="text-[11px] font-medium text-[color:var(--bn-text-muted)]">{meta.label}</span>
                      </div>
                      <span className="bn-mono text-[10px] text-[color:var(--bn-text-faint)]">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2.5 flex items-end gap-2">
                      <span className={`bn-mono text-xl ${meta.statClass}`}>{count}</span>
                      <span className="text-[10px] text-[color:var(--bn-text-faint)]">of {results.length}</span>
                    </div>
                    <div className="mt-2.5 h-[2px] overflow-hidden rounded-full bg-[#141a24]">
                      <div className={`h-full rounded-full ${meta.progressClass}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <AdPlacement placement="dashboard_mid" />

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

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-[#111827] px-2 py-1.5">
      <p className="text-[8px] uppercase tracking-[0.12em] text-[color:var(--bn-text-faint)]">{label}</p>
      <p className="mt-1 bn-mono text-[11px] text-[var(--bn-text)]">{value}</p>
    </div>
  );
}
