import { V2SponsoredSlotData } from "@/components/v2/types";

export function SponsoredSlotV2({
  slot,
  variant,
}: {
  slot: V2SponsoredSlotData;
  variant: "compact" | "full";
}) {
  if (!slot.enabled) {
    return (
      <div
        className={`rounded-[16px] border border-dashed border-[rgba(42,53,69,0.6)] bg-[#080d14] ${
          variant === "compact" ? "px-4 py-3" : "px-5 py-5"
        } flex items-center justify-center`}
      >
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#657084]">
          Sponsored content is currently disabled
        </span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={slot.href}
        className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[rgba(42,53,69,0.55)] bg-[#0a0f16] px-4 py-3 transition-colors duration-200 hover:border-[rgba(82,213,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 sm:flex-nowrap"
        style={{ borderLeft: "2px solid rgba(100,116,139,0.22)" }}
      >
        <span className="rounded-md border border-[rgba(42,53,69,0.55)] bg-[#111827] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#657084]">
          Sponsored
        </span>
        <div className="min-w-0 flex-1 text-[11px] text-[#8b96a8]">
          <span className="font-medium text-[#dce5ef]">{slot.title}</span>
          <span className="mx-1.5 text-[#2a3545]">-</span>
          <span className="truncate">{slot.description}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#657084]">
          <span>{slot.advertiser}</span>
          <span className="font-medium text-[#9aa6b7]">{slot.ctaLabel}</span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={slot.href}
      className="block rounded-[16px] border border-[rgba(42,53,69,0.55)] bg-[#0a0f16] p-4 transition-colors duration-200 hover:border-[rgba(82,213,255,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
      style={{ borderLeft: "2px solid rgba(100,116,139,0.22)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md border border-[rgba(42,53,69,0.55)] bg-[#111827] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#657084]">
          Sponsored
        </span>
        <span className="text-[9px] text-[#657084]">{slot.advertiser}</span>
      </div>
      <div className="mt-3 space-y-1.5">
        <p className="text-[13px] font-medium text-[#dce5ef]">{slot.title}</p>
        <p className="text-[11px] leading-5 text-[#8b96a8]">{slot.description}</p>
      </div>
      <div className="mt-3 text-[10px] font-medium text-[#9aa6b7]">{slot.ctaLabel}</div>
    </a>
  );
}
