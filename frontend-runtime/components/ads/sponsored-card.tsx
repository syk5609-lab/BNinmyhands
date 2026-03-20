"use client";

import { logAdEvent } from "@/lib/api/ads";
import { AdSlotRender } from "@/lib/types/ads";

export function SponsoredCard({
  slot,
  variant = "full",
}: {
  slot: AdSlotRender;
  variant?: "compact" | "full";
}) {
  const { creative } = slot;

  const handleClick = () => {
    void logAdEvent(slot.id, creative.id, "click");
  };

  if (variant === "compact") {
    return (
      <a
        href={creative.target_url}
        target="_blank"
        rel="noreferrer noopener sponsored"
        onClick={handleClick}
        className="flex flex-wrap items-center gap-3 rounded-lg border border-[color:var(--bn-border-soft)] bg-[#0a0f16] px-4 py-3 transition-colors hover:border-[#2a3545] hover:bg-[#0d1219] sm:flex-nowrap"
        style={{ borderLeft: "2px solid rgba(100, 116, 139, 0.22)" }}
      >
        <span className="rounded border border-[color:var(--bn-border-soft)] bg-[#111827] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[color:var(--bn-text-faint)]">
          Sponsored
        </span>
        <div className="min-w-0 flex-1 text-[11px] text-[color:var(--bn-text-muted)]">
          <span className="font-medium text-[12px] text-[var(--bn-text)]">{creative.title}</span>
          {creative.body_copy ? <span className="mx-1.5 text-[#2a3545]">-</span> : null}
          {creative.body_copy ? <span className="truncate">{creative.body_copy}</span> : null}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[color:var(--bn-text-faint)]">
          <span>{slot.label}</span>
          <span className="inline-flex items-center gap-1 font-medium text-[color:var(--bn-text-muted)] transition-colors hover:text-[var(--bn-text)]">
            {creative.cta_label ?? "Learn more"}
            <span aria-hidden="true">{">"}</span>
          </span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={creative.target_url}
      target="_blank"
      rel="noreferrer noopener sponsored"
      onClick={handleClick}
      className="bn-sponsored-full block rounded-lg border border-[color:var(--bn-border-soft)] bg-[#0a0f16] p-4 transition-colors hover:border-[#2a3545] hover:bg-[#0d1219]"
      style={{ borderLeft: "2px solid rgba(100, 116, 139, 0.22)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded border border-[color:var(--bn-border-soft)] bg-[#111827] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-[color:var(--bn-text-faint)]">
          Sponsored
        </span>
        <span className="text-[9px] text-[color:var(--bn-text-faint)]">{slot.label}</span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <p className="text-[13px] font-medium text-[var(--bn-text)]">{creative.title}</p>
        {creative.body_copy ? (
          <p className="text-[11px] leading-5 text-[color:var(--bn-text-muted)]">{creative.body_copy}</p>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[10px]">
        <span className="text-[color:var(--bn-text-faint)]">{creative.image_url ? "Media attached" : ""}</span>
        <span className="inline-flex items-center gap-1 font-medium text-[color:var(--bn-text-muted)] transition-colors hover:text-[var(--bn-text)]">
          {creative.cta_label ?? "Learn more"}
          <span aria-hidden="true">{">"}</span>
        </span>
      </div>
    </a>
  );
}
