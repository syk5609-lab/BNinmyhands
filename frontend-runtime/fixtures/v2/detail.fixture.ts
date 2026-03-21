import { V2DetailPreviewModel, V2DetailState } from "@/components/v2/types";
import { getRunContextFixture } from "@/fixtures/v2/run-context.fixture";

export function buildDetailPreviewModel({
  state = "ready",
  adsOn = true,
  symbol = "COSUSDT",
}: {
  state?: V2DetailState;
  adsOn?: boolean;
  symbol?: string;
}): V2DetailPreviewModel {
  return {
    state,
    adsOn,
    runContext: getRunContextFixture("4h"),
    symbol,
    bucket: "breakout_watch",
    trustCopy: "Research / educational — derived from scanner run snapshot, not live data.",
    whyThisCoin:
      "Volume surged above its recent baseline while price reclaimed the local range, composite momentum improved, and recent positioning stayed constructive enough to keep the symbol in the same-run candidate set.",
    reasonTags: ["range_break", "momentum_flip", "oi_ramp"],
    heroStats: [
      { label: "Last Price", value: "0.001607" },
      { label: "24h Change", value: "+0.19%", tone: "positive" },
      { label: "24h Volume", value: "73.88M" },
    ],
    scores: [
      { label: "Composite", value: "63.7", tone: "cyan" },
      { label: "Momentum", value: "78.5", tone: "positive" },
      { label: "Setup", value: "28.5", tone: "warning" },
      { label: "Positioning", value: "14.4", tone: "negative" },
      { label: "Data Quality", value: "96.2", tone: "neutral" },
    ],
    latestMetrics: [
      { label: "Bucket", value: "Breakout" },
      { label: "Previous Rank", value: "#3" },
      { label: "Rank Delta", value: "+2", tone: "positive" },
      { label: "Composite Delta", value: "+1.00", tone: "positive" },
      { label: "Setup Delta", value: "+0.42", tone: "positive" },
      { label: "Positioning Delta", value: "+0.19", tone: "positive" },
      { label: "OI Change", value: "+2.63%", tone: "positive" },
      { label: "Taker Flow", value: "+49.98", tone: "positive" },
      { label: "L/S Ratio", value: "1.13" },
    ],
    funding: {
      latest: "0.00060450",
      absolute: "0.00060450",
      bias: "positive",
      interpretation:
        "Funding is mildly positive, so longs are paying a premium, but the reading is not yet extreme enough to invalidate the breakout thesis on its own.",
    },
    history: [
      { timestamp: "08:05", lastPrice: "0.001601", composite: 60.2, setup: 27.1, positioning: 13.9, oiPercent: 1.8, takerFlow: 31.2, lsRatio: 1.08, riskPenalty: 4.5, funding: 5.9 },
      { timestamp: "08:20", lastPrice: "0.001603", composite: 61.5, setup: 27.8, positioning: 14.0, oiPercent: 2.0, takerFlow: 35.8, lsRatio: 1.09, riskPenalty: 4.6, funding: 6.0 },
      { timestamp: "08:35", lastPrice: "0.001605", composite: 62.6, setup: 28.2, positioning: 14.2, oiPercent: 2.3, takerFlow: 42.5, lsRatio: 1.11, riskPenalty: 4.7, funding: 6.0 },
      { timestamp: "08:50", lastPrice: "0.001607", composite: 63.7, setup: 28.5, positioning: 14.4, oiPercent: 2.63, takerFlow: 49.98, lsRatio: 1.13, riskPenalty: 4.8, funding: 6.05 },
    ],
    discussion: [
      {
        id: "1",
        author: "h12",
        ageLabel: "12m ago",
        body: "Breakout still looks clean. I would keep an eye on whether the next candle can hold above the reclaimed range without volume fading.",
      },
      {
        id: "2",
        author: "deltaflow",
        ageLabel: "7m ago",
        body: "Funding is warm but not crazy. For me the main read is improving taker flow and steady OI rather than squeeze conditions.",
      },
    ],
    sponsorBottom: {
      slot: "detail_bottom",
      enabled: adsOn,
      advertiser: "SignalStack",
      title: "Structured Alerting for Derivatives Teams",
      description: "Monitor funding, OI, and liquidation zones with one configurable workspace.",
      ctaLabel: "View Product",
      href: "#",
    },
    unavailableTitle: "Coin detail unavailable",
    unavailableBody:
      "Previewing the unavailable state for the same-run detail surface. The final live route will keep current runtime validation and fetch rules intact.",
  };
}
