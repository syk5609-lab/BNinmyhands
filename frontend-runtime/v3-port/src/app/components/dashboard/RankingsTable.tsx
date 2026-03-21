"use client";

import { useNavigate } from '../../preview-router';
import type { CoinData, Preset, RunContext } from '../../data/mockData';
import { presetConfig } from '../../data/mockData';
import { ArrowUp, ArrowDown, Minus, ChevronRight, Table2 } from '../../lucide';

interface Props {
  data: CoinData[];
  preset: Preset;
  pumpMode: boolean;
  search: string;
  ctx: RunContext;
}

const bucketLabel: Record<string, string> = {
  breakout_watch: 'Breakout',
  positioning_build: 'Positioning',
  squeeze_watch: 'Squeeze',
  overheat_risk: 'Overheat',
};
const bucketColor: Record<string, string> = {
  breakout_watch:    'text-cyan-400   bg-cyan-500/8   border-cyan-500/15',
  positioning_build: 'text-violet-400 bg-violet-500/8 border-violet-500/15',
  squeeze_watch:     'text-amber-400  bg-amber-500/8  border-amber-500/15',
  overheat_risk:     'text-red-400    bg-red-500/8    border-red-500/15',
};

function fmt(n: number, decimals = 1) { return n.toFixed(decimals); }
function fmtVol(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return (n / 1e3).toFixed(0) + 'K';
}
function fmtPrice(n: number) {
  if (n >= 1000) return n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4);
  return n.toExponential(2);
}

// Column group structure for visual separation
interface ColDef {
  key: string;
  label: string;
  field: keyof CoinData;
  align?: 'right';
  group: 'identity' | 'market' | 'delta' | 'scores' | 'risk';
}

const columns: ColDef[] = [
  // Identity
  { key: 'rank',    label: '#',       field: 'rank',    group: 'identity' },
  { key: 'symbol',  label: 'Symbol',  field: 'symbol',  group: 'identity' },
  { key: 'bucket',  label: 'Bucket',  field: 'bucket',  group: 'identity' },
  { key: 'reasons', label: 'Signals', field: 'reasons', group: 'identity' },
  // Market
  { key: 'last',      label: 'Last',   field: 'last',      align: 'right', group: 'market' },
  { key: 'change24h', label: '24h %',  field: 'change24h', align: 'right', group: 'market' },
  { key: 'volume',    label: 'Volume', field: 'volume',    align: 'right', group: 'market' },
  // Deltas
  { key: 'compositeDelta', label: 'Comp\u2009\u0394', field: 'compositeDelta', align: 'right', group: 'delta' },
  { key: 'rankDelta',      label: 'Rank\u2009\u0394', field: 'rankDelta',      align: 'right', group: 'delta' },
  { key: 'oiPercent',      label: 'OI%',              field: 'oiPercent',      align: 'right', group: 'delta' },
  { key: 'takerFlow',      label: 'Taker',            field: 'takerFlow',      align: 'right', group: 'delta' },
  { key: 'lsRatio',        label: 'L/S',              field: 'lsRatio',        align: 'right', group: 'delta' },
  // Scores
  { key: 'composite',   label: 'Comp',  field: 'composite',   align: 'right', group: 'scores' },
  { key: 'momentum',    label: 'Mom',   field: 'momentum',    align: 'right', group: 'scores' },
  { key: 'setup',       label: 'Setup', field: 'setup',       align: 'right', group: 'scores' },
  { key: 'positioning', label: 'Pos',   field: 'positioning', align: 'right', group: 'scores' },
  // Risk
  { key: 'riskPenalty', label: 'Risk', field: 'riskPenalty', align: 'right', group: 'risk' },
  { key: 'funding',     label: 'Fund', field: 'funding',     align: 'right', group: 'risk' },
];

// Group boundary detection for subtle column separators
const groupBoundaries = new Set<number>();
columns.forEach((col, i) => {
  if (i > 0 && col.group !== columns[i - 1].group) groupBoundaries.add(i);
});

export function RankingsTable({ data, preset, pumpMode, search, ctx }: Props) {
  const navigate = useNavigate();
  const cfg = presetConfig[preset];
  const emphasized = new Set(cfg.emphasizedColumns);

  let filtered = data.filter(d => d.bucket === cfg.defaultBucket && d.isPump === pumpMode);
  if (search) filtered = filtered.filter(d => d.symbol.toLowerCase().includes(search.toLowerCase()));

  filtered.sort((a, b) => {
    const av = a[cfg.defaultSort] as number;
    const bv = b[cfg.defaultSort] as number;
    return bv - av;
  });

  filtered = filtered.map((d, i) => ({ ...d, rank: i + 1 }));

  if (filtered.length === 0) {
    return (
      <div className="px-4 sm:px-5 max-w-[1600px] mx-auto">
        <TableSectionHeader count={0} sortKey={cfg.defaultSort} />
        <div className="rounded-lg border border-[#1e2a3a] bg-[#0a0f16] p-10 text-center">
          <Table2 className="w-5 h-5 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-[12px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            No {pumpMode ? 'pump' : 'dump'} candidates for {cfg.label}
          </p>
          <p className="text-gray-700 text-[11px] mt-1">Try switching direction or selecting a different preset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 max-w-[1600px] mx-auto w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
      <TableSectionHeader count={filtered.length} sortKey={cfg.defaultSort} />

      <div className="overflow-x-auto rounded-lg border border-[#1e2a3a]">
        <table className="w-full text-[11px] min-w-[1100px]">
          <thead>
            <tr className="bg-[#080d14]">
              {columns.map((col, ci) => (
                <th
                  key={col.key}
                  className={`px-2.5 py-2.5 whitespace-nowrap border-b border-[#1e2a3a] ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${emphasized.has(col.field) ? 'text-cyan-500/60' : 'text-gray-600'} ${
                    groupBoundaries.has(ci) ? 'border-l border-l-[#1e2a3a]/30' : ''
                  }`}
                  style={{ fontWeight: 500, fontSize: '9px', letterSpacing: '0.07em', textTransform: 'uppercase' }}
                >
                  {col.label}
                </th>
              ))}
              {/* Row action column */}
              <th className="w-6 border-b border-[#1e2a3a]" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr
                key={row.symbol}
                onClick={() => navigate(`/coin/${row.symbol}?timeframe=${ctx.timeframe}&run_id=${ctx.run_id}`)}
                className={`group border-b border-[#1e2a3a]/30 cursor-pointer transition-colors duration-100 hover:bg-[#0f1520] ${
                  idx % 2 === 0 ? 'bg-[#070c12]' : 'bg-[#0a0f16]'
                }`}
              >
                {/* # */}
                <td className="px-2.5 py-2 text-gray-600 w-8" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
                  {row.rank}
                </td>
                {/* Symbol — sticky visual weight */}
                <td className="px-2.5 py-2">
                  <span className="text-gray-100 text-[12px]" style={{ fontWeight: 600 }}>{row.symbol}</span>
                </td>
                {/* Bucket */}
                <td className="px-2.5 py-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded border ${bucketColor[row.bucket]}`} style={{ fontWeight: 500, letterSpacing: '0.03em' }}>
                    {bucketLabel[row.bucket]}
                  </span>
                </td>
                {/* Signals */}
                <td className="px-2.5 py-2">
                  <div className="flex gap-1 flex-wrap max-w-[130px]">
                    {row.reasons.slice(0, 2).map(r => (
                      <span key={r} className="text-[8px] bg-[#111827] text-gray-500 px-1.5 py-0.5 rounded border border-[#1e2a3a]/40">
                        {r}
                      </span>
                    ))}
                    {row.reasons.length > 2 && (
                      <span className="text-[8px] text-gray-700">+{row.reasons.length - 2}</span>
                    )}
                  </div>
                </td>
                {/* Last — group boundary */}
                <td className={`px-2.5 py-2 text-right border-l border-l-[#1e2a3a]/20 ${emphasized.has('last') ? 'text-cyan-300' : 'text-gray-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmtPrice(row.last)}
                </td>
                {/* 24h % */}
                <td className={`px-2.5 py-2 text-right ${row.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {row.change24h >= 0 ? '+' : ''}{fmt(row.change24h)}%
                </td>
                {/* Volume */}
                <td className={`px-2.5 py-2 text-right ${emphasized.has('volume') ? 'text-cyan-300' : 'text-gray-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmtVol(row.volume)}
                </td>
                {/* Comp Δ — group boundary */}
                <DeltaCell val={row.compositeDelta} em={emphasized.has('compositeDelta')} boundary />
                {/* Rank Δ */}
                <td className="px-2.5 py-2 text-right">
                  <span className="inline-flex items-center gap-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.rankDelta > 0 ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : row.rankDelta < 0 ? <ArrowDown className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-gray-700" />}
                    <span className={row.rankDelta > 0 ? 'text-emerald-400' : row.rankDelta < 0 ? 'text-red-400' : 'text-gray-700'}>{Math.abs(row.rankDelta)}</span>
                  </span>
                </td>
                {/* OI% */}
                <DeltaCell val={row.oiPercent} em={emphasized.has('oiPercent')} suffix="%" />
                {/* Taker */}
                <DeltaCell val={row.takerFlow} em={emphasized.has('takerFlow')} />
                {/* L/S */}
                <td className={`px-2.5 py-2 text-right ${emphasized.has('lsRatio') ? 'text-cyan-300' : 'text-gray-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmt(row.lsRatio, 2)}
                </td>
                {/* Comp — group boundary */}
                <ScoreCell val={row.composite} em={emphasized.has('composite')} boundary />
                {/* Mom */}
                <ScoreCell val={row.momentum} em={emphasized.has('momentum')} />
                {/* Setup */}
                <ScoreCell val={row.setup} em={emphasized.has('setup')} />
                {/* Pos */}
                <ScoreCell val={row.positioning} em={emphasized.has('positioning')} />
                {/* Risk — group boundary */}
                <td className={`px-2.5 py-2 text-right border-l border-l-[#1e2a3a]/20 ${emphasized.has('riskPenalty') ? 'text-red-400' : row.riskPenalty > 20 ? 'text-red-400/70' : 'text-gray-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {fmt(row.riskPenalty)}
                </td>
                {/* Fund */}
                <td className={`px-2.5 py-2 text-right ${emphasized.has('funding') ? 'text-cyan-300' : 'text-gray-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {(row.funding * 100).toFixed(3)}%
                </td>
                {/* Row action indicator */}
                <td className="px-1.5 py-2 w-6">
                  <ChevronRight className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table footer summary */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[10px] text-gray-700">
          {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} · click any row for detail
        </span>
        <span className="text-[10px] text-gray-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {ctx.timeframe} · {ctx.run_id}
        </span>
      </div>
    </div>
  );
}

function TableSectionHeader({ count, sortKey }: { count: number; sortKey: keyof CoinData }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <Table2 className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>Full Rankings</span>
        <span className="text-[10px] text-gray-600">·</span>
        <span className="text-[10px] text-gray-600">{count} results</span>
      </div>
      <span className="text-[10px] text-gray-700">
        Sorted by <span className="text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{String(sortKey)}</span>
      </span>
    </div>
  );
}

function DeltaCell({ val, em, suffix = '', boundary }: { val: number; em: boolean; suffix?: string; boundary?: boolean }) {
  const color = em
    ? (val >= 0 ? 'text-cyan-300' : 'text-orange-300')
    : (val >= 0 ? 'text-emerald-400/80' : 'text-red-400/80');
  return (
    <td className={`px-2.5 py-2 text-right ${color} ${boundary ? 'border-l border-l-[#1e2a3a]/20' : ''}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {(val >= 0 ? '+' : '') + val.toFixed(1)}{suffix}
    </td>
  );
}

function ScoreCell({ val, em, boundary }: { val: number; em: boolean; boundary?: boolean }) {
  const bg = val > 70 ? 'bg-emerald-500/10' : val > 40 ? 'bg-gray-500/5' : 'bg-red-500/8';
  const text = em ? 'text-cyan-300' : (val > 70 ? 'text-emerald-400/80' : val > 40 ? 'text-gray-400' : 'text-red-400/70');
  return (
    <td className={`px-2.5 py-2 text-right ${boundary ? 'border-l border-l-[#1e2a3a]/20' : ''}`}>
      <span className={`inline-block px-1.5 py-0.5 rounded ${bg} ${text}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {val.toFixed(1)}
      </span>
    </td>
  );
}
