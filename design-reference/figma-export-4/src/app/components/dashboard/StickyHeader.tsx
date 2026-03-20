import { RunContext } from '../../data/mockData';
import { useAuth } from '../../data/authContext';
import { useNavigate, useLocation } from 'react-router';
import { Activity, Clock, Database, LogIn, Users, Shield, LayoutDashboard, ChevronDown, User } from 'lucide-react';
import { isFeatureEnabled } from '../../data/featureFlags';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  show: boolean;
  accent?: string;
}

export function StickyHeader({ ctx }: { ctx: RunContext }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ingestionLabel = ctx.ingestionHealth === 'healthy' ? 'OK' : ctx.ingestionHealth === 'degraded' ? 'DELAYED' : 'ERROR';
  const ingestionDot =
    ctx.ingestionHealth === 'healthy' ? 'bg-emerald-400' : ctx.ingestionHealth === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
  const runDot = ctx.run_status === 'complete' ? 'bg-emerald-400' : 'bg-amber-400';

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { label: 'Community', path: '/community', icon: Users, show: isFeatureEnabled('communityEnabled') },
    { label: 'Admin', path: '/admin', icon: Shield, show: user?.role === 'admin', accent: 'amber' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2a3a]/80" style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Primary bar ── */}
      <div className="flex items-center justify-between max-w-[1600px] mx-auto px-4 sm:px-5 h-12">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Brand mark */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 mr-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[14px] text-gray-100 tracking-tight hidden sm:block" style={{ fontWeight: 600 }}>
              BNinmyhands
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center ml-1">
            <div className="h-5 w-px bg-[#1e2a3a]/80 mx-2" />
            {navItems.filter(n => n.show).map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const accentClass = item.accent === 'amber'
                ? (active ? 'text-amber-400 bg-amber-500/8' : 'text-gray-500 hover:text-amber-400/70')
                : (active ? 'text-gray-200 bg-[#141c28]' : 'text-gray-500 hover:text-gray-300');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all duration-150 ${accentClass}`}
                  style={{ fontWeight: 500 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {active && <span className="w-1 h-1 rounded-full bg-cyan-400 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: User + mobile menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User area */}
          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 text-[11px] rounded-md hover:bg-[#111827]/60 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="text-[9px] text-cyan-400" style={{ fontWeight: 600 }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-400 hidden lg:inline">{user.displayName}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-cyan-400 bg-cyan-500/8 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/15 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-[#111827]/60 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Run-context metadata strip ── */}
      <div className="border-t border-[#1e2a3a]/40 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-[1600px] mx-auto px-4 sm:px-5 py-1.5 min-w-max">
          {/* Timeframe chip */}
          <span className="h-5 px-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 flex items-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            {ctx.timeframe}
          </span>

          <Dot />

          {/* Timestamp */}
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock className="w-3 h-3 text-gray-600" />
            {new Date(ctx.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>

          {/* Data age */}
          <span className="text-[10px] text-gray-600">
            {ctx.dataAge}
          </span>

          <Dot />

          {/* Run ID */}
          <span className="text-[10px] text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {ctx.run_id}
          </span>

          <Dot />

          {/* Symbol count */}
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Database className="w-3 h-3 text-gray-600" />
            N={ctx.symbolCount}
          </span>

          <Dot />

          {/* Run status */}
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-gray-500" style={{ fontWeight: 500 }}>
            <span className={`w-1.5 h-1.5 rounded-full ${runDot}`} />
            RUN {ctx.run_status}
          </span>

          {/* Ingestion status */}
          <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-gray-500" style={{ fontWeight: 500 }}>
            <span className={`w-1.5 h-1.5 rounded-full ${ingestionDot}`} />
            INGESTION {ingestionLabel}
          </span>
        </div>
      </div>

      {/* ── Mobile nav dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e2a3a]/40 px-4 py-2 flex flex-col gap-0.5">
          {navItems.filter(n => n.show).map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 text-[12px] rounded-md transition-colors w-full text-left ${
                  active ? 'text-gray-200 bg-[#141c28]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#0f1520]'
                }`}
                style={{ fontWeight: 500 }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto" />}
              </button>
            );
          })}
          {user && (
            <button
              onClick={() => { navigate('/account'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-gray-500 hover:text-gray-300 rounded-md hover:bg-[#0f1520] w-full text-left"
              style={{ fontWeight: 500 }}
            >
              <User className="w-4 h-4" />
              Account
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function Dot() {
  return <span className="w-0.5 h-0.5 rounded-full bg-[#2a3545] shrink-0" />;
}
