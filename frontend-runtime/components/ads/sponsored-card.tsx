"use client";

import { logAdEvent } from "@/lib/api/ads";
import { AdSlotRender } from "@/lib/types/ads";

export function SponsoredCard({ slot }: { slot: AdSlotRender }) {
  const { creative } = slot;

  const handleClick = () => {
    void logAdEvent(slot.id, creative.id, "click");
  };

  return (
    <a
      href={creative.target_url}
      target="_blank"
      rel="noreferrer noopener sponsored"
      onClick={handleClick}
      className="block rounded-xl border border-amber-500/30 bg-linear-to-br from-amber-500/8 via-zinc-950 to-zinc-950 p-4 transition hover:border-amber-400/50"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
          Sponsored
        </span>
        <span className="text-[11px] text-zinc-500">{slot.label}</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-100">{creative.title}</p>
          {creative.body_copy ? <p className="text-sm leading-6 text-zinc-300">{creative.body_copy}</p> : null}
          {creative.cta_label ? <p className="text-xs font-medium text-amber-200">{creative.cta_label}</p> : null}
        </div>
        {creative.image_url ? (
          <div className="rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400">
            Media attached
          </div>
        ) : null}
      </div>
    </a>
  );
}
