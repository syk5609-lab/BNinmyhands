import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../data/authContext';
import { getFeatureFlags, type FeatureFlags } from '../data/featureFlags';
import { Activity, ArrowLeft, Shield, ToggleLeft, ToggleRight, Users, Database, Zap, AlertTriangle } from 'lucide-react';
import { Disclaimer } from '../components/shared/PageShell';

const flagMeta: Record<keyof FeatureFlags, { label: string; description: string; icon: typeof Zap }> = {
  communityEnabled: { label: 'Community', description: 'Enable the community discussion feed and posting', icon: Users },
  discussionEnabled: { label: 'Coin Discussion', description: 'Enable per-coin discussion blocks on detail pages', icon: Users },
  sponsoredAdsEnabled: { label: 'Sponsored Ads', description: 'Display sponsored content slots on dashboard and community', icon: Zap },
  adminConsoleEnabled: { label: 'Admin Console', description: 'Allow admin users to access the admin console', icon: Shield },
  signupEnabled: { label: 'Signup', description: 'Allow new user registration', icon: Users },
};

// Mock admin stats
const stats = [
  { label: 'Total Users', value: '847', icon: Users },
  { label: 'Active Runs (24h)', value: '142', icon: Database },
  { label: 'Symbols Tracked', value: '200', icon: Zap },
  { label: 'Ingestion Errors', value: '0', icon: AlertTriangle },
];

export function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());

  // Auth gate
  if (!user) { navigate('/login'); return null; }
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#06090f] text-gray-100 flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-sm text-center px-5">
          <div className="w-14 h-14 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-6 h-6 text-red-400/60" />
          </div>
          <h2 className="text-[15px] text-gray-300 mb-2" style={{ fontWeight: 600 }}>Access Denied</h2>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Admin console access requires an admin role. Your current role is "{user.role}".
          </p>
          <button onClick={() => navigate('/')} className="mt-6 px-5 py-2 text-[12px] text-cyan-400 bg-cyan-500/8 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/15 transition-colors" style={{ fontWeight: 500 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e2a3a]/80" style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)' }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-3 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-cyan-500/5" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Scanner
            </button>
            <div className="h-4 w-px bg-[#1e2a3a]" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400/70" />
              <span className="text-[14px] text-gray-200" style={{ fontWeight: 600 }}>Admin Console</span>
            </div>
            <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded uppercase tracking-wider" style={{ fontWeight: 600 }}>
              Admin Only
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-cyan-400/70" />
            </div>
            <span className="text-[11px] text-gray-500 tracking-tight" style={{ fontWeight: 500 }}>BNinmyhands</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-6 flex-1 w-full flex flex-col gap-6">
        {/* Stats */}
        <section>
          <h3 className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-3" style={{ fontWeight: 500 }}>System Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.1em]" style={{ fontWeight: 500 }}>{s.label}</span>
                  </div>
                  <span className="text-xl text-gray-200" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                    {s.value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Flags */}
        <section>
          <h3 className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-3" style={{ fontWeight: 500 }}>Feature Flags</h3>
          <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
            {(Object.keys(flagMeta) as Array<keyof FeatureFlags>).map((key, i) => {
              const meta = flagMeta[key];
              const Icon = meta.icon;
              const isOn = flags[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-[#1e2a3a]/50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-500/5 border border-gray-600/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-gray-300 block" style={{ fontWeight: 500 }}>{meta.label}</span>
                    <span className="text-[10px] text-gray-600 block mt-0.5">{meta.description}</span>
                  </div>
                  <button
                    onClick={() => toggleFlag(key)}
                    className="shrink-0 transition-colors"
                  >
                    {isOn ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-600" />
                    )}
                  </button>
                  <span className={`text-[9px] uppercase tracking-wider w-8 text-right ${isOn ? 'text-emerald-400/70' : 'text-gray-600'}`} style={{ fontWeight: 600 }}>
                    {isOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-700 mt-2">
            Note: Flag changes in this demo are visual only and do not persist across page reloads.
          </p>
        </section>
      </div>

      <Disclaimer />
    </div>
  );
}
