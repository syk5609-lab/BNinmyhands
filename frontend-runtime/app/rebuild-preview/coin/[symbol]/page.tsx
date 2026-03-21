import { DetailPage } from "@/components/rebuild/detail/detail-page";
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
  const fixture = getDetailFixture({
    symbol,
    timeframe: previewParams.timeframe,
    runId: previewParams.runId,
    state: previewParams.state,
  });

  return <DetailPage ads={previewParams.ads} fixture={fixture} guest={previewParams.guest} />;
}
