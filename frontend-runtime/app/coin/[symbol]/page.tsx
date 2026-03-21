import "@/components/rebuild/foundation/rebuild-tokens.css";

import { RuntimeDetailPreview } from "@/components/rebuild/detail/runtime-detail-preview";

import { ScannerTimeframe } from "@/lib/types/scanner";

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

  return <RuntimeDetailPreview routeKind="live" runId={runId} symbol={parsedSymbol || "UNKNOWN"} timeframe={timeframe ?? "1h"} />;
}
