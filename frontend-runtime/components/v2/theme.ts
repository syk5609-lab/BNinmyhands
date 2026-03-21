import { V2Bucket, V2Preset } from "@/components/v2/types";

export const v2Theme = {
  page: "min-h-screen bg-[#06090f] text-[#f4f7fb]",
  content: "mx-auto w-full max-w-[1600px] px-4 sm:px-5",
  mutedText: "text-[#8b96a8]",
  faintText: "text-[#657084]",
  strongText: "text-[#f4f7fb]",
  border: "border-[rgba(30,42,58,0.82)]",
  borderSoft: "border-[rgba(42,53,69,0.55)]",
  panel: "rounded-[18px] border border-[rgba(30,42,58,0.82)] bg-[#0a0f16]",
  panelSoft: "rounded-[16px] border border-[rgba(42,53,69,0.55)] bg-[#0c1018]",
  mono: "font-mono",
  kicker: "text-[10px] font-medium uppercase tracking-[0.18em] text-[#657084]",
};

export const bucketTone: Record<
  V2Bucket,
  { label: string; short: string; chip: string; panel: string; stat: string; progress: string }
> = {
  breakout_watch: {
    label: "Breakout",
    short: "BRK",
    chip: "border-cyan-400/18 bg-cyan-400/10 text-cyan-100",
    panel: "border-cyan-400/18 bg-[rgba(0,176,255,0.04)]",
    stat: "text-cyan-300",
    progress: "bg-cyan-400/35",
  },
  positioning_build: {
    label: "Positioning",
    short: "POS",
    chip: "border-violet-400/18 bg-violet-400/10 text-violet-100",
    panel: "border-violet-400/18 bg-[rgba(167,139,250,0.04)]",
    stat: "text-violet-300",
    progress: "bg-violet-400/35",
  },
  squeeze_watch: {
    label: "Squeeze",
    short: "SQZ",
    chip: "border-amber-400/18 bg-amber-400/10 text-amber-100",
    panel: "border-amber-400/18 bg-[rgba(247,185,85,0.04)]",
    stat: "text-amber-300",
    progress: "bg-amber-400/35",
  },
  overheat_risk: {
    label: "Overheat",
    short: "OVH",
    chip: "border-rose-400/18 bg-rose-400/10 text-rose-100",
    panel: "border-rose-400/18 bg-[rgba(248,113,113,0.04)]",
    stat: "text-rose-300",
    progress: "bg-rose-400/35",
  },
};

export const presetTone: Record<
  V2Preset,
  { accent: string; activeText: string; activeBorder: string; badge: string }
> = {
  breakout: {
    accent: "rgba(0, 176, 255, 0.08)",
    activeText: "text-cyan-300",
    activeBorder: "rgba(0, 176, 255, 0.3)",
    badge: "BRK",
  },
  positioning: {
    accent: "rgba(167, 139, 250, 0.08)",
    activeText: "text-violet-300",
    activeBorder: "rgba(167, 139, 250, 0.28)",
    badge: "POS",
  },
  squeeze: {
    accent: "rgba(247, 185, 85, 0.08)",
    activeText: "text-amber-300",
    activeBorder: "rgba(247, 185, 85, 0.28)",
    badge: "SQZ",
  },
  overheat: {
    accent: "rgba(248, 113, 113, 0.08)",
    activeText: "text-rose-300",
    activeBorder: "rgba(248, 113, 113, 0.28)",
    badge: "RISK",
  },
};

export function valueTone(value: number): string {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-rose-300";
  return "text-[#657084]";
}

export function scoreTone(value: number): string {
  if (value >= 70) return "text-emerald-300";
  if (value <= 35) return "text-rose-300";
  return "text-[#dbe4ef]";
}
