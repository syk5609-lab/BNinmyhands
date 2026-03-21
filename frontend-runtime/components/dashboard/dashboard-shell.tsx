"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdPlacement } from "@/components/ads/ad-placement";
import { useAuth } from "@/components/auth/auth-provider";
import { RankingsTable, ScoreSortField } from "@/components/dashboard/rankings-table";
import { ScannerTimeframe, SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent } from "@/lib/utils/format";

type StrategyPreset = "breakout" | "positioning" | "squeeze" | "overheat";
type DirectionMode = "pump" | "dump";

const PRESET_CONFIG: Record<
  StrategyPreset,
  {
    title: string;
    bucket: SymbolScanResult["signal_bucket"];
    sortField: ScoreSortField;
    label: string;
    explanation: string;
    icon: string;
    accent: string;
    accentText: string;
    accentBorder: string;
    badgeClass: string;
  }
> = {
  breakout: {
    title: "Breakout View",
    bucket: "breakout_watch",
    sortField: "composite_score",
    label: "Breakout View",
    explanation:
      "Sorted by composite score. Highlights coins with strong momentum, rising volume, and technical breakout setups.",
    icon: "BRK",
    accent: "rgba(0, 176, 255, 0.08)",
    accentText: "text-cyan-300",
    accentBorder: "rgba(0, 176, 255, 0.35)",
    badgeClass: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
  },
  positioning: {
    title: "Positioning Build View",
    bucket: "positioning_build",
    sortField: "positioning_score",
    label: "Positioning Build View",
    explanation:
      "Sorted by positioning score. Highlights coins where smart money is building positions with OI, taker flow, and L/S shifts.",
    icon: "POS",
    accent: "rgba(167, 139, 250, 0.08)",
    accentText: "text-violet-300",
    accentBorder: "rgba(167, 139, 250, 0.32)",
    badgeClass: "border-violet-400/18 bg-violet-400/10 text-violet-100",
  },
  squeeze: {
    title: "Squeeze Watch View",
    bucket: "squeeze_watch",
    sortField: "setup_score",
    label: "Squeeze Watch View",
    explanation:
      "Sorted by setup score. Identifies squeeze candidates with crowded positioning, extreme funding, and low-liquidity pockets.",
    icon: "SQZ",
    accent: "rgba(247, 185, 85, 0.08)",
    accentText: "text-amber-300",
    accentBorder: "rgba(247, 185, 85, 0.32)",
    badgeClass: "border-amber-400/18 bg-amber-400/10 text-amber-100",
  },
  overheat: {
    title: "Overheat Risk View",
    bucket: "overheat_risk",
    sortField: "composite_score",
    label: "Overheat Risk View",
    explanation:
      "Sorted by risk penalty. Flags overheated coins with extreme funding, rapid OI growth, and extended price moves.",
    icon: "RISK",
    accent: "rgba(248, 113, 113, 0.08)",
    accentText: "text-rose-300",
    accentBorder: "rgba(248, 113, 113, 0.32)",
    badgeClass: "border-rose-400/18 bg-rose-400/10 text-rose-100",
  },
};

const BUCKET_META: Record<
  SymbolScanResult["signal_bucket"],
  {
    label: string;
    shortLabel: string;
    icon: string;
    wrapperClass: string;
    countClass: string;
    progressClass: string;
    badgeClass: string;
  }
> = {
  breakout_watch: {
    label: "Breakout",
    shortLabel: "BRK",
    icon: "BRK",
    wrapperClass: "border-cyan-400/18 bg-[rgba(0,176,255,0.04)]",
    countClass: "text-cyan-300",
    progressClass: "bg-cyan-400/40",
    badgeClass: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
  },
  positioning_build: {
    label: "Positioning",
    shortLabel: "POS",
    icon: "POS",
    wrapperClass: "border-violet-400/18 bg-[rgba(167,139,250,0.04)]",
    countClass: "text-violet-300",
    progressClass: "bg-violet-400/40",
    badgeClass: "border-violet-400/18 bg-violet-400/10 text-violet-100",
  },
  squeeze_watch: {
    label: "Squeeze",
    shortLabel: "SQZ",
    icon: "SQZ",
    wrapperClass: "border-amber-400/18 bg-[rgba(247,185,85,0.04)]",
    countClass: "text-amber-300",
    progressClass: "bg-amber-400/40",
    badgeClass: "border-amber-400/18 bg-amber-400/10 text-amber-100",
  },
  overheat_risk: {
    label: "Overheat",
    shortLabel: "OVH",
    icon: "OVH",
    wrapperClass: "border-rose-400/18 bg-[rgba(248,113,113,0.04)]",
    countClass: "text-rose-300",
    progressClass: "bg-rose-400/40",
    badgeClass: "border-rose-400/18 bg-rose-400/10 text-rose-100",
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
  const [preset, setPreset] = useState<StrategyPreset>("breakout");
  const [directionMode, setDirectionMode] = useState<DirectionMode>("pump");
  const [symbolSearch, setSymbolSearch] = useState("");

  const presetDetails = PRESET_CONFIG[preset];

  const directionFiltered = useMemo(() => {
    return results.filter((item) =>
      directionMode === "pump" ? item.price_change_percent_24h >= 0 : item.price_change_percent_24h < 0,
    );
  }, [directionMode, results]);

  const filteredResults = useMemo(() => {
    const query = symbolSearch.trim().toUpperCase();
    const byBucket = directionFiltered.filter((item) => item.signal_bucket === presetDetails.bucket);
    const bySearch = query ? byBucket.filter((item) => item.symbol.includes(query)) : byBucket;
    return [...bySearch].sort((a, b) => (b[presetDetails.sortField] as number) - (a[presetDetails.sortField] as number));
  }, [directionFiltered, presetDetails.bucket, presetDetails.sortField, symbolSearch]);

  const topCandidates = filteredResults.slice(0, 5);

  const counts = useMemo(
    () => ({
      breakout_watch: directionFiltered.filter((item) => item.signal_bucket === "breakout_watch").length,
      positioning_build: directionFiltered.filter((item) => item.signal_bucket === "positioning_build").length,
      squeeze_watch: directionFiltered.filter((item) => item.signal_bucket === "squeeze_watch").length,
      overheat_risk: directionFiltered.filter((item) => item.signal_bucket === "overheat_risk").length,
    }),
    [directionFiltered],
  );

  return (
    <div className="bn-dashboard-width mx-auto px-4 pb-8 pt-3 sm:px-5">
      <div className="bn-dashboard-top">
        <TrustStrip />

        {!user ? (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[rgba(30,42,58,0.5)] bg-[#0a0f16] px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] text-[color:var(--bn-text-faint)]">
              <span className="rounded-md border border-[rgba(42,53,69,0.6)] bg-[#0f1520] px-2 py-1 text-[10px] uppercase tracking-[0.14em]">
                Guest
              </span>
              <span>Browsing as guest. Sign in to access community discussion and save preferences.</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-cyan-400/18 bg-[rgba(0,161,255,0.08)] px-3 py-2 text-[11px] font-medium text-cyan-200 hover:bg-[rgba(0,161,255,0.14)]"
            >
              Sign in
            </Link>
          </section>
        ) : null}

        <section>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--bn-text-faint)]">
            Strategy Preset
          </p>

          <div className="bn-preset-grid">
            {(Object.entries(PRESET_CONFIG) as [StrategyPreset, (typeof PRESET_CONFIG)[StrategyPreset]][]).map(
              ([value, config]) => {
                const active = preset === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreset(value)}
                    className={`min-h-[112px] rounded-[16px] border px-4 py-3.5 text-left transition-colors ${
                      active
                        ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
                        : "border-[rgba(30,42,58,0.75)] bg-[#0a0f16] text-[#76849a] hover:border-[rgba(42,53,69,1)] hover:text-[#aab5c8]"
                    }`}
                    style={
                      active
                        ? {
                            background: config.accent,
                            borderColor: config.accentBorder,
                          }
                        : undefined
                    }
                  >
                    <div className={`flex items-center gap-2 text-[12px] font-medium ${active ? config.accentText : ""}`}>
                      <span className="bn-mono rounded-md border border-current/15 bg-white/[0.03] px-1.5 py-0.5 text-[9px] opacity-85">
                        {config.icon}
                      </span>
                      {config.title}
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-[color:var(--bn-text-muted)]">{config.explanation}</p>
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-[rgba(30,42,58,0.88)]">
                {TIMEFRAMES.map((value) => (
                  <Link
                    key={value}
                    href={`/?timeframe=${value}`}
                    className={`bn-mono border-r border-[rgba(30,42,58,0.88)] px-3.5 py-2 text-[11px] last:border-r-0 ${
                      timeframe === value
                        ? "bg-[#162131] text-[#eef6ff]"
                        : "bg-[#080d14] text-[#6f7b90] hover:bg-[#0d1219] hover:text-[#b5c0d2]"
                    }`}
                  >
                    {value}
                  </Link>
                ))}
              </div>

              <div className="flex overflow-hidden rounded-lg border border-[rgba(30,42,58,0.88)]">
                <button
                  type="button"
                  onClick={() => setDirectionMode("pump")}
                  className={`px-3.5 py-2 text-[11px] font-medium ${
                    directionMode === "pump"
                      ? "bg-[rgba(73,215,156,0.12)] text-emerald-300"
                      : "bg-[#080d14] text-[#6f7b90] hover:text-[#b5c0d2]"
                  }`}
                >
                  Pump
                </button>
                <button
                  type="button"
                  onClick={() => setDirectionMode("dump")}
                  className={`border-l border-[rgba(30,42,58,0.88)] px-3.5 py-2 text-[11px] font-medium ${
                    directionMode === "dump"
                      ? "bg-[rgba(248,113,113,0.12)] text-rose-300"
                      : "bg-[#080d14] text-[#6f7b90] hover:text-[#b5c0d2]"
                  }`}
                >
                  Dump
                </button>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(30,42,58,0.6)] bg-[#0f1520] px-3 py-2 text-[10px] text-[color:var(--bn-text-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" aria-hidden="true" />
                {presetDetails.label}
              </span>
            </div>

            <label className="relative block w-full xl:ml-auto xl:max-w-[240px]">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#657084]">
                /
              </span>
              <input
                type="text"
                placeholder="Search symbol..."
                value={symbolSearch}
                onChange={(event) => setSymbolSearch(event.target.value)}
                className="w-full rounded-lg border border-[rgba(30,42,58,0.88)] bg-[#080d14] py-2 pl-8 pr-3 text-[11px] text-[#cdd5e1] outline-none transition-colors placeholder:text-[#657084] focus:border-cyan-400/20"
              />
            </label>
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--bn-text-muted)]">
            <span className="font-medium text-[#dce5ef]">Top Highlights</span>
            <span className="rounded-lg border border-emerald-400/20 bg-[rgba(73,215,156,0.12)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-300">
              {directionMode}
            </span>
            <span className="text-[10px] text-[color:var(--bn-text-faint)]">{presetDetails.label}</span>
          </div>

          {topCandidates.length ? (
            <div className="bn-candidate-grid">
              {topCandidates.map((candidate, index) => {
                const bucket = BUCKET_META[candidate.signal_bucket];

                return (
                  <Link
                    key={`${candidate.symbol}-${index}`}
                    href={`/coin/${candidate.symbol}?timeframe=${timeframe}&run_id=${runId}`}
                    className={`bn-top-candidate-card group relative rounded-[16px] border bg-[#0a0f16] p-4 transition-colors ${
                      index === 0
                        ? "border-cyan-400/28 shadow-[inset_0_0_0_1px_rgba(82,213,255,0.12)]"
                        : "border-[rgba(30,42,58,0.85)] hover:border-[rgba(42,53,69,1)]"
                    }`}
                  >
                    <span className={`absolute right-4 top-4 bn-mono text-[10px] ${index === 0 ? "text-cyan-300" : "text-[#657084]"}`}>
                      #{index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-semibold leading-none text-[#eef6ff]">{candidate.symbol}</span>
                      <span className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.04em] ${bucket.badgeClass}`}>
                        {bucket.shortLabel}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] text-[#657084]">Composite</p>
                      <div className="mt-1 flex items-end justify-between gap-3">
                        <span className={`bn-mono text-[32px] leading-none ${index === 0 ? "text-cyan-300" : "text-[#e6eef7]"}`}>
                          {candidate.composite_score.toFixed(1)}
                        </span>
                        <span
                          className={`bn-mono text-[13px] font-medium ${
                            candidate.price_change_percent_24h >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatPercent(candidate.price_change_percent_24h)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MetricChip label="Heat" value={candidate.heat_score.toFixed(2)} />
                      <MetricChip label="Vol" value={formatCompactNumber(candidate.quote_volume_24h)} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {candidate.reason_tags.length ? (
                        candidate.reason_tags.slice(0, 2).map((reason) => (
                          <span
                            key={reason}
                            className="rounded border border-[rgba(42,53,69,0.5)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[#788398]"
                          >
                            {reason}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-[#657084]">No tags</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <section className="rounded-lg border border-dashed border-[rgba(30,42,58,0.88)] bg-[#0a0f16] px-5 py-8 text-center">
              <p className="text-sm font-medium text-[#eef6ff]">No candidates match the current slice.</p>
              <p className="mt-1.5 text-sm text-[#8b96a8]">Switch direction, change preset, or clear the symbol search.</p>
            </section>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--bn-text-faint)]">
              Bucket Summary
            </p>
            <span className="text-[10px] text-[#657084]">{directionFiltered.length} candidates in current slice</span>
          </div>
          <div className="bn-bucket-grid">
            {(Object.entries(BUCKET_META) as [keyof typeof BUCKET_META, (typeof BUCKET_META)[keyof typeof BUCKET_META]][]).map(
              ([bucket, meta]) => {
                const total = directionFiltered.length || 1;
                const count = counts[bucket];
                const percent = (count / total) * 100;

                return (
                  <div key={bucket} className={`bn-bucket-card rounded-[16px] border p-4 ${meta.wrapperClass}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`bn-mono text-[10px] ${meta.countClass}`}>{meta.icon}</span>
                        <span className="text-[11px] font-medium text-[#9aa6b7]">{meta.label}</span>
                      </div>
                      <span className="bn-mono text-[10px] text-[#657084]">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2.5 flex items-end gap-2">
                      <span className={`bn-mono text-[28px] leading-none ${meta.countClass}`}>{count}</span>
                      <span className="text-[10px] text-[#657084]">of {directionFiltered.length}</span>
                    </div>
                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-[#18202d]">
                      <div className={`h-full rounded-full ${meta.progressClass}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        <RankingsTable
          results={filteredResults}
          sortField={presetDetails.sortField}
          timeframe={timeframe}
          runId={runId}
          onSortFieldChange={() => undefined}
        />

        <AdPlacement placement="dashboard_top" />
        <AdPlacement placement="dashboard_mid" />
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="flex items-center gap-2 py-0.5 text-[10px] text-[#657084]">
      <span className="h-1 w-1 rounded-full bg-[#4b5565]" aria-hidden="true" />
      <span>
        Research / educational use only — not financial advice. Scanner results are derived from persisted run snapshots,
        not live data.
      </span>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111827] px-2.5 py-2">
      <p className="text-[8px] uppercase tracking-[0.12em] text-[#657084]">{label}</p>
      <p className="mt-1 bn-mono text-[11px] text-[#dbe4ef]">{value}</p>
    </div>
  );
}
