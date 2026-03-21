import Link from "next/link";

import { AppShellV2, RunContextStripV2, SectionKickerV2, SiteHeaderV2, StatePanelV2, TrustStripV2 } from "@/components/v2/shell/app-shell-v2";
import { bucketTone, scoreTone, v2Theme } from "@/components/v2/theme";
import { V2DetailPreviewModel } from "@/components/v2/types";
import { SponsoredSlotV2 } from "@/components/v2/shared/sponsored-slot-v2";

export function CoinDetailV2({ model }: { model: V2DetailPreviewModel }) {
  const bucket = bucketTone[model.bucket];

  return (
    <AppShellV2>
      <SiteHeaderV2 current="detail" guest={true} detailSymbol={model.symbol} />
      <RunContextStripV2 ctx={model.runContext} />

      <main className={`${v2Theme.content} flex flex-1 flex-col gap-5 py-5`}>
        <TrustStripV2 copy={model.trustCopy} />

        {model.state !== "ready" ? (
          <>
            <StatePanelV2
              title={model.unavailableTitle}
              body={model.unavailableBody}
              ctaLabel="Back to dashboard preview"
              ctaHref="/preview/dashboard-v2?state=ready&ads=on&guest=1"
            />
            <SponsoredSlotV2 slot={model.sponsorBottom} variant="full" />
          </>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className={`${v2Theme.panel} p-5 sm:p-6`}>
                <Link
                  href="/preview/dashboard-v2?state=ready&ads=on&guest=1"
                  className="inline-flex rounded-full border border-[rgba(42,53,69,0.55)] bg-[rgba(8,13,20,0.82)] px-3 py-1.5 text-[11px] font-medium text-[#8b96a8]"
                >
                  Back to dashboard
                </Link>

                <div className="mt-4 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <SectionKickerV2>Candidate detail</SectionKickerV2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-[#f4f7fb]">{model.symbol}</h1>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${bucket.chip}`}>
                        {bucket.label}
                      </span>
                      <span className="rounded-md border border-[rgba(42,53,69,0.55)] bg-[rgba(17,24,39,0.78)] px-2 py-1 font-mono text-[10px] text-[#657084]">
                        {model.runContext.timeframe}
                      </span>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-[#8b96a8]">{model.whyThisCoin}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {model.reasonTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[rgba(42,53,69,0.55)] bg-[rgba(17,24,39,0.78)] px-2 py-1 text-[10px] text-[#8b96a8]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[360px] xl:grid-cols-1">
                    {model.heroStats.map((item) => (
                      <HeroStat key={item.label} label={item.label} value={item.value} tone={item.tone ?? "default"} />
                    ))}
                  </div>
                </div>
              </div>

              <div className={`${v2Theme.panel} p-5`}>
                <SectionKickerV2>Trust framing</SectionKickerV2>
                <p className="mt-3 text-sm leading-6 text-[#8b96a8]">
                  Use current scores, funding, history, discussion, and sponsored placements as context for review. This preview preserves the same-run framing and sponsor separation rules without touching the live runtime route.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {model.scores.map((score) => (
                <div key={score.label} className={`${v2Theme.panel} p-4`}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#657084]">{score.label}</p>
                  <p className={`mt-3 font-mono text-[26px] ${scoreClass(score.tone)}`}>{score.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className={`${v2Theme.panel} p-5`}>
                <SectionKickerV2>Latest + delta context</SectionKickerV2>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {model.latestMetrics.map((metric) => (
                    <div key={metric.label} className={`${v2Theme.panelSoft} px-4 py-4`}>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-[#657084]">{metric.label}</p>
                      <p className={`mt-2 font-mono text-[13px] ${metricClass(metric.tone ?? "default")}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${v2Theme.panel} p-5`}>
                <SectionKickerV2>Why this coin</SectionKickerV2>
                <p className="mt-3 text-sm leading-6 text-[#8b96a8]">{model.whyThisCoin}</p>
                <div className={`${v2Theme.panelSoft} mt-4 px-4 py-4`}>
                  <p className="text-[11px] font-medium text-[#f4f7fb]">Signal stack</p>
                  <p className="mt-2 text-sm leading-6 text-[#8b96a8]">
                    The preview keeps the same analysis story order as the approved detail shell: score overview, latest plus delta, why this coin, funding context, history, discussion, then sponsor.
                  </p>
                </div>
              </div>
            </section>

            <section className={`${v2Theme.panel} p-5`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <SectionKickerV2>Funding context</SectionKickerV2>
                  <p className="mt-2 text-sm text-[#8b96a8]">
                    Funding helps frame whether the current setup is getting crowded or still relatively balanced.
                  </p>
                </div>
                <span className="font-mono text-[11px] text-[#657084]">persisted run {model.runContext.runId}</span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className={`${v2Theme.panelSoft} px-4 py-4`}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FundingItem label="Latest funding" value={model.funding.latest} />
                    <FundingItem label="Absolute funding" value={model.funding.absolute} />
                    <FundingItem label="Bias" value={model.funding.bias} tone={model.funding.bias} />
                  </div>
                </div>
                <div className={`${v2Theme.panelSoft} px-4 py-4`}>
                  <p className="text-[11px] font-medium text-[#f4f7fb]">Interpretation</p>
                  <p className="mt-2 text-sm leading-6 text-[#8b96a8]">{model.funding.interpretation}</p>
                </div>
              </div>
            </section>

            <section className={`${v2Theme.panel} overflow-hidden`}>
              <div className={`border-b ${v2Theme.border} px-5 py-4`}>
                <SectionKickerV2>Recent history</SectionKickerV2>
                <p className="mt-2 text-sm text-[#8b96a8]">
                  Compact persisted snapshots for the current symbol inside the same run context.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[11px]">
                  <thead className="bg-[rgba(8,13,20,0.96)] text-[9px] uppercase tracking-[0.1em] text-[#657084]">
                    <tr>
                      {["Time", "Last", "Comp", "Setup", "Pos", "OI%", "Flow", "L/S", "Risk", "Fund"].map((label) => (
                        <th key={label} className={`px-3 py-3 ${label === "Time" ? "text-left" : "text-right"}`}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {model.history.map((row, index) => (
                      <tr
                        key={row.timestamp}
                        className={`border-t border-[rgba(30,42,58,0.38)] ${index % 2 === 0 ? "bg-[#070c12]" : "bg-[#0a0f16]"}`}
                      >
                        <td className="px-3 py-2 text-left font-mono text-[#8b96a8]">{row.timestamp}</td>
                        <td className="px-3 py-2 text-right font-mono text-[#dce5ef]">{row.lastPrice}</td>
                        <td className={`px-3 py-2 text-right font-mono ${scoreTone(row.composite)}`}>{row.composite.toFixed(1)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${scoreTone(row.setup)}`}>{row.setup.toFixed(1)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${scoreTone(row.positioning)}`}>{row.positioning.toFixed(1)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${toneByValue(row.oiPercent)}`}>{signed(row.oiPercent)}%</td>
                        <td className={`px-3 py-2 text-right font-mono ${toneByValue(row.takerFlow)}`}>{signed(row.takerFlow)}</td>
                        <td className="px-3 py-2 text-right font-mono text-[#8b96a8]">{row.lsRatio.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-mono text-[#8b96a8]">{row.riskPenalty.toFixed(1)}</td>
                        <td className={`px-3 py-2 text-right font-mono ${toneByValue(row.funding)}`}>{row.funding.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[rgba(30,42,58,0.38)]" />
                <span className="text-[9px] uppercase tracking-[0.15em] text-[#657084]">Community discussion</span>
                <div className="h-px flex-1 bg-[rgba(30,42,58,0.38)]" />
              </div>

              <div className={`${v2Theme.panel} mt-3 p-5`}>
                <div className="flex flex-col gap-3">
                  <div className={`${v2Theme.panelSoft} px-4 py-4`}>
                    <p className="text-[11px] font-medium text-[#f4f7fb]">Share your interpretation</p>
                    <p className="mt-2 text-sm text-[#8b96a8]">
                      Preview-only discussion fixture. Live write/report rules stay on the existing runtime until V2 is approved and adapters are built.
                    </p>
                  </div>

                  {model.discussion.map((item) => (
                    <article key={item.id} className={`${v2Theme.panelSoft} px-4 py-4`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-cyan-400/18 bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-200">
                            {item.author}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#657084]">{item.ageLabel}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#8b96a8]">{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <SponsoredSlotV2 slot={model.sponsorBottom} variant="full" />
          </>
        )}
      </main>
    </AppShellV2>
  );
}

function HeroStat({ label, value, tone }: { label: string; value: string; tone: "default" | "positive" | "negative" }) {
  return (
    <div className={`${v2Theme.panelSoft} px-4 py-4`}>
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#657084]">{label}</p>
      <p className={`mt-3 font-mono text-[22px] ${metricClass(tone === "default" ? "default" : tone)}`}>{value}</p>
    </div>
  );
}

function FundingItem({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative" | "neutral";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#657084]">{label}</p>
      <p className={`mt-2 font-mono text-[13px] ${metricClass(tone)}`}>{value}</p>
    </div>
  );
}

function metricClass(tone: "default" | "positive" | "negative" | "muted" | "neutral") {
  if (tone === "positive") return "text-emerald-300";
  if (tone === "negative") return "text-rose-300";
  if (tone === "muted") return "text-[#657084]";
  if (tone === "neutral") return "text-[#dce5ef]";
  return "text-[#dce5ef]";
}

function scoreClass(tone: "cyan" | "positive" | "neutral" | "warning" | "negative") {
  if (tone === "cyan") return "text-cyan-300";
  if (tone === "positive") return "text-emerald-300";
  if (tone === "warning") return "text-amber-300";
  if (tone === "negative") return "text-rose-300";
  return "text-[#dce5ef]";
}

function toneByValue(value: number) {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-rose-300";
  return "text-[#657084]";
}

function signed(value: number, digits: number = 1) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}
