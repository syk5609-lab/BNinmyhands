import { CoinDetailV2 } from "@/components/v2/detail/coin-detail-v2";
import { buildDetailPreviewModel } from "@/fixtures/v2/detail.fixture";

function parseState(input?: string) {
  return input === "loading" || input === "unavailable" ? input : "ready";
}

export default async function CoinDetailV2PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ state?: string; ads?: string }>;
}) {
  const { symbol } = await params;
  const query = await searchParams;
  const model = buildDetailPreviewModel({
    state: parseState(query.state),
    adsOn: query.ads === "off" ? false : true,
    symbol: symbol.toUpperCase(),
  });

  return <CoinDetailV2 model={model} />;
}
