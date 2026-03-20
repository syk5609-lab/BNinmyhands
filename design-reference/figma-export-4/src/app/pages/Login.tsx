import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '../data/authContext';
import {
  Activity, AlertCircle, Loader2, Eye, EyeOff,
  ArrowLeft, MessageSquare, BarChart2,
} from 'lucide-react';
import { Disclaimer } from '../components/shared/PageShell';

// ── Types ─────────────────────────────────────────────────
type FieldErrors = { email?: string; password?: string };

// ── Redirect-context banner ────────────────────────────────
function RedirectNotice({ from }: { from: string }) {
  const messages: Record<string, { icon: typeof MessageSquare; text: string }> = {
    discussion: {
      icon: MessageSquare,
      text: 'Sign in to join the discussion on this candidate.',
    },
    default: {
      icon: BarChart2,
      text: 'Sign in to access this feature.',
    },
  };
  const { icon: Icon, text } = messages[from] ?? messages.default;
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5 mb-5">
      <Icon className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-px" />
      <p className="text-[11px] text-amber-300/70 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────
function Field({
  label, hint, error, children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          className="text-[10px] text-gray-500 uppercase tracking-[0.12em]"
          style={{ fontWeight: 500 }}
        >
          {label}
        </label>
        {hint && !error && (
          <span className="text-[10px] text-gray-700">{hint}</span>
        )}
        {error && (
          <span className="text-[10px] text-red-400/80">{error}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────
function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  hasError,
  disabled,
  right,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  right?: React.ReactNode;
}) {
  const borderClass = hasError
    ? 'border-red-500/30 focus:border-red-500/50'
    : 'border-[#1e2a3a] focus:border-cyan-500/40';
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-[#080d14] border ${borderClass} rounded-lg px-3.5 py-2.5 text-[12px] text-gray-200 placeholder:text-gray-700 focus:outline-none transition-colors disabled:opacity-40 ${right ? 'pr-10' : ''}`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading, user } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [fieldErrors, setFieldErrors]   = useState<FieldErrors>({});

  const redirected   = searchParams.get('redirected') === '1';
  const redirectFrom = searchParams.get('from') || 'default';

  if (user) { navigate('/'); return null; }

  // ── Validation ──
  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!email.trim())    errs.email    = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
    if (!password)        errs.password = 'Required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    const ok = await login(email, password);
    if (ok) {
      navigate('/');
    } else {
      setError('No account found for these credentials.');
      setFieldErrors({ email: ' ', password: ' ' });
    }
  };

  return (
    <div
      className="min-h-screen bg-[#06090f] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Minimal top bar ── */}
      <div className="border-b border-[#1e2a3a]/60" style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)' }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-5 h-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-cyan-400 transition-colors px-2 py-1 rounded-md hover:bg-cyan-500/5"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Scanner</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="text-[12px] text-gray-500 tracking-tight hidden sm:inline" style={{ fontWeight: 500 }}>
              BNinmyhands
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[360px]">

          {/* Brand mark */}
          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/8 border border-cyan-500/25 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            <span className="text-[18px] text-gray-100 tracking-tight" style={{ fontWeight: 600 }}>
              BNinmyhands
            </span>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#0c1018]">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-[#1e2a3a]/50">
              <h1 className="text-[14px] text-gray-100 mb-0.5" style={{ fontWeight: 600 }}>
                Sign In
              </h1>
              <p className="text-[11px] text-gray-600">
                Access your scanner dashboard
              </p>
            </div>

            {/* Form body */}
            <div className="px-6 py-5">
              {/* Redirect context */}
              {redirected && <RedirectNotice from={redirectFrom} />}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {/* Email */}
                <Field label="Email" error={fieldErrors.email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); setError(''); }}
                    placeholder="demo@bn.dev"
                    hasError={!!fieldErrors.email}
                    disabled={loading}
                  />
                </Field>

                {/* Password */}
                <Field label="Password" error={fieldErrors.password}>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); setError(''); }}
                    placeholder="Your password"
                    hasError={!!fieldErrors.password}
                    disabled={loading}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="text-gray-600 hover:text-gray-400 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword
                          ? <EyeOff className="w-3.5 h-3.5" />
                          : <Eye className="w-3.5 h-3.5" />
                        }
                      </button>
                    }
                  />
                </Field>

                {/* Form-level error */}
                {error && (
                  <div className="flex items-start gap-2 text-[11px] text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-1 text-[12px] rounded-lg transition-all disabled:opacity-50 bg-cyan-500/12 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-500/35 active:scale-[0.99]"
                  style={{ fontWeight: 500 }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in…</span>
                    : 'Sign In'
                  }
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#1e2a3a]/50">
              <p className="text-[11px] text-gray-600 text-center">
                No account?{' '}
                <Link
                  to="/signup"
                  className="text-cyan-400/70 hover:text-cyan-400 transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-3 rounded-lg border border-[#1e2a3a]/30 bg-[#080d14] px-4 py-3">
            <p className="text-[10px] text-gray-700 text-center leading-relaxed">
              Demo accounts:{' '}
              <span className="text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>demo@bn.dev</span>
              {' '}or{' '}
              <span className="text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>admin@bn.dev</span>
              {' '}— any password
            </p>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
