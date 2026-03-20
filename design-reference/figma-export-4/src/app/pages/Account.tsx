import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../data/authContext';
import {
  Activity, ArrowLeft, User, Calendar, Shield, LogOut,
  CheckCircle2, Loader2, AlertCircle, LayoutDashboard,
  Users, KeyRound, ChevronDown, BadgeCheck, Mail,
} from 'lucide-react';
import { Disclaimer } from '../components/shared/PageShell';
import { isFeatureEnabled } from '../data/featureFlags';

// ── Tab types ─────────────────────────────────────────────
type Tab = 'profile' | 'security';

// ── Header ────────────────────────────────────────────────
function AccountHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { label: 'Community', path: '/community', icon: Users, show: isFeatureEnabled('communityEnabled') },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#1e2a3a]/80"
      style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-5 h-12">
        {/* Left */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Brand */}
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
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all text-gray-500 hover:text-gray-300"
                  style={{ fontWeight: 500 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
            <div className="h-5 w-px bg-[#1e2a3a]/80 mx-2" />
            {/* Active: Account */}
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md text-gray-200 bg-[#141c28]"
              style={{ fontWeight: 500 }}
            >
              <User className="w-3.5 h-3.5" />
              Account
              <span className="w-1 h-1 rounded-full bg-cyan-400 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
              <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="text-[9px] text-cyan-400" style={{ fontWeight: 600 }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 hidden lg:inline" style={{ fontWeight: 500 }}>
                {user.displayName}
              </span>
              {user.role === 'admin' && (
                <span
                  className="text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider hidden lg:inline"
                  style={{ fontWeight: 600 }}
                >
                  Admin
                </span>
              )}
            </div>
          )}
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-[#111827]/60 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e2a3a]/40 px-4 py-2 flex flex-col gap-0.5">
          {navItems.filter(n => n.show).map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-gray-500 hover:text-gray-300 rounded-md hover:bg-[#0f1520] transition-colors w-full text-left"
                style={{ fontWeight: 500 }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <span className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-gray-200 bg-[#141c28] rounded-md" style={{ fontWeight: 500 }}>
            <User className="w-4 h-4" />
            Account
          </span>
        </div>
      )}
    </header>
  );
}

// ── Profile avatar ────────────────────────────────────────
function Avatar({ initial, size = 'lg' }: { initial: string; size?: 'sm' | 'lg' }) {
  const s = size === 'lg'
    ? 'w-14 h-14 rounded-xl text-lg border-cyan-500/25'
    : 'w-9 h-9 rounded-lg text-sm border-cyan-500/20';
  return (
    <div
      className={`${s} bg-gradient-to-br from-cyan-500/12 to-cyan-600/5 border flex items-center justify-center shrink-0`}
    >
      <span className="text-cyan-400" style={{ fontWeight: 600 }}>
        {initial}
      </span>
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────
function RoleBadge({ role }: { role: 'user' | 'admin' }) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider"
        style={{ fontWeight: 600 }}
      >
        <Shield className="w-2.5 h-2.5" /> Admin
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] text-gray-500 bg-gray-500/8 border border-gray-600/15 px-1.5 py-0.5 rounded uppercase tracking-wider"
      style={{ fontWeight: 500 }}
    >
      Member
    </span>
  );
}

// ── Info row ──────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
  last = false,
}: {
  icon: typeof User;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3.5 px-5 py-3.5 ${!last ? 'border-b border-[#1e2a3a]/40' : ''}`}>
      <div className="w-7 h-7 rounded-md bg-[#0a0f16] border border-[#1e2a3a]/60 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[9px] text-gray-600 uppercase tracking-[0.12em] mb-0.5"
          style={{ fontWeight: 500 }}
        >
          {label}
        </p>
        <p
          className={`text-[12px] text-gray-400 truncate ${mono ? '' : ''}`}
          style={mono ? { fontFamily: 'JetBrains Mono, monospace' } : {}}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Save status ───────────────────────────────────────────
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Main Page ─────────────────────────────────────────────
export function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Local editable state (mock — not persisted)
  const [nickname, setNickname]   = useState(user?.displayName ?? '');
  const [bio, setBio]             = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Guard
  if (!user) { navigate('/login'); return null; }

  const BIO_MAX = 160;
  const NICK_MAX = 24;

  const nicknameChanged = nickname.trim() !== user.displayName;
  const bioChanged      = bio !== '';
  const hasChanges      = nicknameChanged || bioChanged;

  const handleSave = async () => {
    if (!hasChanges || saveStatus === 'saving') return;
    setSaveStatus('saving');
    // Simulate API call
    await new Promise(r => setTimeout(r, 900));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const joinDate = new Date(user.joinedAt).toLocaleDateString('en', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <AccountHeader />

      {/* ── Page content ── */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 flex flex-col gap-5">

        {/* ── Profile hero ── */}
        <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] p-5">
          <div className="flex items-center gap-4">
            <Avatar initial={user.displayName.charAt(0).toUpperCase()} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[15px] text-gray-100 truncate" style={{ fontWeight: 600 }}>
                  {user.displayName}
                </span>
                <RoleBadge role={user.role} />
                {/* Mock: always show verified for demo accounts */}
                {(user.email === 'demo@bn.dev' || user.email === 'admin@bn.dev') && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400/70 bg-cyan-500/8 border border-cyan-500/15 px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>
                    <BadgeCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-500 truncate">{user.email}</p>
              <p className="text-[10px] text-gray-700 mt-1">Joined {joinDate}</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 border-b border-[#1e2a3a]/50 pb-px">
          {([
            { id: 'profile' as Tab, label: 'Profile', icon: User },
            { id: 'security' as Tab, label: 'Security', icon: KeyRound },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-t-md border-b-2 transition-all -mb-px ${
                activeTab === id
                  ? 'text-gray-200 border-cyan-500/60 bg-[#0c1018]'
                  : 'text-gray-600 border-transparent hover:text-gray-400'
              }`}
              style={{ fontWeight: 500 }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Profile ── */}
        {activeTab === 'profile' && (
          <>
            {/* Editable fields */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1e2a3a]/50">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                  Edit Profile
                </p>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Nickname */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                      Nickname
                    </label>
                    <span className="text-[10px] text-gray-700">{nickname.length}/{NICK_MAX}</span>
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => { if (e.target.value.length <= NICK_MAX) setNickname(e.target.value); setSaveStatus('idle'); }}
                    maxLength={NICK_MAX}
                    placeholder="Your nickname"
                    className="w-full bg-[#080d14] border border-[#1e2a3a] rounded-lg px-3.5 py-2.5 text-[12px] text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                  {nickname.trim().length > 0 && nickname.trim().length < 2 && (
                    <p className="text-[10px] text-red-400/70">Must be at least 2 characters</p>
                  )}
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                      Bio
                    </label>
                    <span className="text-[10px] text-gray-700">{bio.length}/{BIO_MAX}</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={e => { if (e.target.value.length <= BIO_MAX) setBio(e.target.value); setSaveStatus('idle'); }}
                    maxLength={BIO_MAX}
                    placeholder="Short note about your trading style or research focus (optional)"
                    rows={3}
                    className="w-full bg-[#080d14] border border-[#1e2a3a] rounded-lg px-3.5 py-2.5 text-[12px] text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Save row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 h-8">
                    {saveStatus === 'saved' && (
                      <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/80">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="flex items-center gap-1.5 text-[11px] text-red-400/70">
                        <AlertCircle className="w-3.5 h-3.5" /> Failed to save
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saveStatus === 'saving' || saveStatus === 'saved'}
                    className="flex items-center gap-2 px-4 py-2 text-[12px] rounded-lg transition-all disabled:opacity-40 bg-cyan-500/12 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-500/35 active:scale-[0.99]"
                    style={{ fontWeight: 500 }}
                  >
                    {saveStatus === 'saving'
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                      : 'Save Changes'
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Read-only account info */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1e2a3a]/50">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                  Account Info
                </p>
              </div>
              <InfoRow icon={Mail}     label="Email"        value={user.email} />
              <InfoRow icon={User}     label="User ID"      value={user.id}     mono />
              <InfoRow icon={Shield}   label="Role"         value={<RoleBadge role={user.role} />} />
              <InfoRow
                icon={BadgeCheck}
                label="Verification"
                value={
                  (user.email === 'demo@bn.dev' || user.email === 'admin@bn.dev')
                    ? <span className="text-emerald-400/80">Verified</span>
                    : <span className="text-gray-600">Unverified</span>
                }
              />
              <InfoRow icon={Calendar} label="Joined"       value={joinDate} last />
            </div>

            {/* Danger zone */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1e2a3a]/50">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                  Session
                </p>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-gray-400" style={{ fontWeight: 500 }}>Sign out of BNinmyhands</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">You'll need to sign back in to access your account.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-[12px] text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors shrink-0 ml-4"
                  style={{ fontWeight: 500 }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Security ── */}
        {activeTab === 'security' && (
          <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1e2a3a]/50">
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>
                Security
              </p>
            </div>
            <div className="px-5 py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>
                Password Management
              </p>
              <p className="text-[11px] text-gray-700 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Password change and 2FA will be available in a future update.
              </p>
            </div>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
