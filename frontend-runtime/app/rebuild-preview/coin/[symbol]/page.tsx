import { DetailPage } from "@/components/rebuild/detail/detail-page";
import { RuntimeDetailPreview } from "@/components/rebuild/detail/runtime-detail-preview";
import { getDetailFixture } from "@/fixtures/rebuild/detail.fixture";
import { parsePreviewParams } from "@/lib/rebuild/preview-state";

export default async function RebuildCoinDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { symbol } = await params;
  const previewParams = parsePreviewParams(await searchParams);
  if (previewParams.mode === "runtime") {
    return <RuntimeDetailPreview runId={previewParams.runId} symbol={symbol} timeframe={previewParams.timeframe} />;
  }

  const fixture = getDetailFixture({
    symbol,
    timeframe: previewParams.timeframe,
    runId: previewParams.runId ?? 101,
    state: previewParams.state,
  });

  return <DetailPage ads={previewParams.ads} fixture={fixture} guest={previewParams.guest} mode="fixture" />;
}
