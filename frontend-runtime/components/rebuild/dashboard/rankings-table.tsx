import Link from "next/link";

import { DashboardRowFixture } from "@/fixtures/rebuild/dashboard.fixture";
import { buildPreviewQuery, RebuildAdsMode, RebuildPreviewMode, RebuildTimeframe } from "@/lib/rebuild/preview-state";

function bucketClass(bucket: string) {
  if (bucket === "Breakout") return "rb-bucket rb-bucket--breakout";
  if (bucket === "Positioning") return "rb-bucket rb-bucket--positioning";
  if (bucket === "Squeeze") return "rb-bucket rb-bucket--squeeze";
  if (bucket === "Overheat") return "rb-bucket rb-bucket--overheat";
  return "rb-bucket";
}

export function RankingsTable({
  rows,
  timeframe,
  runId,
  ads,
  guest,
  mode = "fixture",
  routeKind = "preview",
}: {
  rows: DashboardRowFixture[];
  timeframe: RebuildTimeframe;
  runId: number;
  ads: RebuildAdsMode;
  guest: boolean;
  mode?: RebuildPreviewMode;
  routeKind?: "preview" | "live";
}) {
  return (
    <div className="rb-table-wrap">
      <div className="rb-table-scroll">
        <table className="rb-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Bucket</th>
              <th>Reason tags</th>
              <th className="rb-table__num">Last</th>
              <th className="rb-table__num">24h %</th>
              <th className="rb-table__num">Volume</th>
              <th className="rb-table__num">Composite</th>
              <th className="rb-table__num">Rank delta</th>
              <th className="rb-table__num">OI</th>
              <th className="rb-table__num">Taker flow</th>
              <th className="rb-table__num">L/S</th>
              <th className="rb-table__num">Funding</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href =
                routeKind === "live"
                  ? `/coin/${row.symbol}?${new URLSearchParams({
                      timeframe,
                      run_id: String(runId),
                    }).toString()}`
                  : `/rebuild-preview/coin/${row.symbol}?${buildPreviewQuery({
                      timeframe,
                      runId,
                      ads,
                      guest,
                      mode,
                    })}`;

              return (
                <tr key={row.symbol}>
                  <td>
                    <Link className="rb-link rb-table__strong" href={href}>
                      {row.symbol}
                    </Link>
                  </td>
                  <td>
                    <span className={bucketClass(row.bucket)}>{row.bucket}</span>
                  </td>
                  <td>
                    <div className="rb-tag-list">
                      {row.reasonTags.map((tag) => (
                        <span className="rb-tag" key={`${row.symbol}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="rb-table__num">{row.last}</td>
                  <td className="rb-table__num">{row.change24h}</td>
                  <td className="rb-table__num">{row.volume}</td>
                  <td className="rb-table__num rb-table__strong">{row.composite}</td>
                  <td className="rb-table__num">{row.rankDelta}</td>
                  <td className="rb-table__num">{row.oiChange}</td>
                  <td className="rb-table__num">{row.takerFlow}</td>
                  <td className="rb-table__num">{row.longShort}</td>
                  <td className="rb-table__num">{row.funding}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
