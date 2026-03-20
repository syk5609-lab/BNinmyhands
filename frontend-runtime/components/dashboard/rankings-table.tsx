"use client";

import Link from "next/link";

import { SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

export type ScoreSortField = "composite_score" | "momentum_score" | "setup_score" | "positioning_score";

const BUCKET_META: Record<
  SymbolScanResult["signal_bucket"],
  { label: string; className: string }
> = {
  breakout_watch: {
    label: "Breakout",
    className: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
  },
  positioning_build: {
    label: "Positioning",
    className: "border-violet-400/18 bg-violet-400/10 text-violet-100",
  },
  squeeze_watch: {
    label: "Squeeze",
    className: "border-amber-400/18 bg-amber-400/10 text-amber-100",
  },
  overheat_risk: {
    label: "Overheat",
    className: "border-rose-400/18 bg-rose-400/10 text-rose-100",
  },
};

const SORT_LABELS: Record<ScoreSortField, string> = {
  composite_score: "composite",
  momentum_score: "momentum",
  setup_score: "setup",
  positioning_score: "positioning",
};

export function RankingsTable({
  results,
  sortField,
  timeframe,
  runId,
}: {
  results: SymbolScanResult[];
  sortField: ScoreSortField;
  timeframe: "1h" | "4h" | "24h";
  runId: number;
  onSortFieldChange?: (field: ScoreSortField) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[#9aa6b7]">
          <span className="text-[10px] text-[#657084]">▣</span>
          <span className="font-medium text-[#dce5ef]">Full Rankings</span>
          <span className="text-[#657084]">·</span>
          <span className="text-[10px] text-[#657084]">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>

        <span className="text-[10px] text-[#657084]">
          Sorted by <span className="bn-mono text-[#9aa6b7]">{SORT_LABELS[sortField]}</span>
        </span>
      </div>

      {!results.length ? (
        <div className="rounded-lg border border-dashed border-[rgba(30,42,58,0.88)] bg-[#0a0f16] px-5 py-8 text-center">
          <p className="text-sm font-medium text-[#eef6ff]">No candidates match the current filters.</p>
          <p className="mt-1.5 text-sm text-[#8b96a8]">Try another preset, direction, or search query.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[rgba(30,42,58,0.88)] bg-[#0a0f16]">
            <div className="overflow-auto bn-scrollbar">
              <table className="w-full min-w-[1220px] text-[11px]">
                <thead className="bg-[#080d14] text-[9px] uppercase tracking-[0.1em] text-[#657084]">
                  <tr>
                    <th className="px-2.5 py-2.5 text-left">#</th>
                    <th className="px-2.5 py-2.5 text-left">Symbol</th>
                    <th className="px-2.5 py-2.5 text-left">Bucket</th>
                    <th className="px-2.5 py-2.5 text-left">Signals</th>
                    <th className="px-2.5 py-2.5 text-right">Last</th>
                    <th className="px-2.5 py-2.5 text-right">24h %</th>
                    <th className="px-2.5 py-2.5 text-right text-cyan-300/80">Volume</th>
                    <th className="px-2.5 py-2.5 text-right text-cyan-300/80">Comp d</th>
                    <th className="px-2.5 py-2.5 text-right">Rank d</th>
                    <th className="px-2.5 py-2.5 text-right">OI%</th>
                    <th className="px-2.5 py-2.5 text-right">Taker</th>
                    <th className="px-2.5 py-2.5 text-right">L/S</th>
                    <th className="px-2.5 py-2.5 text-right text-cyan-300/80">Comp</th>
                    <th className="px-2.5 py-2.5 text-right text-cyan-300/80">Mom</th>
                    <th className="px-2.5 py-2.5 text-right">Setup</th>
                    <th className="px-2.5 py-2.5 text-right">Pos</th>
                    <th className="px-2.5 py-2.5 text-right">Risk</th>
                    <th className="px-2.5 py-2.5 text-right">Heat</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => {
                    const bucket = BUCKET_META[row.signal_bucket];

                    return (
                      <tr
                        key={`${row.symbol}-${index}`}
                        className={`border-t border-[rgba(30,42,58,0.38)] ${
                          index % 2 === 0 ? "bg-[#070c12]" : "bg-[#0a0f16]"
                        }`}
                      >
                        <td className="bn-mono px-2.5 py-2 text-[#657084]">{index + 1}</td>
                        <td className="px-2.5 py-2">
                          <Link
                            href={`/coin/${row.symbol}?timeframe=${timeframe}&run_id=${runId}`}
                            className="text-[12px] font-medium text-[#eef6ff] hover:text-cyan-100"
                          >
                            {row.symbol}
                          </Link>
                        </td>
                        <td className="px-2.5 py-2">
                          <span className={`rounded border px-1.5 py-0.5 text-[8px] font-medium tracking-[0.04em] ${bucket.className}`}>
                            {bucket.label}
                          </span>
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="flex max-w-[140px] flex-wrap gap-1">
                            {row.reason_tags.length ? (
                              row.reason_tags.slice(0, 2).map((reason) => (
                                <span
                                  key={reason}
                                  className="rounded border border-[rgba(42,53,69,0.5)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[#788398]"
                                >
                                  {reason}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] text-[#657084]">No tags</span>
                            )}
                          </div>
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[#dce5ef]">{formatPrice(row.last_price)}</td>
                        <td
                          className={`bn-mono px-2.5 py-2 text-right ${
                            row.price_change_percent_24h >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatPercent(row.price_change_percent_24h)}
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[#9dd8ff]">{formatCompactNumber(row.quote_volume_24h)}</td>
                        <td className="bn-mono px-2.5 py-2 text-right">
                          <SignedMetric value={row.composite_delta} />
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right">
                          <SignedMetric value={row.rank_change} decimals={0} />
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right">
                          <SignedMetric value={row.oi_change_percent_recent} suffix="%" />
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right">
                          <SignedMetric value={row.taker_net_flow_recent} />
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[#9aa6b7]">
                          {row.long_short_ratio_recent?.toFixed(2) ?? "-"}
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.composite_score} tone="cyan" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.momentum_score} tone="cyan" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.setup_score} tone="neutral" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.positioning_score} tone="neutral" />
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[#9aa6b7]">{row.risk_penalty.toFixed(1)}</td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[#9aa6b7]">{row.heat_score.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#657084]">
            <span>{results.length} candidate{results.length === 1 ? "" : "s"} · click any row for detail</span>
            <span className="bn-mono">
              {timeframe} · run {runId}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export function RankingsSkeleton() {
  return (
    <section className="rounded-lg border border-[rgba(30,42,58,0.88)] bg-[#0a0f16] p-5">
      <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="h-9 animate-pulse rounded bg-white/[0.05]" />
        ))}
      </div>
    </section>
  );
}

function SignedMetric({
  value,
  decimals = 2,
  suffix = "",
}: {
  value: number | null;
  decimals?: number;
  suffix?: string;
}) {
  if (value === null) {
    return <span className="text-[#657084]">-</span>;
  }

  const tone = value > 0 ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-[#657084]";

  return (
    <span className={tone}>
      {value > 0 ? "+" : ""}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function ScorePill({ value, tone }: { value: number; tone: "cyan" | "neutral" }) {
  const className =
    tone === "cyan"
      ? "border-cyan-400/18 bg-cyan-400/10 text-cyan-100"
      : value >= 70
        ? "border-emerald-400/18 bg-emerald-400/10 text-emerald-100"
        : value <= 35
          ? "border-rose-400/18 bg-rose-400/10 text-rose-100"
          : "border-[rgba(42,53,69,0.55)] bg-[#111827] text-[#cfd8e4]";

  return <span className={`bn-mono rounded border px-1.5 py-0.5 text-[10px] ${className}`}>{value.toFixed(1)}</span>;
}
