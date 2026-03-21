import { ExternalLink, Megaphone } from 'lucide-react';
import { isFeatureEnabled } from '../../data/featureFlags';
import { getAdBySlot, type SponsoredAd } from '../../data/communityData';
import { useMemo } from 'react';

interface Props {
  /** Controls outer wrapper padding. `inline` = no outer px/maxw (for use inside already-padded containers) */
  inline?: boolean;
  /** Position hint — affects which ad is shown and subtle layout variation */
  position?: 'dashboard_top' | 'dashboard_mid' | 'detail' | 'detail_bottom' | 'community';
  /** If true, show the disabled placeholder instead of hiding entirely */
  showDisabledState?: boolean;
}

export function SponsoredSlot({ inline, position = 'dashboard_mid', showDisabledState }: Props) {
  const enabled = isFeatureEnabled('sponsoredAdsEnabled');
  const slotIndex = position === 'dashboard_top' ? 0 : position === 'dashboard_mid' ? 1 : position === 'detail' ? 0 : position === 'detail_bottom' ? 1 : 1;
  const ad = useMemo(() => getAdBySlot(slotIndex), [slotIndex]);

  const wrapper = inline ? '' : 'px-4 sm:px-5 max-w-[1600px] mx-auto w-full';

  // Ads disabled: show subtle placeholder if requested, else render nothing
  if (!enabled) {
    if (!showDisabledState) return null;
    return (
      <div className={wrapper} style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="rounded-lg border border-dashed border-[#1e2a3a]/40 bg-[#080d14] py-4 px-5 flex items-center justify-center gap-2.5">
          <Megaphone className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-[10px] text-gray-700 tracking-wide">
            Sponsored content is currently disabled
          </span>
        </div>
      </div>
    );
  }

  // Compact top-of-page variant
  if (position === 'dashboard_top') {
    return (
      <div className={wrapper} style={{ fontFamily: 'Inter, sans-serif' }}>
        <SponsoredCardCompact ad={ad} />
      </div>
    );
  }

  // Standard card variant
  return (
    <div className={wrapper} style={{ fontFamily: 'Inter, sans-serif' }}>
      <SponsoredCardFull ad={ad} />
    </div>
  );
}

/** Compact horizontal strip — for dashboard_top placement */
function SponsoredCardCompact({ ad }: { ad: SponsoredAd }) {
  return (
    <div
      className="rounded-lg border border-[#1e2a3a]/50 bg-[#0a0f16] px-4 py-2.5 flex items-center gap-4 flex-wrap sm:flex-nowrap"
      style={{ borderLeft: '2px solid rgba(100,116,139,0.2)' }}
    >
      <span className="text-[8px] text-gray-600 uppercase tracking-[0.2em] bg-[#111827] border border-[#1e2a3a]/50 px-1.5 py-0.5 rounded shrink-0" style={{ fontWeight: 600 }}>
        Sponsored
      </span>
      <span className="text-[11px] text-gray-500 flex-1 min-w-0 truncate">
        <span className="text-gray-400" style={{ fontWeight: 500 }}>{ad.title}</span>
        <span className="mx-1.5 text-[#2a3545]">—</span>
        <span>{ad.description}</span>
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] text-gray-700">{ad.advertiser}</span>
        <a
          href={ad.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          style={{ fontWeight: 500 }}
        >
          {ad.ctaLabel}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/** Full card — for mid-page and other placements */
function SponsoredCardFull({ ad }: { ad: SponsoredAd }) {
  return (
    <div
      className="rounded-lg border border-[#1e2a3a]/50 bg-[#0a0f16] p-4 relative"
      style={{ borderLeft: '2px solid rgba(100,116,139,0.2)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] text-gray-600 uppercase tracking-[0.2em] bg-[#111827] border border-[#1e2a3a]/50 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
          Sponsored
        </span>
        <span className="text-[9px] text-gray-700">{ad.advertiser}</span>
      </div>
      <p className="text-[12px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>{ad.title}</p>
      <p className="text-[11px] text-gray-600 leading-relaxed mb-3">{ad.description}</p>
      <a
        href={ad.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
        style={{ fontWeight: 500 }}
      >
        {ad.ctaLabel}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}