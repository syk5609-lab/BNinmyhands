import Link from "next/link";

import { DashboardFixture, getActivePresetSummary } from "@/fixtures/rebuild/dashboard.fixture";
import { REBUILD_GUEST_STRIP } from "@/fixtures/rebuild/runtime.fixture";
import { RebuildAdsMode, buildPreviewQuery } from "@/lib/rebuild/preview-state";

import { DisclosureFooter } from "@/components/rebuild/common/disclosure-footer";
import { RunContextStrip } from "@/components/rebuild/common/run-context-strip";
import { SponsorSlot } from "@/components/rebuild/common/sponsor-slot";
import { StatePanel } from "@/components/rebuild/common/state-panel";
import { RankingsTable } from "@/components/rebuild/dashboard/rankings-table";
import { RebuildHeader } from "@/components/rebuild/layout/rebuild-header";
import { RebuildShell } from "@/components/rebuild/layout/rebuild-shell";

function bucketClass(bucket: string) {
  if (bucket === "Breakout") return "rb-bucket rb-bucket--breakout";
  if (bucket === "Positioning") return "rb-bucket rb-bucket--positioning";
  if (bucket === "Squeeze") return "rb-bucket rb-bucket--squeeze";
  if (bucket === "Overheat") return "rb-bucket rb-bucket--overheat";
  return "rb-bucket";
}

export function DashboardPage({
  fixture,
  guest,
  ads,
}: {
  fixture: DashboardFixture;
  guest: boolean;
  ads: RebuildAdsMode;
}) {
  const preset = getActivePresetSummary(fixture.activePreset);

  return (
    <RebuildShell>
      <RebuildHeader guest={guest} runId={fixture.runId} surfaceLabel={fixture.surfaceLabel} timeframe={fixture.timeframe} />
      <RunContextStrip
        dataAgeLabel={fixture.dataAgeLabel}
        rowCount={fixture.rowCount}
        runId={fixture.runId}
        runStatus={fixture.runStatus}
        timeframe={fixture.timeframe}
        updatedLabel={fixture.updatedLabel}
      />
      {guest ? <div className="rb-guest-strip">{REBUILD_GUEST_STRIP}</div> : null}
      {fixture.state === "loading" ? (
        <section className="rb-panel">
          <StatePanel
            actionHref={`/rebuild-preview/dashboard?${buildPreviewQuery({
              timeframe: fixture.timeframe,
              runId: fixture.runId,
              ads,
              guest,
            })}`}
            actionLabel="Refresh preview"
            body="최신 persisted run 구조를 기준으로 리빌드 프리뷰 레이아웃을 채우는 중입니다."
            kicker="Dashboard loading"
            title="Scanner workspace is preparing"
          >
            <div className="rb-skeleton-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="rb-skeleton" key={index} />
              ))}
            </div>
          </StatePanel>
        </section>
      ) : null}
      {fixture.state === "unavailable" ? (
        <section className="rb-panel">
          <StatePanel
            actionHref={`/rebuild-preview/dashboard?${buildPreviewQuery({
              timeframe: fixture.timeframe,
              runId: fixture.runId,
              ads,
              guest,
            })}`}
            actionLabel="Open ready preview"
            body={fixture.unavailableBody ?? ""}
            kicker="Dashboard unavailable"
            title={fixture.unavailableTitle ?? "Scanner unavailable"}
          />
        </section>
      ) : null}
      {fixture.state === "ready" ? (
        <div className="rb-dashboard-flow">
          <section className="rb-panel rb-panel--tight rb-dashboard-flow__presets">
            <div className="rb-panel__inner rb-panel__inner--tight">
              <div className="rb-panel__header">
                <div>
                  <p className="rb-mini">Strategy presets</p>
                  <h1 className="rb-title">Workspace-first rankings</h1>
                  <p className="rb-subtitle">
                    프리셋, 상위 후보, 버킷 요약은 모두 랭킹 테이블 스캔을 보조합니다. 메인 작업면은 아래 표입니다.
                  </p>
                </div>
                <span className="rb-note">active preset · {preset.label}</span>
              </div>
              <div className="rb-chip-row rb-chip-row--dashboard">
                {Object.entries({
                  breakout_watch: "Breakout",
                  positioning_build: "Positioning Build",
                  squeeze_watch: "Squeeze Watch",
                  overheat_risk: "Overheat Risk",
                }).map(([id, label]) => (
                  <div className={fixture.activePreset === id ? "rb-chip rb-chip--active" : "rb-chip"} key={id}>
                    <span className="rb-chip__title">{label}</span>
                    <span className="rb-chip__body">{id === fixture.activePreset ? preset.short : "Same-run filters remain fixed in this preview."}</span>
                  </div>
                ))}
              </div>
              <div className="rb-note-block rb-note-block--tight">
                <span className="rb-mini">Active preset explanation</span>
                <p className="rb-copy">{preset.summary}</p>
              </div>
            </div>
          </section>

          <section className="rb-panel rb-panel--tight rb-dashboard-flow__candidates">
            <div className="rb-panel__inner rb-panel__inner--tight">
              <div className="rb-panel__header">
                <div>
                  <p className="rb-mini">Top candidates</p>
                  <h2 className="rb-title">Current leaders in this run</h2>
                </div>
                <span className="rb-note">top 5 · same run context</span>
              </div>
              <div className="rb-card-grid rb-card-grid--dashboard">
                {fixture.topCandidates.map((candidate, index) => {
                  const href = `/rebuild-preview/coin/${candidate.symbol}?${buildPreviewQuery({
                    timeframe: fixture.timeframe,
                    runId: fixture.runId,
                    ads,
                    guest,
                  })}`;

                  return (
                    <Link
                      className={index > 2 ? "rb-card rb-card--compact rb-card--mobile-hidden" : "rb-card rb-card--compact"}
                      href={href}
                      key={candidate.symbol}
                    >
                      <div className="rb-card__top">
                        <h3 className="rb-card__symbol">{candidate.symbol}</h3>
                        <span className={bucketClass(candidate.bucket)}>{candidate.bucket}</span>
                      </div>
                      <p className="rb-subtitle">Composite {candidate.composite}</p>
                      <div className="rb-tag-list">
                        {candidate.reasonTags.slice(0, 2).map((tag) => (
                          <span className="rb-tag" key={`${candidate.symbol}-${tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="rb-dashboard-sponsor rb-dashboard-flow__sponsor-top">
            {ads === "on" ? <SponsorSlot sponsor={fixture.sponsors.top} /> : null}
          </div>

          <section className="rb-summary-grid rb-dashboard-flow__summary">
            {fixture.bucketSummary.map((bucket) => (
              <div className="rb-summary rb-summary--compact" key={bucket.label}>
                <span className="rb-summary__count">{bucket.count}</span>
                <span className="rb-summary__share">{bucket.share}</span>
                <span className="rb-subtitle">{bucket.label} candidates</span>
              </div>
            ))}
          </section>

          <section className="rb-control-row rb-dashboard-flow__controls">
            <div className="rb-control rb-control--compact">
              <span className="rb-control__label">Timeframe</span>
              <span className="rb-control__value">{fixture.timeframe}</span>
            </div>
            <div className="rb-control rb-control--compact">
              <span className="rb-control__label">Bucket filter</span>
              <span className="rb-control__value">All buckets</span>
            </div>
            <div className="rb-control rb-control--compact">
              <span className="rb-control__label">Sort</span>
              <span className="rb-control__value">Composite desc</span>
            </div>
            <div className="rb-control rb-control--compact">
              <span className="rb-control__label">Symbol search</span>
              <span className="rb-control__value">Type to narrow</span>
            </div>
          </section>

          <section className="rb-panel rb-panel--tight rb-dashboard-flow__rankings">
            <div className="rb-panel__inner rb-panel__inner--tight">
              <div className="rb-panel__header">
                <div>
                  <p className="rb-mini">Full rankings</p>
                  <h2 className="rb-title">Main workspace table</h2>
                </div>
                <span className="rb-note">
                  {fixture.rowCount} rows · run {fixture.runId}
                </span>
              </div>
            </div>
            <RankingsTable ads={ads} guest={guest} rows={fixture.rows} runId={fixture.runId} timeframe={fixture.timeframe} />
          </section>

          <div className="rb-dashboard-sponsor rb-dashboard-flow__sponsor-mid">
            {ads === "on" ? <SponsorSlot sponsor={fixture.sponsors.mid} /> : null}
          </div>
        </div>
      ) : null}
      <DisclosureFooter />
    </RebuildShell>
  );
}
