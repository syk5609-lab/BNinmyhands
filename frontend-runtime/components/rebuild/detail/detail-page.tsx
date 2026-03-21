import Link from "next/link";

import { DetailFixture } from "@/fixtures/rebuild/detail.fixture";
import { RebuildAdsMode, buildPreviewQuery } from "@/lib/rebuild/preview-state";

import { DisclosureFooter } from "@/components/rebuild/common/disclosure-footer";
import { RunContextStrip } from "@/components/rebuild/common/run-context-strip";
import { SponsorSlot } from "@/components/rebuild/common/sponsor-slot";
import { StatePanel } from "@/components/rebuild/common/state-panel";
import { DiscussionPanel } from "@/components/rebuild/detail/discussion-panel";
import { RebuildHeader } from "@/components/rebuild/layout/rebuild-header";
import { RebuildShell } from "@/components/rebuild/layout/rebuild-shell";

export function DetailPage({
  fixture,
  guest,
  ads,
}: {
  fixture: DetailFixture;
  guest: boolean;
  ads: RebuildAdsMode;
}) {
  const dashboardHref = `/rebuild-preview/dashboard?${buildPreviewQuery({
    timeframe: fixture.timeframe,
    runId: fixture.runId,
    ads,
    guest,
  })}`;

  return (
    <RebuildShell>
      <RebuildHeader guest={guest} runId={fixture.runId} surfaceLabel={fixture.surfaceLabel} timeframe={fixture.timeframe} />
      <RunContextStrip
        dataAgeLabel={fixture.dataAgeLabel}
        runId={fixture.runId}
        runStatus={fixture.runStatus}
        timeframe={fixture.timeframe}
        updatedLabel={fixture.updatedLabel}
      />

      {fixture.state === "unavailable" ? (
        <>
          <section className="rb-panel">
            <StatePanel
              actionHref={dashboardHref}
              actionLabel="Back to dashboard"
              body={fixture.unavailableBody ?? ""}
              kicker="Detail unavailable"
              title={fixture.unavailableTitle ?? "Detail unavailable"}
            />
          </section>
          <DisclosureFooter />
        </>
      ) : (
        <>
          <section className="rb-panel">
            <div className="rb-panel__inner">
              <div className="rb-hero">
                <div className="rb-hero__lead">
                  <Link className="rb-back-link" href={dashboardHref}>
                    Back to dashboard
                  </Link>
                  <div className="rb-card__top">
                    <h1 className="rb-hero__symbol">{fixture.symbol}</h1>
                    <span className="rb-bucket rb-bucket--breakout">{fixture.bucket}</span>
                  </div>
                  <p className="rb-hero__summary">{fixture.heroSummary}</p>
                  <div className="rb-tag-list">
                    {fixture.whyTags.map((tag) => (
                      <span className="rb-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rb-stat-row">
                  {fixture.heroStats.map((stat) => (
                    <div className="rb-stat" key={stat.label}>
                      <span className="rb-stat__label">{stat.label}</span>
                      <span
                        className={
                          stat.tone === "positive"
                            ? "rb-stat__value rb-positive"
                            : stat.tone === "negative"
                              ? "rb-stat__value rb-negative"
                              : "rb-stat__value"
                        }
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rb-score-grid">
            {fixture.scores.map((score) => (
              <div className="rb-score" key={score.label}>
                <span className="rb-score__label">{score.label}</span>
                <span className="rb-score__value">{score.value}</span>
              </div>
            ))}
          </section>

          <section className="rb-detail-grid">
            <div className="rb-panel">
              <div className="rb-panel__inner">
                <div className="rb-panel__header">
                  <div>
                    <p className="rb-mini">Latest + delta</p>
                    <h2 className="rb-title">Current context in this run</h2>
                  </div>
                </div>
                <div className="rb-metric-grid">
                  {fixture.latestMetrics.map((metric) => (
                    <div className="rb-metric" key={metric.label}>
                      <span className="rb-metric__label">{metric.label}</span>
                      <span className="rb-metric__value">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rb-panel">
              <div className="rb-panel__inner">
                <div className="rb-panel__header">
                  <div>
                    <p className="rb-mini">Why this coin</p>
                    <h2 className="rb-title">Surfaced in the same run</h2>
                  </div>
                </div>
                <p className="rb-copy">{fixture.whyBody}</p>
              </div>
            </div>
          </section>

          <section className="rb-detail-grid">
            <div className="rb-panel">
              <div className="rb-panel__inner">
                <div className="rb-panel__header">
                  <div>
                    <p className="rb-mini">Funding context</p>
                    <h2 className="rb-title">Interpret funding as explanation</h2>
                  </div>
                  <span className="rb-note">run {fixture.runId}</span>
                </div>
                <div className="rb-funding-grid">
                  <div className="rb-metric">
                    <span className="rb-metric__label">Latest funding</span>
                    <span className="rb-metric__value">{fixture.funding.latest}</span>
                  </div>
                  <div className="rb-metric">
                    <span className="rb-metric__label">Absolute funding</span>
                    <span className="rb-metric__value">{fixture.funding.absolute}</span>
                  </div>
                  <div className="rb-metric">
                    <span className="rb-metric__label">Bias</span>
                    <span className="rb-metric__value">{fixture.funding.bias}</span>
                  </div>
                </div>
                <div className="rb-panel rb-panel--soft">
                  <div className="rb-panel__inner">
                    <p className="rb-mini">Interpretation</p>
                    <p className="rb-copy">{fixture.funding.interpretation}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rb-history-card">
              <div className="rb-history-card__header">
                <p className="rb-mini">Recent history</p>
                <h2 className="rb-title">Compact same-run snapshots</h2>
              </div>
              <div className="rb-history-card__body">
                {fixture.history.map((point) => (
                  <div className="rb-history-row" key={point.ts}>
                    <div className="rb-history-row__top">
                      <span className="rb-table__strong">{point.ts}</span>
                      <span className="rb-mini">last {point.last}</span>
                    </div>
                    <div className="rb-history-grid">
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">Composite</span>
                        <span className="rb-table__strong">{point.composite}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">Momentum</span>
                        <span>{point.momentum}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">Setup</span>
                        <span>{point.setup}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">Positioning</span>
                        <span>{point.positioning}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">OI</span>
                        <span>{point.oiChange}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">Taker flow</span>
                        <span>{point.takerFlow}</span>
                      </div>
                      <div className="rb-history-cell">
                        <span className="rb-metric__label">L/S</span>
                        <span>{point.longShort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <DiscussionPanel guest={guest} posts={fixture.discussion.posts} title={fixture.discussion.title} />
          <div>{ads === "on" ? <SponsorSlot sponsor={fixture.sponsor} /> : null}</div>
          <DisclosureFooter />
        </>
      )}
    </RebuildShell>
  );
}
