import type { CoinData } from '../../data/mockData';
import { Zap, Crosshair, Flame, AlertTriangle } from 'lucide-react';

const bucketMeta = {
  breakout_watch:    { label: 'Breakout',     icon: Zap,           border: 'border-cyan-500/15',   text: 'text-cyan-400',   dot: 'bg-cyan-400',   bg: 'bg-cyan-500/4' },
  positioning_build: { label: 'Positioning',  icon: Crosshair,     border: 'border-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400', bg: 'bg-violet-500/4' },
  squeeze_watch:     { label: 'Squeeze',      icon: Flame,         border: 'border-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400',  bg: 'bg-amber-500/4' },
  overheat_risk:     { label: 'Overheat',     icon: AlertTriangle, border: 'border-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400',    bg: 'bg-red-500/4' },
} as const;

export function BucketCards({ data }: { data: CoinData[] }) {
  const counts = {
    breakout_watch: data.filter(d => d.bucket === 'breakout_watch').length,
    positioning_build: data.filter(d => d.bucket === 'positioning_build').length,
    squeeze_watch: data.filter(d => d.bucket === 'squeeze_watch').length,
    overheat_risk: data.filter(d => d.bucket === 'overheat_risk').length,
  };
  const total = data.length;

  return (
    <div className="px-4 sm:px-5 max-w-[1600px] mx-auto w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section label */}
      <span className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-2 block" style={{ fontWeight: 500 }}>
        Bucket Distribution
      </span>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {(Object.keys(bucketMeta) as Array<keyof typeof bucketMeta>).map(key => {
          const { label, icon: Icon, border, text, dot, bg } = bucketMeta[key];
          const count = counts[key];
          const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
          return (
            <div key={key} className={`relative overflow-hidden rounded-lg border ${border} ${bg} p-3.5`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${text} opacity-60`} />
                  <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{label}</span>
                </div>
                <span className="text-[10px] text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
              </div>
              <span className={`text-xl ${text}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                {count}
              </span>
              <span className="text-[10px] text-gray-700 ml-1.5">
                of {total}
              </span>
              {/* Progress bar */}
              <div className="mt-2.5 h-[2px] bg-[#141a24] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${dot} opacity-35`} style={{ width: `${pct}%`, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
