"use client";

import { useEffect, useState } from "react";

import { fetchAdSlots, logAdEvent } from "@/lib/api/ads";
import { fetchRuntimeFlags } from "@/lib/api/feature-flags";
import { AdPlacement as AdPlacementType, AdSlotRender } from "@/lib/types/ads";
import { SponsoredCard } from "@/components/ads/sponsored-card";

export function AdPlacement({ placement, className = "" }: { placement: AdPlacementType; className?: string }) {
  const [slots, setSlots] = useState<AdSlotRender[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const flags = await fetchRuntimeFlags();
        if (!active) return;
        if (!flags.ads_enabled) {
          setSlots([]);
          setLoaded(true);
          return;
        }
        const nextSlots = await fetchAdSlots(placement);
        if (!active) return;
        setSlots(nextSlots);
        setLoaded(true);
        nextSlots.forEach((slot) => {
          void logAdEvent(slot.id, slot.creative.id, "impression");
        });
      } catch {
        if (!active) return;
        setSlots([]);
        setLoaded(true);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [placement]);

  if (loaded && slots.length === 0) {
    return <div className={className} aria-hidden="true" data-sponsored-empty={placement} />;
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {slots.map((slot) => (
          <SponsoredCard key={`${slot.id}-${slot.creative.id}`} slot={slot} />
        ))}
      </div>
    </div>
  );
}
