import { DashboardPage } from "@/components/rebuild/dashboard/dashboard-page";
import { getDashboardFixture } from "@/fixtures/rebuild/dashboard.fixture";
import { parsePreviewParams } from "@/lib/rebuild/preview-state";

export default async function RebuildDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parsePreviewParams(await searchParams);
  const fixture = getDashboardFixture(params.timeframe, params.state);

  return <DashboardPage ads={params.ads} fixture={fixture} guest={params.guest} />;
}
