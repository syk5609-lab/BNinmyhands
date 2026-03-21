"use client";

import type { CoinData, Preset, RunContext } from '../../data/mockData';
import { presetConfig } from '../../data/mockData';
import { TrendingUp, TrendingDown, Trophy, ArrowRight } from '../../lucide';
import { useNavigate } from '../../preview-router';

interface Props {
  data: CoinData[];
  preset: Preset;
  pumpMode: boolean;
  ctx: RunContext;
}

const bucketTag: Record<string, { label: string; cls: string }> = {
  breakout_watch:    { label: 'BRK', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  positioning_build: { label: 'POS', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  squeeze_watch:     { label: 'SQZ', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  overheat_risk:     { label: 'OVH', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function TopHighlights({ data, preset, pumpMode, ctx }: Props) {
  const navigate = useNavigate();
  const cfg = presetConfig[preset];
  const sortKey = cfg.defaultSort;

  const filtered = data
    .filter(d => d.bucket === cfg.defaultBucket && d.isPump === pumpMode)
    .sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number))
    .slice(0, 5);

  const directionLabel = pumpMode ? 'PUMP' : 'DUMP';
  const directionCls = pumpMode
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <div className="px-4 sm:px-5 max-w-[1600px] mx-auto w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>Top Candidates</span>
        </div>
        <div className="h-3 w-px bg-[#1e2a3a]" />
        <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded border ${directionCls}`} style={{ fontWeight: 600 }}>
          {directionLabel}
        </span>
        <span className="text-[10px] text-gray-600">{cfg.label}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[#1e2a3a] bg-[#0a0f16] p-8 text-center">
          <Trophy className="w-5 h-5 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-600 text-[12px]">
            No {pumpMode ? 'pump' : 'dump'} candidates detected for {cfg.label}
          </p>
          <p className="text-gray-700 text-[11px] mt-1">Try switching direction or preset.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {filtered.map((coin, i) => {
            const bt = bucketTag[coin.bucket];
            const isFirst = i === 0;
            return (
              <div
                key={coin.symbol}
                onClick={() => navigate(`/coin/${coin.symbol}?timeframe=${ctx.timeframe}&run_id=${ctx.run_id}`)}
                className={`group relative rounded-lg border bg-[#0a0f16] p-3.5 cursor-pointer transition-all duration-200 ${
                  isFirst
                    ? 'border-cyan-500/20 ring-1 ring-cyan-500/10 hover:ring-cyan-500/20 hover:border-cyan-500/30'
                    : 'border-[#1e2a3a] hover:border-[#2a3545] hover:bg-[#0d1219]'
                }`}
              >
                {/* Rank badge */}
                <span className={`absolute top-2.5 right-3 text-[10px] ${isFirst ? 'text-cyan-500/60' : 'text-gray-700'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  #{i + 1}
                </span>

                {/* Symbol + bucket */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[13px] text-gray-100" style={{ fontWeight: 600 }}>{coin.symbol}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded border ${bt.cls}`} style={{ fontWeight: 500, letterSpacing: '0.05em' }}>
                    {bt.label}
                  </span>
                </div>

                {/* Score + 24h % */}
                <div className="flex items-end justify-between mb-2.5">
                  <div>
                    <span className="text-[9px] text-gray-600 block mb-0.5" style={{ fontWeight: 500 }}>Composite</span>
                    <span className={`text-lg ${isFirst ? 'text-cyan-400' : 'text-gray-200'}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                      {coin.composite.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-0.5 text-[11px] ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Reason tags */}
                <div className="flex gap-1 flex-wrap">
                  {coin.reasons.slice(0, 2).map(r => (
                    <span key={r} className="text-[9px] text-gray-500 bg-[#111827] border border-[#1e2a3a]/40 px-1.5 py-0.5 rounded">
                      {r}
                    </span>
                  ))}
                </div>

                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-3 right-3 w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
