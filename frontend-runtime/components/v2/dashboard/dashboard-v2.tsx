import Link from "next/link";

import { AppShellV2, GuestStripV2, RunContextStripV2, SectionKickerV2, SiteHeaderV2, StatePanelV2, TrustStripV2 } from "@/components/v2/shell/app-shell-v2";
import { bucketTone, presetTone, scoreTone, v2Theme, valueTone } from "@/components/v2/theme";
import { V2DashboardPreviewModel, V2Direction, V2Preset, V2Timeframe } from "@/components/v2/types";
import { SponsoredSlotV2 } from "@/components/v2/shared/sponsored-slot-v2";

export function DashboardV2({
  model,
  query,
}: {
  model: V2DashboardPreviewModel;
  query: {
    state: string;
    ads: "on" | "off";
    guest: "1" | "0";
    timeframe: V2Timeframe;
    preset: V2Preset;
    mode: V2Direction;
    search: string;
  };
}) {
  const activePreset = model.presets.find((preset) => preset.key === model.activePreset) ?? model.presets[0];
  const filtered = model.rankings;
  const topHighlights = filtered.slice(0, 5);
  const bucketSummary = Object.entries(bucketTone).map(([bucket, tone]) => {
    const count = model.rankings.filter((row) => row.bucket === bucket).length;
    const total = model.rankings.length || 1;
    return { bucket, tone, count, total, percent: Math.round((count / total) * 100) };
  });

  return (
    <AppShellV2>
      <SiteHeaderV2 current="dashboard" guest={model.guest} />
      <RunContextStripV2 ctx={model.runContext} />

      <main className={`${v2Theme.content} flex flex-1 flex-col gap-4 py-3`}>
        <TrustStripV2 copy={model.trustCopy} />
        {model.guest ? <GuestStripV2 copy={model.guestCopy} /> : null}

        <SponsoredSlotV2 slot={model.topSlot} variant="compact" />

        <section>
          <SectionKickerV2>Strategy Preset</SectionKickerV2>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {model.presets.map((preset) => {
              const tone = presetTone[preset.key];
              const active = preset.key === model.activePreset;
              return (
                <Link
                  key={preset.key}
                  href={buildDashboardHref(query, { preset: preset.key })}
                  className={`min-h-[112px] rounded-[16px] border px-4 py-3.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
                    active
                      ? `${tone.activeText}`
                      : "border-[rgba(30,42,58,0.75)] bg-[#0a0f16] text-[#76849a] hover:border-[rgba(42,53,69,1)] hover:text-[#aab5c8]"
                  }`}
                  style={active ? { background: tone.accent, borderColor: tone.activeBorder } : undefined}
                >
                  <div className="flex items-center gap-2 text-[12px] font-medium">
                    <span className="rounded-md border border-current/15 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px]">
                      {tone.badge}
                    </span>
                    {preset.label}
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-[#8b96a8]">{preset.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-[rgba(30,42,58,0.88)]">
                {(["1h", "4h", "24h"] as const).map((value) => (
                  <Link
                    key={value}
                    href={buildDashboardHref(query, { timeframe: value })}
                    className={`border-r border-[rgba(30,42,58,0.88)] px-3.5 py-2 font-mono text-[11px] last:border-r-0 ${
                      query.timeframe === value
                        ? "bg-[#162131] text-[#eef6ff]"
                        : "bg-[#080d14] text-[#6f7b90] hover:bg-[#0d1219] hover:text-[#b5c0d2]"
                    }`}
                  >
                    {value}
                  </Link>
                ))}
              </div>

              <div className="flex overflow-hidden rounded-lg border border-[rgba(30,42,58,0.88)]">
                {(["pump", "dump"] as const).map((value) => (
                  <Link
                    key={value}
                    href={buildDashboardHref(query, { mode: value })}
                    className={`px-3.5 py-2 text-[11px] font-medium ${
                      query.mode === value
                        ? value === "pump"
                          ? "bg-[rgba(73,215,156,0.12)] text-emerald-300"
                          : "bg-[rgba(248,113,113,0.12)] text-rose-300"
                        : "bg-[#080d14] text-[#6f7b90] hover:text-[#b5c0d2]"
                    } ${value === "dump" ? "border-l border-[rgba(30,42,58,0.88)]" : ""}`}
                  >
                    {value === "pump" ? "Pump" : "Dump"}
                  </Link>
                ))}
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(30,42,58,0.6)] bg-[#0f1520] px-3 py-2 text-[10px] text-[#8b96a8]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                {activePreset.label}
              </span>
            </div>

            <div className="relative block w-full xl:max-w-[240px]">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#657084]">
                /
              </span>
              <input
                type="text"
                value={model.searchValue}
                readOnly
                placeholder="Search symbol..."
                className="w-full rounded-lg border border-[rgba(30,42,58,0.88)] bg-[#080d14] py-2 pl-8 pr-3 text-[11px] text-[#cdd5e1] placeholder:text-[#657084] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
              />
            </div>
          </div>
        </section>

        {model.state !== "ready" ? (
          <>
            <StatePanelV2
              title={model.unavailableTitle}
              body={model.unavailableBody}
              ctaLabel="Open ready preview"
              ctaHref="/preview/dashboard-v2?state=ready&ads=on&guest=1"
            />
            <SponsoredSlotV2 slot={model.midSlot} variant="full" />
          </>
        ) : (
          <>
            <section>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-[#8b96a8]">
                <span className="font-medium text-[#dce5ef]">Top Highlights</span>
                <span
                  className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${
                    query.mode === "pump"
                      ? "border-emerald-400/20 bg-[rgba(73,215,156,0.12)] text-emerald-300"
                      : "border-rose-400/20 bg-[rgba(248,113,113,0.12)] text-rose-300"
                  }`}
                >
                  {query.mode}
                </span>
                <span className="text-[10px] text-[#657084]">{activePreset.label}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {topHighlights.map((coin, index) => {
                  const tone = bucketTone[coin.bucket];
                  return (
                    <Link
                      key={coin.symbol}
                      href={`/preview/coin-v2/${coin.symbol}?state=ready&ads=${query.ads}`}
                      className={`relative rounded-[16px] border bg-[#0a0f16] p-4 transition-colors duration-200 hover:border-[rgba(82,213,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
                        index === 0
                          ? "border-cyan-400/28 shadow-[inset_0_0_0_1px_rgba(82,213,255,0.12)]"
                          : "border-[rgba(30,42,58,0.85)]"
                      }`}
                    >
                      <span className={`absolute right-4 top-4 font-mono text-[10px] ${index === 0 ? "text-cyan-300" : "text-[#657084]"}`}>
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold leading-none text-[#eef6ff]">{coin.symbol}</span>
                        <span className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.04em] ${tone.chip}`}>
                          {tone.short}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-[10px] text-[#657084]">Composite</p>
                        <div className="mt-1 flex items-end justify-between gap-3">
                          <span className={`font-mono text-[32px] leading-none ${index === 0 ? "text-cyan-300" : "text-[#e6eef7]"}`}>
                            {coin.composite.toFixed(1)}
                          </span>
                          <span className={`font-mono text-[13px] font-medium ${valueTone(coin.change24h)}`}>
                            {coin.change24h > 0 ? "+" : ""}
                            {coin.change24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <MetricChip label="Heat" value={coin.momentum.toFixed(2)} />
                        <MetricChip label="Vol" value={coin.volumeLabel} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1">
                        {coin.reasonTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-[rgba(42,53,69,0.5)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[#788398]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <SectionKickerV2>Bucket Summary</SectionKickerV2>
                <span className="text-[10px] text-[#657084]">{filtered.length} candidates in current slice</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {bucketSummary.map(({ bucket, tone, count, total, percent }) => (
                  <div key={bucket} className={`rounded-[16px] border p-4 ${tone.panel}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] ${tone.stat}`}>{tone.short}</span>
                        <span className="text-[11px] font-medium text-[#9aa6b7]">{tone.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#657084]">{percent}%</span>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <span className={`font-mono text-[28px] leading-none ${tone.stat}`}>{count}</span>
                      <span className="text-[10px] text-[#657084]">of {total}</span>
                    </div>
                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-[#18202d]">
                      <div className={`h-full rounded-full ${tone.progress}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <SponsoredSlotV2 slot={model.midSlot} variant="full" />

            <section className="rounded-[18px] border border-[rgba(30,42,58,0.82)] bg-[#080d14] p-3 shadow-[0_18px_56px_rgba(0,0,0,0.24)] sm:p-4">
              <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#9aa6b7]">
                  <span className="text-[10px] text-[#657084]">Table</span>
                  <span className="font-medium text-[#dce5ef]">Full Rankings</span>
                  <span className="text-[#657084]">·</span>
                  <span className="text-[10px] text-[#657084]">{filtered.length} results</span>
                </div>
                <span className="text-[10px] text-[#657084]">
                  Sorted by <span className="font-mono text-[#9aa6b7]">{activePreset.sortLabel}</span>
                </span>
              </div>

              <div className="overflow-hidden rounded-[14px] border border-[rgba(30,42,58,0.88)] bg-[#0a0f16]">
                <div className="max-h-[58vh] overflow-auto">
                  <table className="w-full min-w-[1220px] text-[11px]">
                    <thead className="sticky top-0 z-10 bg-[#080d14] text-[9px] uppercase tracking-[0.1em] text-[#657084]">
                      <tr>
                        {["#", "Symbol", "Bucket", "Signals", "Last", "24h %", "Volume", "Comp d", "Rank d", "OI%", "Taker", "L/S", "Comp", "Mom", "Setup", "Pos", "Risk", "Fund"].map(
                          (label) => (
                            <th key={label} className={`px-2.5 py-2.5 ${label === "#" || label === "Symbol" || label === "Bucket" || label === "Signals" ? "text-left" : "text-right"}`}>
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, index) => {
                        const tone = bucketTone[row.bucket];
                        return (
                          <tr
                            key={`${row.symbol}-${index}`}
                            className={`border-t border-[rgba(30,42,58,0.38)] transition-colors hover:bg-[#0f1520] ${
                              index % 2 === 0 ? "bg-[#070c12]" : "bg-[#0a0f16]"
                            }`}
                          >
                            <td className="px-2.5 py-2 font-mono text-[#657084]">{index + 1}</td>
                            <td className="px-2.5 py-2">
                              <Link
                                href={`/preview/coin-v2/${row.symbol}?state=ready&ads=${query.ads}`}
                                className="text-[12px] font-semibold text-[#eef6ff] hover:text-cyan-100"
                              >
                                {row.symbol}
                              </Link>
                            </td>
                            <td className="px-2.5 py-2">
                              <span className={`rounded-md border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.04em] ${tone.chip}`}>
                                {tone.label}
                              </span>
                            </td>
                            <td className="px-2.5 py-2">
                              <div className="flex max-w-[140px] flex-wrap gap-1">
                                {row.reasonTags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="rounded-md border border-[rgba(42,53,69,0.5)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[#788398]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-[#dce5ef]">{row.lastPrice}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.change24h)}`}>
                              {row.change24h > 0 ? "+" : ""}
                              {row.change24h.toFixed(1)}%
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-[#9dd8ff]">{row.volumeLabel}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.compositeDelta)}`}>{signed(row.compositeDelta)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.rankDelta)}`}>{signed(row.rankDelta, 0)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.oiPercent)}`}>{signed(row.oiPercent)}%</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.takerFlow)}`}>{signed(row.takerFlow)}</td>
                            <td className="px-2.5 py-2 text-right font-mono text-[#9aa6b7]">{row.lsRatio.toFixed(2)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${scoreTone(row.composite)}`}>{row.composite.toFixed(1)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${scoreTone(row.momentum)}`}>{row.momentum.toFixed(1)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${scoreTone(row.setup)}`}>{row.setup.toFixed(1)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${scoreTone(row.positioning)}`}>{row.positioning.toFixed(1)}</td>
                            <td className="px-2.5 py-2 text-right font-mono text-[#9aa6b7]">{row.riskPenalty.toFixed(1)}</td>
                            <td className={`px-2.5 py-2 text-right font-mono ${valueTone(row.funding)}`}>{row.funding.toFixed(3)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#657084]">
                <span>{filtered.length} candidates · click any row for detail</span>
                <span className="font-mono">
                  {model.runContext.timeframe} · {model.runContext.runId}
                </span>
              </div>
            </section>
          </>
        )}
      </main>
    </AppShellV2>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111827] px-2.5 py-2">
      <p className="text-[8px] uppercase tracking-[0.12em] text-[#657084]">{label}</p>
      <p className="mt-1 font-mono text-[11px] text-[#dbe4ef]">{value}</p>
    </div>
  );
}

function signed(value: number, digits: number = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function buildDashboardHref(
  current: {
    state: string;
    ads: "on" | "off";
    guest: "1" | "0";
    timeframe: V2Timeframe;
    preset: V2Preset;
    mode: V2Direction;
    search: string;
  },
  next: Partial<{
    state: string;
    ads: "on" | "off";
    guest: "1" | "0";
    timeframe: V2Timeframe;
    preset: V2Preset;
    mode: V2Direction;
    search: string;
  }>,
) {
  const params = new URLSearchParams({
    state: next.state ?? current.state,
    ads: next.ads ?? current.ads,
    guest: next.guest ?? current.guest,
    timeframe: next.timeframe ?? current.timeframe,
    preset: next.preset ?? current.preset,
    mode: next.mode ?? current.mode,
  });

  const search = next.search ?? current.search;
  if (search) params.set("search", search);

  return `/preview/dashboard-v2?${params.toString()}`;
}
