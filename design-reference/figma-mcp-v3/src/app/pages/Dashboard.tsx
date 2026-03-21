import { useState, useEffect } from 'react';
import { StickyHeader } from '../components/dashboard/StickyHeader';
import { Controls } from '../components/dashboard/Controls';
import { BucketCards } from '../components/dashboard/BucketCards';
import { TopHighlights } from '../components/dashboard/TopHighlights';
import { RankingsTable } from '../components/dashboard/RankingsTable';
import {
  LoadingState, ErrorState, NoRunState, EmptyDataState,
  PartialRunBanner, GuestBrowsingBanner, TrustFramingStrip,
} from '../components/dashboard/StateScreens';
import { SponsoredSlot } from '../components/shared/SponsoredSlot';
import { Disclaimer } from '../components/shared/PageShell';
import { generateMockData, getRunContext } from '../data/mockData';
import type { Timeframe, Preset, CoinData, RunContext } from '../data/mockData';

type LoadPhase = 'loading' | 'error' | 'no_run' | 'ready';

export function Dashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>('4h');
  const [preset, setPreset] = useState<Preset>('breakout');
  const [pumpMode, setPumpMode] = useState(true);
  const [search, setSearch] = useState('');
  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [data, setData] = useState<CoinData[]>([]);
  const [ctx, setCtx] = useState<RunContext>(getRunContext('4h'));

  useEffect(() => {
    setPhase('loading');
    const t = setTimeout(() => {
      const newData = generateMockData();
      const newCtx = getRunContext(timeframe);
      setData(newData);
      setCtx(newCtx);
      setPhase(newData.length === 0 ? 'no_run' : 'ready');
    }, 800);
    return () => clearTimeout(t);
  }, [timeframe]);

  // ── Shell wrapper — header + footer always visible ──
  const shell = (body: React.ReactNode) => (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col">
      <StickyHeader ctx={ctx} />
      {body}
      <Disclaimer />
    </div>
  );

  // ── Loading state ──
  if (phase === 'loading') {
    return shell(<LoadingState />);
  }

  // ── Error state ──
  if (phase === 'error') {
    return shell(<ErrorState />);
  }

  // ── No run state ──
  if (phase === 'no_run') {
    return shell(<NoRunState />);
  }

  // ── Empty data ──
  if (data.length === 0) {
    return shell(<EmptyDataState />);
  }

  // ── Ready state — full dashboard ──
  return shell(
    <>
      {/* Trust framing strip */}
      <TrustFramingStrip />

      {/* Guest browsing banner (hidden when logged in) */}
      <GuestBrowsingBanner />

      {/* Sponsored: dashboard_top — compact strip below trust context */}
      <div className="mt-1">
        <SponsoredSlot position="dashboard_top" showDisabledState />
      </div>

      {/* Controls: presets, timeframe, pump/dump, search */}
      <Controls
        timeframe={timeframe} setTimeframe={setTimeframe}
        preset={preset} setPreset={setPreset}
        pumpMode={pumpMode} setPumpMode={setPumpMode}
        search={search} setSearch={setSearch}
      />

      {/* Main content stack */}
      <div className="flex flex-col gap-4 pt-4 pb-2 flex-1">
        {/* Partial run warning */}
        {ctx.run_status === 'partial' && <PartialRunBanner />}

        {/* Top candidates */}
        <TopHighlights data={data} preset={preset} pumpMode={pumpMode} ctx={ctx} />

        {/* Bucket distribution */}
        <BucketCards data={data} />

        {/* Sponsored: dashboard_mid — between buckets and rankings */}
        <SponsoredSlot position="dashboard_mid" showDisabledState />

        {/* Rankings table */}
        <RankingsTable data={data} preset={preset} pumpMode={pumpMode} search={search} ctx={ctx} />
      </div>
    </>
  );
}
