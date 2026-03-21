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

export function RankingsTable({
  results,
  sortField,
  timeframe,
  runId,
  onSortFieldChange,
}: {
  results: SymbolScanResult[];
  sortField: ScoreSortField;
  timeframe: "1h" | "4h" | "24h";
  runId: number;
  onSortFieldChange: (field: ScoreSortField) => void;
}) {
  return (
    <section>
      <div className="mb-2.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[color:var(--bn-text-muted)]">
          <span className="text-[10px] text-[color:var(--bn-text-faint)]">[]</span>
          <span className="font-medium">Full Rankings</span>
          <span className="text-[color:var(--bn-text-faint)]">·</span>
          <span className="text-[10px] text-[color:var(--bn-text-faint)]">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[color:var(--bn-text-faint)]">
          <label className="flex items-center gap-2">
            <span>Sorted by</span>
            <select
              className="rounded-lg border border-[color:var(--bn-border)] bg-[#080d14] px-3 py-1.5 text-[11px] text-[var(--bn-text)] outline-none transition-colors focus:border-cyan-400/20"
              value={sortField}
              onChange={(event) => onSortFieldChange(event.target.value as ScoreSortField)}
            >
              <option value="composite_score">Composite</option>
              <option value="momentum_score">Momentum</option>
              <option value="setup_score">Setup</option>
              <option value="positioning_score">Positioning</option>
            </select>
          </label>

          <span className="bn-mono">
            {timeframe} · {runId}
          </span>
        </div>
      </div>

      {!results.length ? (
        <div className="rounded-lg border border-dashed border-[color:var(--bn-border)] bg-[#0a0f16] px-5 py-8 text-center">
          <p className="text-sm font-medium text-[var(--bn-text-strong)]">No candidates match the current filters.</p>
          <p className="mt-1.5 text-sm text-[color:var(--bn-text-muted)]">
            Try widening the bucket filter, changing the preset, or clearing the symbol search.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-[color:var(--bn-border)] bg-[#0a0f16]">
            <div className="max-h-[68vh] overflow-auto bn-scrollbar">
              <table className="w-full min-w-[1220px] text-[11px]">
                <thead className="sticky top-0 z-10 bg-[#080d14] text-[9px] uppercase tracking-[0.08em] text-[color:var(--bn-text-faint)]">
                  <tr>
                    <th className="px-2.5 py-2.5 text-left">#</th>
                    <th className="px-2.5 py-2.5 text-left">Symbol</th>
                    <th className="px-2.5 py-2.5 text-left">Bucket</th>
                    <th className="px-2.5 py-2.5 text-left">Signals</th>
                    <th className="border-l border-[color:var(--bn-border-soft)] px-2.5 py-2.5 text-right">Last</th>
                    <th className="px-2.5 py-2.5 text-right">24h %</th>
                    <th className="px-2.5 py-2.5 text-right">Vol</th>
                    <th className="border-l border-[color:var(--bn-border-soft)] px-2.5 py-2.5 text-right">Comp d</th>
                    <th className="px-2.5 py-2.5 text-right">Rank d</th>
                    <th className="px-2.5 py-2.5 text-right">OI%</th>
                    <th className="px-2.5 py-2.5 text-right">Taker</th>
                    <th className="px-2.5 py-2.5 text-right">L/S</th>
                    <th className="border-l border-[color:var(--bn-border-soft)] px-2.5 py-2.5 text-right">Comp</th>
                    <th className="px-2.5 py-2.5 text-right">Mom</th>
                    <th className="px-2.5 py-2.5 text-right">Setup</th>
                    <th className="px-2.5 py-2.5 text-right">Pos</th>
                    <th className="border-l border-[color:var(--bn-border-soft)] px-2.5 py-2.5 text-right">Risk</th>
                    <th className="px-2.5 py-2.5 text-right">Heat</th>
                    <th className="w-7 px-1.5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => {
                    const bucket = BUCKET_META[row.signal_bucket];

                    return (
                      <tr
                        key={`${row.symbol}-${index}`}
                        className={`group border-t border-[color:var(--bn-border-soft)] transition-colors hover:bg-[#0f1520] ${
                          index % 2 === 0 ? "bg-[#070c12]" : "bg-[#0a0f16]"
                        }`}
                      >
                        <td className="bn-mono px-2.5 py-2 text-[10px] text-[color:var(--bn-text-faint)]">{index + 1}</td>
                        <td className="px-2.5 py-2">
                          <Link
                            href={`/coin/${row.symbol}?timeframe=${timeframe}&run_id=${runId}`}
                            className="text-[12px] font-semibold text-[var(--bn-text-strong)] transition-colors hover:text-cyan-100"
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
                          <div className="flex max-w-[136px] flex-wrap gap-1">
                            {row.reason_tags.length ? (
                              <>
                                {row.reason_tags.slice(0, 2).map((reason) => (
                                  <span
                                    key={reason}
                                    className="rounded border border-[color:var(--bn-border-soft)] bg-[#111827] px-1.5 py-0.5 text-[8px] text-[color:var(--bn-text-faint)]"
                                  >
                                    {reason}
                                  </span>
                                ))}
                                {row.reason_tags.length > 2 ? (
                                  <span className="text-[8px] text-[color:var(--bn-text-faint)]">+{row.reason_tags.length - 2}</span>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-[9px] text-[color:var(--bn-text-faint)]">No tags</span>
                            )}
                          </div>
                        </td>
                        <td className="bn-mono border-l border-[color:var(--bn-border-soft)] px-2.5 py-2 text-right text-[var(--bn-text)]">
                          {formatPrice(row.last_price)}
                        </td>
                        <td
                          className={`bn-mono px-2.5 py-2 text-right ${
                            row.price_change_percent_24h >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {formatPercent(row.price_change_percent_24h)}
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right text-[color:var(--bn-text-muted)]">
                          {formatCompactNumber(row.quote_volume_24h)}
                        </td>
                        <td className="bn-mono border-l border-[color:var(--bn-border-soft)] px-2.5 py-2 text-right">
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
                        <td className="bn-mono px-2.5 py-2 text-right text-[color:var(--bn-text-muted)]">
                          {row.long_short_ratio_recent?.toFixed(3) ?? "-"}
                        </td>
                        <td className="border-l border-[color:var(--bn-border-soft)] px-2.5 py-2 text-right">
                          <ScorePill value={row.composite_score} tone="cyan" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.momentum_score} tone="neutral" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.setup_score} tone="neutral" />
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <ScorePill value={row.positioning_score} tone="neutral" />
                        </td>
                        <td className="bn-mono border-l border-[color:var(--bn-border-soft)] px-2.5 py-2 text-right">
                          <span className={row.risk_penalty >= 25 ? "text-rose-300" : "text-[color:var(--bn-text-muted)]"}>
                            {row.risk_penalty.toFixed(2)}
                          </span>
                        </td>
                        <td className="bn-mono px-2.5 py-2 text-right">
                          <span className={row.heat_score >= 0.8 ? "text-cyan-100" : "text-[var(--bn-text)]"}>
                            {row.heat_score.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-1.5 py-2 text-right">
                          <Link
                            href={`/coin/${row.symbol}?timeframe=${timeframe}&run_id=${runId}`}
                            className="inline-flex text-[color:var(--bn-text-faint)] transition-colors group-hover:text-[var(--bn-text)]"
                            aria-label={`Open ${row.symbol} detail`}
                          >
                            <span aria-hidden="true">{">"}</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[color:var(--bn-text-faint)]">
            <span>Click any row to open the persisted run detail view.</span>
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
    <section className="rounded-lg border border-[color:var(--bn-border)] bg-[#0a0f16] p-5">
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
    return <span className="text-[color:var(--bn-text-faint)]">-</span>;
  }

  const tone =
    value > 0 ? "text-emerald-300" : value < 0 ? "text-rose-300" : "text-[color:var(--bn-text-faint)]";

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
          : "border-[color:var(--bn-border-soft)] bg-[#111827] text-[var(--bn-text)]";

  return <span className={`bn-mono rounded border px-1.5 py-0.5 text-[10px] ${className}`}>{value.toFixed(2)}</span>;
}
