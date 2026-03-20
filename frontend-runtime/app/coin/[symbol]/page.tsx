import Link from "next/link";

import { AdPlacement } from "@/components/ads/ad-placement";
import { DiscussionBlock } from "@/components/community/discussion-block";
import { AppHeader } from "@/components/layout/app-header";
import { TrustNote } from "@/components/trust/trust-note";
import { fetchAssetHistory, fetchAssetLatest } from "@/lib/api/scanner";
import { ScannerTimeframe, SignalBucket } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

const BUCKET_META: Record<
  SignalBucket,
  { label: string; chipClass: string; accentClass: string }
> = {
  breakout_watch: {
    label: "Breakout",
    chipClass: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
    accentClass: "text-cyan-100",
  },
  positioning_build: {
    label: "Positioning",
    chipClass: "border-violet-400/20 bg-violet-400/10 text-violet-100",
    accentClass: "text-violet-100",
  },
  squeeze_watch: {
    label: "Squeeze",
    chipClass: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    accentClass: "text-amber-100",
  },
  overheat_risk: {
    label: "Overheat",
    chipClass: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    accentClass: "text-rose-100",
  },
};

function buildReasonSummary(row: Awaited<ReturnType<typeof fetchAssetLatest>>["row"]): string {
  const reasons: string[] = [...row.reason_tags];
  if (row.rank_change !== null && row.rank_change > 0) reasons.push("improving rank");
  if ((row.composite_delta ?? 0) > 0) reasons.push("composite improving");
  if ((row.setup_delta ?? 0) > 0) reasons.push("setup strengthening");
  if ((row.positioning_delta ?? 0) > 0) reasons.push("positioning strengthening");
  if (reasons.length === 0) return "Detected by relative scan ranking and the current feature blend.";
  return `Detected due to ${Array.from(new Set(reasons)).slice(0, 6).join(", ")}.`;
}

function parseTimeframe(input: string | undefined): ScannerTimeframe | null {
  if (input === "1h" || input === "4h" || input === "24h") {
    return input;
  }
  return null;
}

function parseRunId(input: string | undefined): number | null {
  if (!input) return null;
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  const asInt = Math.trunc(n);
  if (asInt <= 0 || asInt !== n) return null;
  return asInt;
}

function formatFunding(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(8);
}

function formatDataAge(isoTs: string): string {
  const ts = new Date(isoTs).getTime();
  if (!Number.isFinite(ts)) return "age unavailable";
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getFundingInterpretation(bias: string | null | undefined): string {
  if (bias === "positive") return "Crowded long risk is elevated, so continuation needs follow-through quality.";
  if (bias === "negative") return "Crowded short positioning raises squeeze potential if momentum keeps improving.";
  if (bias === "neutral") return "Funding is not especially stretched inside this persisted snapshot.";
  return "Funding data is not available for this snapshot.";
}

function UnavailableState({ symbol }: { symbol: string }) {
  return (
    <main className="mx-auto max-w-[1700px] px-4 py-8">
      <section className="mx-auto max-w-3xl bn-panel p-6 text-center">
        <p className="bn-kicker">Coin detail unavailable</p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--bn-text-strong)]">Unable to load {symbol}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color:var(--bn-text-muted)]">
          Coin detail requires a valid symbol, timeframe, and run_id in the URL so the page can preserve the same run
          context you launched from on the dashboard.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-cyan-400/18 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/14"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function CoinDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ timeframe?: string; run_id?: string }>;
}) {
  const { symbol } = await params;
  const parsedSymbol = symbol?.toUpperCase().trim();
  const { timeframe: timeframeParam, run_id: runIdParam } = await searchParams;
  const timeframe = parseTimeframe(timeframeParam);
  const runId = parseRunId(runIdParam);

  if (!parsedSymbol || !timeframe || !runId) {
    return <UnavailableState symbol={parsedSymbol || "unknown symbol"} />;
  }

  try {
    const [latest, history] = await Promise.all([
      fetchAssetLatest(parsedSymbol, timeframe, runId),
      fetchAssetHistory(parsedSymbol, timeframe, runId, 120),
    ]);
    const row = latest.row;
    const bucketMeta = BUCKET_META[row.signal_bucket];
    const fundingRow = row as typeof row & {
      funding_rate_latest?: number | null;
      funding_rate_abs?: number | null;
      funding_bias?: string | null;
    };
    const hasFunding =
      fundingRow.funding_rate_latest !== null &&
      fundingRow.funding_rate_latest !== undefined &&
      fundingRow.funding_rate_abs !== null &&
      fundingRow.funding_rate_abs !== undefined &&
      fundingRow.funding_bias !== null &&
      fundingRow.funding_bias !== undefined;

    return (
      <>
        <AppHeader
          timeframe={timeframe}
          runId={runId}
          latestRunAt={latest.ts}
          dataAgeLabel={formatDataAge(latest.ts)}
        />

        <main className="mx-auto max-w-[1700px] space-y-5 px-4 py-5">
          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="bn-panel p-5 sm:p-6">
              <Link
                href={`/?timeframe=${timeframe}`}
                className="inline-flex rounded-full border border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.82)] px-3 py-1.5 text-[11px] font-medium text-[color:var(--bn-text-muted)] transition hover:text-[var(--bn-text-strong)]"
              >
                Back to dashboard
              </Link>

              <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="bn-kicker">Candidate detail</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--bn-text-strong)]">
                      {latest.symbol}
                    </h1>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${bucketMeta.chipClass}`}>
                      {bucketMeta.label}
                    </span>
                    <span className="bn-mono rounded-md border border-[color:var(--bn-border-soft)] bg-[rgba(17,24,39,0.78)] px-2 py-1 text-[10px] text-[color:var(--bn-text-faint)]">
                      {timeframe}
                    </span>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-6 text-[color:var(--bn-text-muted)]">
                    {buildReasonSummary(row)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {row.reason_tags.length ? (
                      row.reason_tags.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-md border border-[color:var(--bn-border-soft)] bg-[rgba(17,24,39,0.78)] px-2 py-1 text-[10px] text-[color:var(--bn-text-muted)]"
                        >
                          {reason}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[color:var(--bn-text-faint)]">No reason tags</span>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[360px] xl:grid-cols-1">
                  <HeroStat label="Last price" value={formatPrice(row.last_price)} />
                  <HeroStat
                    label="24h change"
                    value={formatPercent(row.price_change_percent_24h)}
                    tone={row.price_change_percent_24h >= 0 ? "positive" : "negative"}
                  />
                  <HeroStat label="24h volume" value={formatCompactNumber(row.quote_volume_24h)} />
                </div>
              </div>
            </div>

            <TrustNote
              title="Trust framing"
              body="Use current scores, funding, history, discussion, and sponsored placements as context for review. This page preserves the same persisted run context as the dashboard so you can inspect why a symbol ranked where it did."
              className="h-full"
            />
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <ScoreCard label="Composite" value={row.composite_score.toFixed(2)} tone="cyan" />
            <ScoreCard label="Momentum" value={row.momentum_score.toFixed(2)} tone="neutral" />
            <ScoreCard label="Setup" value={row.setup_score.toFixed(2)} tone="neutral" />
            <ScoreCard label="Positioning" value={row.positioning_score.toFixed(2)} tone="neutral" />
            <ScoreCard label="Data quality" value={row.data_quality_score.toFixed(2)} tone="neutral" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="bn-panel p-5">
              <p className="bn-kicker">Latest and delta context</p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Bucket" value={bucketMeta.label} accentClass={bucketMeta.accentClass} />
                <InfoRow label="Previous rank" value={row.previous_rank?.toString() ?? "-"} />
                <InfoRow label="Rank delta" value={formatSigned(row.rank_change, 0)} />
                <InfoRow label="Composite delta" value={formatSigned(row.composite_delta)} />
                <InfoRow label="Setup delta" value={formatSigned(row.setup_delta)} />
                <InfoRow label="Positioning delta" value={formatSigned(row.positioning_delta)} />
                <InfoRow label="OI change" value={formatSigned(row.oi_change_percent_recent, 2, "%")} />
                <InfoRow label="Taker flow" value={formatSigned(row.taker_net_flow_recent)} />
                <InfoRow label="L/S ratio" value={row.long_short_ratio_recent?.toFixed(3) ?? "-"} />
              </div>
            </div>

            <div className="bn-panel p-5">
              <p className="bn-kicker">Why this coin</p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--bn-text-muted)]">{buildReasonSummary(row)}</p>
              <div className="mt-4 rounded-[18px] border border-[color:var(--bn-border-soft)] bg-[rgba(16,23,34,0.8)] px-4 py-4">
                <p className="text-[11px] font-medium text-[var(--bn-text-strong)]">Signal stack</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--bn-text-muted)]">
                  The scanner surfaced {latest.symbol} in the {bucketMeta.label.toLowerCase()} bucket using the
                  persisted mix of composite, setup, positioning, and risk inputs for run {runId}.
                </p>
              </div>
            </div>
          </section>

          <section className="bn-panel p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="bn-kicker">Funding context</p>
                <p className="mt-2 text-sm text-[color:var(--bn-text-muted)]">
                  Funding helps frame whether the current setup is getting crowded or still relatively balanced.
                </p>
              </div>
              <span className="bn-mono text-[11px] text-[color:var(--bn-text-faint)]">
                persisted run {runId}
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[18px] border border-[color:var(--bn-border)] bg-[rgba(16,23,34,0.8)] px-4 py-4">
                {hasFunding ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <InfoRow label="Latest funding" value={formatFunding(fundingRow.funding_rate_latest)} />
                    <InfoRow label="Absolute funding" value={formatFunding(fundingRow.funding_rate_abs)} />
                    <InfoRow
                      label="Bias"
                      value={fundingRow.funding_bias ?? "-"}
                      accentClass={
                        fundingRow.funding_bias === "positive"
                          ? "text-rose-100"
                          : fundingRow.funding_bias === "negative"
                            ? "text-cyan-100"
                            : "text-[var(--bn-text-strong)]"
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-[var(--bn-text-strong)]">Funding unavailable</p>
                    <p className="mt-2 text-sm text-[color:var(--bn-text-muted)]">
                      This persisted snapshot did not include funding metrics for the current symbol.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[18px] border border-[color:var(--bn-border-soft)] bg-[rgba(10,15,22,0.72)] px-4 py-4">
                <p className="text-[11px] font-medium text-[var(--bn-text-strong)]">Interpretation</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--bn-text-muted)]">
                  {getFundingInterpretation(fundingRow.funding_bias)}
                </p>
              </div>
            </div>
          </section>

          <section className="bn-panel overflow-hidden">
            <div className="border-b border-[color:var(--bn-border)] px-5 py-4">
              <p className="bn-kicker">Recent history</p>
              <p className="mt-2 text-sm text-[color:var(--bn-text-muted)]">
                Compact persisted snapshots for the current symbol inside this run context.
              </p>
            </div>

            <div className="max-h-[55vh] overflow-auto bn-scrollbar">
              <table className="w-full min-w-[1040px] text-sm">
                <thead className="sticky top-0 z-10 bg-[rgba(8,13,20,0.96)] text-[10px] uppercase tracking-[0.16em] text-[color:var(--bn-text-faint)]">
                  <tr>
                    <th className="px-3 py-3 text-left">Timestamp</th>
                    <th className="px-3 py-3 text-right">Last</th>
                    <th className="px-3 py-3 text-right">Comp</th>
                    <th className="px-3 py-3 text-right">Setup</th>
                    <th className="px-3 py-3 text-right">Pos</th>
                    <th className="px-3 py-3 text-right">OI%</th>
                    <th className="px-3 py-3 text-right">Flow</th>
                    <th className="px-3 py-3 text-right">L/S</th>
                    <th className="px-3 py-3 text-right">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.points.map((point) => (
                    <tr
                      key={`${point.ts}-${point.last_price}`}
                      className="border-t border-[color:var(--bn-border-soft)] bg-[rgba(7,12,18,0.58)]"
                    >
                      <td className="px-3 py-3 text-[color:var(--bn-text-muted)]">
                        {new Date(point.ts).toLocaleString()}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-[var(--bn-text)]">
                        {formatPrice(point.last_price)}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-cyan-100">{point.composite_score.toFixed(2)}</td>
                      <td className="bn-mono px-3 py-3 text-right text-[var(--bn-text)]">{point.setup_score.toFixed(2)}</td>
                      <td className="bn-mono px-3 py-3 text-right text-[var(--bn-text)]">
                        {point.positioning_score.toFixed(2)}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-[color:var(--bn-text-muted)]">
                        {point.oi_change_percent_recent?.toFixed(2) ?? "-"}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-[color:var(--bn-text-muted)]">
                        {point.taker_net_flow_recent?.toFixed(1) ?? "-"}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-[color:var(--bn-text-muted)]">
                        {point.long_short_ratio_recent?.toFixed(3) ?? "-"}
                      </td>
                      <td className="bn-mono px-3 py-3 text-right text-[color:var(--bn-text-muted)]">
                        {point.risk_penalty.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <DiscussionBlock symbol={parsedSymbol} runId={runId} timeframe={timeframe} />
          <AdPlacement placement="detail_bottom" />
        </main>
      </>
    );
  } catch {
    return <UnavailableState symbol={parsedSymbol} />;
  }
}

function HeroStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-100"
      : tone === "negative"
        ? "text-rose-100"
        : "text-[var(--bn-text-strong)]";

  return (
    <div className="rounded-[18px] border border-[color:var(--bn-border-soft)] bg-[rgba(16,23,34,0.8)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--bn-text-faint)]">{label}</p>
      <p className={`mt-2 text-lg font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "neutral";
}) {
  return (
    <div className="bn-panel p-4">
      <p className="bn-kicker">{label}</p>
      <p className={`mt-3 bn-mono text-2xl ${tone === "cyan" ? "text-cyan-100" : "text-[var(--bn-text-strong)]"}`}>
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string;
  accentClass?: string;
}) {
  return (
    <div className="rounded-[16px] border border-[color:var(--bn-border-soft)] bg-[rgba(10,15,22,0.64)] px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--bn-text-faint)]">{label}</p>
      <p className={`mt-2 text-sm font-medium ${accentClass ?? "text-[var(--bn-text-strong)]"}`}>{value}</p>
    </div>
  );
}

function formatSigned(value: number | null, decimals = 2, suffix = ""): string {
  if (value === null) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}${suffix}`;
}
