import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchAssetHistory, fetchAssetLatest } from "@/lib/api/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

function buildReasonSummary(row: Awaited<ReturnType<typeof fetchAssetLatest>>["row"]): string {
  const reasons: string[] = [...row.reason_tags];
  if (row.rank_change !== null && row.rank_change > 0) reasons.push("improving rank");
  if ((row.composite_delta ?? 0) > 0) reasons.push("composite improving");
  if ((row.setup_delta ?? 0) > 0) reasons.push("setup strengthening");
  if ((row.positioning_delta ?? 0) > 0) reasons.push("positioning strengthening");
  if (reasons.length === 0) return "Detected by relative scan ranking and current feature blend.";
  return `Detected due to ${Array.from(new Set(reasons)).slice(0, 6).join(", ")}.`;
}

export default async function CoinDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const [latest, history] = await Promise.all([fetchAssetLatest(symbol), fetchAssetHistory(symbol, 120)]);
  const row = latest.row;

  return (
    <main className="mx-auto max-w-[1500px] space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">{latest.symbol} Candidate Detail</h1>
        <Link href="/" className="text-sm text-emerald-300 hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Composite", row.composite_score.toFixed(2)],
          ["Momentum", row.momentum_score.toFixed(2)],
          ["Setup", row.setup_score.toFixed(2)],
          ["Positioning", row.positioning_score.toFixed(2)],
          ["Data Quality", row.data_quality_score.toFixed(2)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="text-xs text-zinc-400">{label}</CardHeader>
            <CardContent className="text-lg font-semibold text-zinc-100">{value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Latest + Delta Metrics</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm text-zinc-300 md:grid-cols-3">
            <p><span className="text-zinc-500">Bucket:</span> {row.signal_bucket}</p>
            <p><span className="text-zinc-500">Last:</span> {formatPrice(row.last_price)}</p>
            <p><span className="text-zinc-500">24h Change:</span> {formatPercent(row.price_change_percent_24h)}</p>
            <p><span className="text-zinc-500">Volume:</span> {formatCompactNumber(row.quote_volume_24h)}</p>
            <p><span className="text-zinc-500">Prev Rank:</span> {row.previous_rank ?? "-"}</p>
            <p><span className="text-zinc-500">Rank Δ:</span> {row.rank_change ?? "-"}</p>
            <p><span className="text-zinc-500">Composite Δ:</span> {row.composite_delta?.toFixed(2) ?? "-"}</p>
            <p><span className="text-zinc-500">Setup Δ:</span> {row.setup_delta?.toFixed(2) ?? "-"}</p>
            <p><span className="text-zinc-500">Positioning Δ:</span> {row.positioning_delta?.toFixed(2) ?? "-"}</p>
            <p><span className="text-zinc-500">OI Change:</span> {row.oi_change_percent_recent?.toFixed(2) ?? "-"}</p>
            <p><span className="text-zinc-500">Taker Flow:</span> {row.taker_net_flow_recent?.toFixed(2) ?? "-"}</p>
            <p><span className="text-zinc-500">L/S:</span> {row.long_short_ratio_recent?.toFixed(3) ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Why this coin</h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <p>{buildReasonSummary(row)}</p>
            <p><span className="text-zinc-500">Reason tags:</span> {row.reason_tags.join(", ") || "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-100">Recent History (compact)</h2>
        </CardHeader>
        <CardContent>
          <div className="max-h-[55vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-950 text-xs text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-right">Last</th>
                  <th className="px-3 py-2 text-right">Comp</th>
                  <th className="px-3 py-2 text-right">Setup</th>
                  <th className="px-3 py-2 text-right">Pos</th>
                  <th className="px-3 py-2 text-right">OI%</th>
                  <th className="px-3 py-2 text-right">Flow</th>
                  <th className="px-3 py-2 text-right">L/S</th>
                  <th className="px-3 py-2 text-right">Risk</th>
                </tr>
              </thead>
              <tbody>
                {history.points.map((point) => (
                  <tr key={`${point.ts}-${point.last_price}`} className="border-t border-zinc-800">
                    <td className="px-3 py-2 text-zinc-300">{new Date(point.ts).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{formatPrice(point.last_price)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.composite_score.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.setup_score.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.positioning_score.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.oi_change_percent_recent?.toFixed(2) ?? "-"}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.taker_net_flow_recent?.toFixed(1) ?? "-"}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.long_short_ratio_recent?.toFixed(3) ?? "-"}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.risk_penalty.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
