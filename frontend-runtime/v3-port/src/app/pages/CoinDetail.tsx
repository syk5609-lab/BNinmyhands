"use client";

import { useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from '../preview-router';
import {
  ArrowLeft, Clock, AlertTriangle, SearchX, FileWarning,
  ArrowUp, ArrowDown, Minus, Shield, Activity, Zap, Crosshair, Flame,
  TrendingUp, TrendingDown, Info, Database, LogIn,
} from '../lucide';
import {
  generateCoinDetail, generateHistory, getRunContext, validSymbols,
  type Timeframe, type CoinDetailData, type HistoryRow, type RunContext,
} from '../data/mockData';
import { useAuth } from '../preview-auth';
import { DiscussionBlock } from '../components/detail/DiscussionBlock';
import { SponsoredSlot } from '../components/shared/SponsoredSlot';
import { Disclaimer } from '../components/shared/PageShell';

// ── Helpers ──────────────────────────────────────────────
function fmtPrice(n: number) {
  if (n >= 1000) return n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.001) return n.toFixed(4);
  return n.toExponential(2);
}
function fmtVol(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  return (n / 1e3).toFixed(0) + 'K';
}
function delta(v: number, d = 1) { return (v >= 0 ? '+' : '') + v.toFixed(d); }
function deltaColor(v: number) { return v > 0 ? 'text-emerald-400' : v < 0 ? 'text-red-400' : 'text-gray-500'; }

const validTimeframes = ['1h', '4h', '24h'];

const bucketMeta: Record<string, { label: string; icon: typeof Zap; color: string; bg: string; border: string }> = {
  breakout_watch:    { label: 'Breakout Watch',    icon: Zap,           color: 'text-cyan-400',   bg: 'bg-cyan-500/8',   border: 'border-cyan-500/20' },
  positioning_build: { label: 'Positioning Build',  icon: Crosshair,     color: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/20' },
  squeeze_watch:     { label: 'Squeeze Watch',      icon: Flame,         color: 'text-amber-400',  bg: 'bg-amber-500/8',  border: 'border-amber-500/20' },
  overheat_risk:     { label: 'Overheat Risk',      icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/8',    border: 'border-red-500/20' },
};

// ── Context Bar (always visible, even on error pages) ────
function ContextBar({ timeframe, runId, ctx }: { timeframe: string; runId: string; ctx: RunContext | null }) {
  return (
    <div className="border-b border-[#1e2a3a]/40 overflow-x-auto" style={{ background: 'rgba(6,9,15,0.6)' }}>
      <div className="flex items-center gap-2 max-w-[1600px] mx-auto px-4 sm:px-5 py-1.5 min-w-max" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Timeframe chip */}
        <span className="h-5 px-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 flex items-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
          {timeframe || '—'}
        </span>

        <Dot />

        {/* Run ID */}
        <span className="text-[10px] text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {runId || '(no run_id)'}
        </span>

        {ctx && (
          <>
            <Dot />
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Clock className="w-3 h-3 text-gray-600" />
              {new Date(ctx.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] text-gray-600">{ctx.dataAge}</span>
            <Dot />
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Database className="w-3 h-3 text-gray-600" />
              N={ctx.symbolCount}
            </span>
            <Dot />
            <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-gray-500" style={{ fontWeight: 500 }}>
              <span className={`w-1.5 h-1.5 rounded-full ${ctx.run_status === 'complete' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {ctx.run_status}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return <span className="w-0.5 h-0.5 rounded-full bg-[#2a3545] shrink-0" />;
}

// ── Detail Header ────────────────────────────────────────
function DetailHeader({ symbolLabel }: { symbolLabel: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2a3a]/80" style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-5 h-12">
        {/* Left: Back + symbol */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-cyan-400 transition-colors px-2 py-1 rounded-md hover:bg-cyan-500/5 shrink-0"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanner</span>
          </button>
          <div className="h-4 w-px bg-[#1e2a3a] shrink-0" />
          <span className="text-[15px] text-gray-100 truncate" style={{ fontWeight: 600 }}>
            {symbolLabel}
          </span>
          <span className="text-[11px] text-gray-600 hidden sm:inline shrink-0" style={{ fontWeight: 400 }}>
            Candidate Detail
          </span>
        </div>

        {/* Right: Brand + user */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-cyan-400/70" />
            </div>
            <span className="text-[11px] text-gray-500 tracking-tight hidden sm:inline" style={{ fontWeight: 500 }}>BNinmyhands</span>
          </div>

          <div className="h-4 w-px bg-[#1e2a3a]" />

          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/15 transition-colors"
            >
              <span className="text-[9px] text-cyan-400" style={{ fontWeight: 600 }}>
                {user.displayName.charAt(0).toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-cyan-400/80 bg-cyan-500/6 border border-cyan-500/15 rounded-lg hover:bg-cyan-500/12 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <LogIn className="w-3 h-3" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Unavailable Panel ────────────────────────────────────
function UnavailablePanel({ icon: Icon, title, message }: { icon: typeof AlertTriangle; title: string; message: string }) {
  const navigate = useNavigate();
  const iconBg = Icon === SearchX ? 'bg-amber-500/5 border-amber-500/15' : 'bg-gray-500/5 border-gray-600/15';
  const iconColor = Icon === SearchX ? 'text-amber-400/60' : 'text-gray-500';

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-20" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-sm text-center">
        <div className={`w-12 h-12 rounded-xl ${iconBg} border flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h2 className="text-[15px] text-gray-300 mb-2" style={{ fontWeight: 600 }}>{title}</h2>
        <p className="text-[12px] text-gray-600 leading-relaxed">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-5 py-2 text-[12px] text-cyan-400 bg-cyan-500/8 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/15 transition-colors"
          style={{ fontWeight: 500 }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export function CoinDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const previewState = searchParams.get('state') || 'ready';

  const timeframe = searchParams.get('timeframe') || '4h';
  const runId = searchParams.get('run_id') || 'run_vptd5wa1';
  const upperSymbol = (symbol || '').toUpperCase();

  const invalidTimeframe = !validTimeframes.includes(timeframe);
  const invalidRunId = !runId || !runId.startsWith('run_');
  const symbolNotFound = previewState !== 'unavailable' && !invalidTimeframe && !invalidRunId && !validSymbols.includes(upperSymbol);
  const hasError = invalidTimeframe || invalidRunId || symbolNotFound;

  const ctx = useMemo(() => {
    if (invalidTimeframe || invalidRunId) return null;
    const c = getRunContext(timeframe as Timeframe);
    c.run_id = runId;
    return c;
  }, [timeframe, runId, invalidTimeframe, invalidRunId]);

  const loading = previewState === 'loading';
  const coin: CoinDetailData | null = useMemo(() => {
    if (hasError || previewState === 'unavailable') return null;
    return generateCoinDetail(upperSymbol);
  }, [hasError, previewState, upperSymbol]);
  const history: HistoryRow[] = useMemo(() => {
    if (hasError || previewState === 'unavailable') return [];
    return generateHistory(upperSymbol);
  }, [hasError, previewState, upperSymbol]);

  // ── Shell: header + context bar + footer always visible ──
  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col">
      <DetailHeader symbolLabel={upperSymbol || '???'} />
      <ContextBar timeframe={timeframe} runId={runId} ctx={ctx} />
      {children}
      <Disclaimer />
    </div>
  );

  // ── Error states ──
  if (invalidTimeframe) return shell(<UnavailablePanel icon={FileWarning} title="Invalid Timeframe" message={`"${timeframe}" is not a valid timeframe. Supported values are 1h, 4h, and 24h.`} />);
  if (invalidRunId) return shell(<UnavailablePanel icon={FileWarning} title="Invalid Run ID" message={`The run_id "${runId || '(empty)'}" is not recognized. Please navigate from the scanner dashboard.`} />);
  if (previewState === 'unavailable') return shell(<UnavailablePanel icon={SearchX} title="No Data Available" message={`Detail data for ${upperSymbol} could not be loaded for this run.`} />);
  if (symbolNotFound) return shell(<UnavailablePanel icon={SearchX} title="Symbol Not Found" message={`"${upperSymbol}" was not found in run ${runId}. It may not be tracked or was excluded from this scan.`} />);

  // ── Loading state with skeleton ──
  if (loading) {
    return shell(
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0c1018] border border-[#1e2a3a] flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-cyan-500/40 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-[12px] text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Loading {upperSymbol}...</span>
        </div>
        {/* Skeleton hints */}
        <div className="w-full max-w-2xl space-y-3">
          <div className="h-24 rounded-lg bg-[#0c1018] border border-[#1e2a3a]/50 animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-[#0c1018] border border-[#1e2a3a]/50 animate-pulse" />
            ))}
          </div>
          <div className="h-32 rounded-lg bg-[#0c1018] border border-[#1e2a3a]/50 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── No data fallback ──
  if (!coin) return shell(<UnavailablePanel icon={SearchX} title="No Data Available" message={`Detail data for ${upperSymbol} could not be loaded for this run.`} />);

  const bm = bucketMeta[coin.bucket];
  const BucketIcon = bm.icon;

  // ── Ready state — analysis-first content ──
  return shell(
    <div className="max-w-[1600px] mx-auto px-4 sm:px-5 py-5 flex flex-col gap-5 flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Subtle trust framing ─────────────────── */}
      <div className="flex items-center gap-2 -mb-2">
        <span className="w-1 h-1 rounded-full bg-gray-700 shrink-0" />
        <span className="text-[10px] text-gray-700 tracking-wide">
          Research / educational — derived from scanner run snapshot, not live data
        </span>
      </div>

      {/* ── Why This Coin (explanation-first) ─────── */}
      <section>
        <SectionLabel>Why This Coin</SectionLabel>
        <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded border ${bm.bg} ${bm.border} ${bm.color}`}>
              <BucketIcon className="w-3 h-3" />
              {bm.label}
            </span>
            {coin.reasons.map(r => (
              <span key={r} className="text-[10px] text-gray-500 bg-[#141a24] border border-[#1e2a3a]/60 px-2 py-1 rounded">
                {r}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-gray-400 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />
            {coin.reasonExplanation}
          </p>
        </div>
      </section>

      {/* ── Score Cards ──────────────────────────── */}
      <section>
        <SectionLabel>Scores</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <ScoreCard label="Composite" value={coin.composite} accent="cyan" />
          <ScoreCard label="Momentum" value={coin.momentum} accent="emerald" />
          <ScoreCard label="Setup" value={coin.setup} accent="violet" />
          <ScoreCard label="Positioning" value={coin.positioning} accent="blue" />
          <ScoreCard label="Risk Penalty" value={coin.riskPenalty} accent="red" invert />
          <ScoreCard label="Data Quality" value={coin.dataQuality} accent="gray" />
        </div>
      </section>

      {/* ── Latest + Delta Metrics ───────────────── */}
      <section>
        <SectionLabel>Latest &amp; Delta Metrics</SectionLabel>
        <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <MetricCell label="Bucket">
              <span className={`flex items-center gap-1.5 text-[11px] ${bm.color}`}>
                <BucketIcon className="w-3 h-3" /> {bm.label}
              </span>
            </MetricCell>
            <MetricCell label="Last Price">
              <span className="text-gray-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtPrice(coin.last)}</span>
            </MetricCell>
            <MetricCell label="24h %">
              <span className={deltaColor(coin.change24h)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.change24h)}%</span>
            </MetricCell>
            <MetricCell label="Volume">
              <span className="text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtVol(coin.volume)}</span>
            </MetricCell>
            <MetricCell label="Prev Rank">
              <span className="text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>#{coin.prevRank}</span>
            </MetricCell>
            <MetricCell label="Rank Δ"><DeltaBadge value={coin.rankDelta} /></MetricCell>
            <MetricCell label="Composite Δ">
              <span className={deltaColor(coin.compositeDelta)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.compositeDelta)}</span>
            </MetricCell>
            <MetricCell label="Setup Δ">
              <span className={deltaColor(coin.setupDelta)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.setupDelta)}</span>
            </MetricCell>
            <MetricCell label="Positioning Δ">
              <span className={deltaColor(coin.positioningDelta)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.positioningDelta)}</span>
            </MetricCell>
            <MetricCell label="OI %">
              <span className={deltaColor(coin.oiPercent)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.oiPercent)}%</span>
            </MetricCell>
            <MetricCell label="Taker Flow">
              <span className={deltaColor(coin.takerFlow)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(coin.takerFlow)}</span>
            </MetricCell>
            <MetricCell label="L/S Ratio">
              <span className="text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{coin.lsRatio.toFixed(2)}</span>
            </MetricCell>
          </div>
        </div>
      </section>

      {/* ── Funding Context Block ────────────────── */}
      <section>
        <SectionLabel>Funding Context</SectionLabel>
        <div className={`rounded-lg border p-4 sm:p-5 ${
          coin.fundingDirection === 'positive' ? 'bg-emerald-500/3 border-emerald-500/15' :
          coin.fundingDirection === 'negative' ? 'bg-red-500/3 border-red-500/15' :
          'bg-[#0c1018] border-[#1e2a3a]'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <MetricLabel>Latest Funding</MetricLabel>
              <span className={`text-lg ${deltaColor(coin.funding)}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                {(coin.funding * 100).toFixed(4)}%
              </span>
            </div>
            <div>
              <MetricLabel>Direction</MetricLabel>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] ${
                coin.fundingDirection === 'positive' ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/20' :
                coin.fundingDirection === 'negative' ? 'bg-red-500/8 text-red-400 border-red-500/20' :
                'bg-gray-500/5 text-gray-400 border-gray-600/20'
              }`} style={{ fontWeight: 500 }}>
                {coin.fundingDirection === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                 coin.fundingDirection === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {coin.fundingDirection.charAt(0).toUpperCase() + coin.fundingDirection.slice(1)}
              </span>
            </div>
            <div>
              <MetricLabel>Crowding Interpretation</MetricLabel>
              <p className="text-[11px] text-gray-400 leading-relaxed">{coin.crowdedInterpretation}</p>
            </div>
            <div>
              <MetricLabel>Risk Note</MetricLabel>
              <p className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-600" />
                {coin.riskNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent History Table ─────────────────── */}
      <section>
        <SectionLabel>Recent History</SectionLabel>
        {history.length === 0 ? (
          <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>No history available yet</p>
            <p className="text-[11px] text-gray-700 mt-1">History rows will appear after additional scanner runs.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-[#1e2a3a]">
              <table className="w-full text-[11px] min-w-[700px]">
                <thead>
                  <tr className="bg-[#080d14]">
                    {['Time', 'Last', 'Comp', 'Setup', 'Pos', 'OI%', 'Flow', 'L/S', 'Risk', 'Fund'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-gray-600 whitespace-nowrap border-b border-[#1e2a3a]"
                        style={{ fontWeight: 500, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em' }}
                      >{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => (
                    <tr key={i} className={`border-b border-[#1e2a3a]/30 hover:bg-[#0f1520] transition-colors ${i % 2 === 0 ? 'bg-[#070c12]' : 'bg-[#0a0f16]'}`}>
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-2 text-gray-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtPrice(row.last)}</td>
                      <td className="px-3 py-2"><MiniScore v={row.composite} /></td>
                      <td className="px-3 py-2"><MiniScore v={row.setup} /></td>
                      <td className="px-3 py-2"><MiniScore v={row.positioning} /></td>
                      <td className={`px-3 py-2 ${deltaColor(row.oiPercent)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(row.oiPercent)}%</td>
                      <td className={`px-3 py-2 ${deltaColor(row.flow)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{delta(row.flow)}</td>
                      <td className="px-3 py-2 text-gray-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.lsRatio.toFixed(2)}</td>
                      <td className={`px-3 py-2 ${row.riskPenalty > 20 ? 'text-red-400/70' : 'text-gray-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.riskPenalty.toFixed(1)}</td>
                      <td className={`px-3 py-2 ${deltaColor(row.funding)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(row.funding * 100).toFixed(3)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table footer */}
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <span className="text-[10px] text-gray-700">
                {history.length} snapshots
              </span>
              <span className="text-[10px] text-gray-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {timeframe} · {runId}
              </span>
            </div>
          </>
        )}
      </section>

      {/* ── Analysis / Community boundary ────────── */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-[#1e2a3a]/30" />
        <span className="text-[9px] text-gray-700 uppercase tracking-[0.15em] shrink-0" style={{ fontWeight: 500 }}>
          Community Discussion
        </span>
        <div className="flex-1 h-px bg-[#1e2a3a]/30" />
      </div>

      {/* ── Discussion Block ─────────────────────── */}
      <DiscussionBlock symbol={upperSymbol} />

      {/* ── Sponsored: detail_bottom ─────────────── */}
      <SponsoredSlot inline position="detail_bottom" showDisabledState />
    </div>
  );
}

// ── Shared Sub-components ─────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-2.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
      {children}
    </h3>
  );
}

function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] text-gray-600 uppercase tracking-[0.1em] block mb-1.5" style={{ fontWeight: 500 }}>
      {children}
    </span>
  );
}

function ScoreCard({ label, value, accent, invert }: { label: string; value: number; accent: string; invert?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = invert
    ? (value > 25 ? 'bg-red-400' : value > 10 ? 'bg-amber-400' : 'bg-emerald-400')
    : (value > 70 ? 'bg-emerald-400' : value > 40 ? 'bg-amber-400' : 'bg-red-400');

  const accentColors: Record<string, string> = {
    cyan: 'text-cyan-400', emerald: 'text-emerald-400', violet: 'text-violet-400',
    blue: 'text-blue-400', red: 'text-red-400', gray: 'text-gray-400',
  };

  return (
    <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-3.5">
      <span className="text-[10px] text-gray-600 uppercase tracking-[0.1em] block mb-2" style={{ fontWeight: 500 }}>{label}</span>
      <span className={`text-xl ${accentColors[accent] || 'text-gray-400'}`} style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
        {value.toFixed(1)}
      </span>
      <div className="mt-2.5 h-[3px] bg-[#141a24] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} opacity-50`} style={{ width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function MetricCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5 border-b border-r border-[#1e2a3a]/40">
      <span className="text-[9px] text-gray-600 uppercase tracking-[0.1em] block mb-1" style={{ fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function DeltaBadge({ value }: { value: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${deltaColor(value)}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {value > 0 ? <ArrowUp className="w-3 h-3" /> : value < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {Math.abs(value)}
    </span>
  );
}

function MiniScore({ v }: { v: number }) {
  const bg = v > 70 ? 'bg-emerald-500/10 text-emerald-400/80' : v > 40 ? 'bg-gray-500/5 text-gray-400' : 'bg-red-500/8 text-red-400/70';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded ${bg}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {v.toFixed(1)}
    </span>
  );
}
