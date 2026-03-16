import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchAssetHistory, fetchAssetLatest } from "@/lib/api/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

function buildReasonSummary(latest: Awaited<ReturnType<typeof fetchAssetLatest>>["row"]): string {
  const reasons: string[] = [];
  if (latest.composite_score > 1) reasons.push("strong composite score");
  if (latest.momentum_score > 0.8) reasons.push("high momentum");
  if (latest.positioning_score > 0.8) reasons.push("positioning support");
  if ((latest.oi_change_percent_recent ?? 0) > 0) reasons.push("rising OI");
  if ((latest.taker_net_flow_recent ?? 0) > 0) reasons.push("positive taker flow");
  if ((latest.long_short_ratio_recent ?? 1) > 1) reasons.push("long/short skew > 1");
  if (reasons.length === 0) return "Detected primarily by relative ranking versus peers in this timeframe.";
  return `Detected due to ${reasons.join(", ")}.`;
}

export default async function CoinDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const [latest, history] = await Promise.all([fetchAssetLatest(symbol), fetchAssetHistory(symbol, 120)]);
  const reason = buildReasonSummary(latest.row);

  return (
    <main className="mx-auto max-w-[1400px] space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">{latest.symbol} Research Detail</h1>
        <Link href="/" className="text-sm text-emerald-300 hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Composite", latest.row.composite_score.toFixed(2)],
          ["Momentum", latest.row.momentum_score.toFixed(2)],
          ["Setup", latest.row.setup_score.toFixed(2)],
          ["Positioning", latest.row.positioning_score.toFixed(2)],
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
            <h2 className="text-sm font-semibold text-zinc-100">Latest Metrics</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm text-zinc-300 md:grid-cols-3">
            <p>
              <span className="text-zinc-500">Last Price:</span> {formatPrice(latest.row.last_price)}
            </p>
            <p>
              <span className="text-zinc-500">24h Change:</span> {formatPercent(latest.row.price_change_percent_24h)}
            </p>
            <p>
              <span className="text-zinc-500">24h Volume:</span> {formatCompactNumber(latest.row.quote_volume_24h)}
            </p>
            <p>
              <span className="text-zinc-500">OI Change:</span> {latest.row.oi_change_percent_recent?.toFixed(2) ?? "-"}
            </p>
            <p>
              <span className="text-zinc-500">Taker Net Flow:</span> {latest.row.taker_net_flow_recent?.toFixed(2) ?? "-"}
            </p>
            <p>
              <span className="text-zinc-500">Long/Short:</span> {latest.row.long_short_ratio_recent?.toFixed(3) ?? "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Why detected</h2>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">{reason}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-100">Recent History (from /api/assets/{symbol}/history)</h2>
        </CardHeader>
        <CardContent>
          <div className="max-h-[50vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-950 text-xs text-zinc-400">
                <tr>
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-right">Last Price</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right">Momentum</th>
                  <th className="px-3 py-2 text-right">Setup</th>
                </tr>
              </thead>
              <tbody>
                {history.points.map((point) => (
                  <tr key={`${point.ts}-${point.last_price}`} className="border-t border-zinc-800">
                    <td className="px-3 py-2 text-zinc-300">{new Date(point.ts).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{formatPrice(point.last_price)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.composite_score.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.momentum_score.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-zinc-200">{point.setup_score.toFixed(2)}</td>
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
