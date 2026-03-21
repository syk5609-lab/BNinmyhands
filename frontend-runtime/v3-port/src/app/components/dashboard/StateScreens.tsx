"use client";

import { Loader2, WifiOff, AlertTriangle, Inbox, LogIn } from '../../lucide';
import { useNavigate } from '../../preview-router';
import { useAuth } from '../../preview-auth';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-12 h-12 rounded-xl bg-[#0c1018] border border-[#1e2a3a] flex items-center justify-center mb-5">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-500/60" />
      </div>
      <p className="text-[13px] text-gray-400" style={{ fontWeight: 500 }}>Loading scanner data</p>
      <p className="text-[11px] text-gray-600 mt-1.5">Fetching latest run results...</p>
      {/* Skeleton hint */}
      <div className="mt-8 w-full max-w-lg px-6">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-lg bg-[#0c1018] border border-[#1e2a3a]/50 animate-pulse" />
          ))}
        </div>
        <div className="mt-3 h-24 rounded-lg bg-[#0c1018] border border-[#1e2a3a]/50 animate-pulse" />
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center justify-center mb-5">
        <WifiOff className="w-5 h-5 text-red-400/60" />
      </div>
      <p className="text-[13px] text-red-400/80" style={{ fontWeight: 500 }}>Backend Unavailable</p>
      <p className="text-[11px] text-gray-600 mt-1.5 max-w-xs text-center leading-relaxed">
        Unable to fetch scanner data. The API may be undergoing maintenance. Please try again shortly.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-5 px-4 py-2 text-[11px] text-gray-400 bg-[#0c1018] border border-[#1e2a3a] rounded-lg hover:border-gray-600/50 transition-colors"
        style={{ fontWeight: 500 }}
      >
        Retry
      </button>
    </div>
  );
}

export function NoRunState() {
  return (
    <div className="flex flex-col items-center justify-center py-32" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-12 h-12 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-center mb-5">
        <AlertTriangle className="w-5 h-5 text-amber-400/60" />
      </div>
      <p className="text-[13px] text-amber-400/80" style={{ fontWeight: 500 }}>No Completed Run</p>
      <p className="text-[11px] text-gray-600 mt-1.5 max-w-xs text-center leading-relaxed">
        Waiting for the next scanner run to complete. Runs typically execute every 15 minutes.
      </p>
    </div>
  );
}

export function EmptyDataState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-12 h-12 rounded-xl bg-gray-500/5 border border-[#1e2a3a] flex items-center justify-center mb-5">
        <Inbox className="w-5 h-5 text-gray-600" />
      </div>
      <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>No Data Available</p>
      <p className="text-[11px] text-gray-600 mt-1.5 max-w-xs text-center leading-relaxed">
        {message || 'The latest run returned no candidates. This can happen when market conditions are unusually quiet.'}
      </p>
    </div>
  );
}

export function PartialRunBanner() {
  return (
    <div className="mx-4 sm:mx-5 max-w-[1600px] lg:mx-auto bg-amber-500/5 border border-amber-500/15 rounded-lg px-4 py-2.5 flex items-center gap-2.5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-400/70" />
      </div>
      <span className="text-[11px] text-amber-400/70">
        Partial run — some symbols may be missing or stale. Data will auto-refresh on next complete run.
      </span>
    </div>
  );
}

/** Subtle strip shown to guests — encourages sign-in without blocking analysis access */
export function GuestBrowsingBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return null;

  return (
    <div className="mx-4 sm:mx-5 max-w-[1600px] lg:mx-auto bg-[#0a0f16] border border-[#1e2a3a]/50 rounded-lg px-4 py-2 flex items-center justify-between gap-3 flex-wrap" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span className="text-[11px] text-gray-600 flex items-center gap-2">
        <LogIn className="w-3.5 h-3.5 text-gray-600" />
        Browsing as guest. Sign in to access community discussion and save preferences.
      </span>
      <button
        onClick={() => navigate('/login')}
        className="text-[10px] text-cyan-400/70 hover:text-cyan-400 transition-colors shrink-0"
        style={{ fontWeight: 500 }}
      >
        Sign in
      </button>
    </div>
  );
}

/** Subtle inline trust/research-use reminder strip */
export function TrustFramingStrip() {
  return (
    <div className="px-4 sm:px-5 max-w-[1600px] mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center gap-2 py-1.5">
        <span className="w-1 h-1 rounded-full bg-gray-700 shrink-0" />
        <span className="text-[10px] text-gray-600 tracking-wide">
          Research / educational use only — not financial advice. Scanner results are derived from persisted run snapshots, not live data.
        </span>
      </div>
    </div>
  );
}
