"use client";

import { Search, Zap, Crosshair, Flame, AlertTriangle, X } from '../../lucide';
import type { Timeframe, Preset } from '../../data/mockData';
import { presetConfig } from '../../data/mockData';

interface Props {
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
  preset: Preset;
  setPreset: (p: Preset) => void;
  pumpMode: boolean;
  setPumpMode: (v: boolean) => void;
  search: string;
  setSearch: (s: string) => void;
}

const timeframes: Timeframe[] = ['1h', '4h', '24h'];

const presets: { key: Preset; icon: typeof Zap; activeRing: string; activeBg: string; activeText: string }[] = [
  { key: 'breakout', icon: Zap,
    activeRing: 'ring-cyan-500/30', activeBg: 'bg-cyan-500/6', activeText: 'text-cyan-400' },
  { key: 'positioning', icon: Crosshair,
    activeRing: 'ring-violet-500/30', activeBg: 'bg-violet-500/6', activeText: 'text-violet-400' },
  { key: 'squeeze', icon: Flame,
    activeRing: 'ring-amber-500/30', activeBg: 'bg-amber-500/6', activeText: 'text-amber-400' },
  { key: 'overheat', icon: AlertTriangle,
    activeRing: 'ring-red-500/30', activeBg: 'bg-red-500/6', activeText: 'text-red-400' },
];

export function Controls({ timeframe, setTimeframe, preset, setPreset, pumpMode, setPumpMode, search, setSearch }: Props) {
  const cfg = presetConfig[preset];

  return (
    <div className="px-4 sm:px-5 pt-4 pb-0 max-w-[1600px] mx-auto flex flex-col gap-3.5" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Strategy Presets ── */}
      <div>
        <span className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-2 block" style={{ fontWeight: 500 }}>
          Strategy Preset
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {presets.map(p => {
            const pcfg = presetConfig[p.key];
            const Icon = p.icon;
            const isActive = preset === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={`group relative rounded-lg border px-3.5 py-2.5 text-left transition-all duration-200 ${
                  isActive
                    ? `${p.activeBg} ${p.activeText} border-transparent ring-1 ${p.activeRing}`
                    : 'border-[#1e2a3a]/70 bg-[#0a0f16] text-gray-500 hover:border-[#2a3545] hover:text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'opacity-40'}`} />
                  <span className="text-[12px]" style={{ fontWeight: 500 }}>{pcfg.label}</span>
                </div>
                {isActive && (
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-1.5">{pcfg.explanation}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Timeframe selector */}
        <div className="flex rounded-lg overflow-hidden border border-[#1e2a3a]">
          {timeframes.map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 text-[11px] transition-all duration-150 border-r border-[#1e2a3a] last:border-r-0 ${
                t === timeframe
                  ? 'bg-[#1a2332] text-gray-200'
                  : 'bg-[#080d14] text-gray-600 hover:text-gray-400 hover:bg-[#0d1219]'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Pump / Dump toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[#1e2a3a]">
          <button
            onClick={() => setPumpMode(true)}
            className={`px-3.5 py-1.5 text-[11px] transition-all duration-150 border-r border-[#1e2a3a] ${
              pumpMode
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-[#080d14] text-gray-600 hover:text-gray-400'
            }`}
            style={{ fontWeight: 500 }}
          >
            <span className="mr-1 text-[10px]">&#9650;</span>Pump
          </button>
          <button
            onClick={() => setPumpMode(false)}
            className={`px-3.5 py-1.5 text-[11px] transition-all duration-150 ${
              !pumpMode
                ? 'bg-red-500/10 text-red-400'
                : 'bg-[#080d14] text-gray-600 hover:text-gray-400'
            }`}
            style={{ fontWeight: 500 }}
          >
            <span className="mr-1 text-[10px]">&#9660;</span>Dump
          </button>
        </div>

        {/* Active preset label — visible context */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0f16] border border-[#1e2a3a]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
          <span className="text-[10px] text-gray-500">{cfg.label}</span>
        </div>

        {/* Search — right-aligned */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#080d14] border border-[#1e2a3a] rounded-lg pl-8 pr-8 py-1.5 text-[11px] text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/30 focus:bg-[#0b1018] w-40 sm:w-48 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
