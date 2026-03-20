import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../data/authContext';
import { isFeatureEnabled } from '../data/featureFlags';
import {
  Activity, AlertCircle, Loader2, Eye, EyeOff,
  ArrowLeft, CheckCircle2, Lock,
} from 'lucide-react';
import { Disclaimer } from '../components/shared/PageShell';

// ── Constants ─────────────────────────────────────────────
const NICKNAME_MAX = 24;
const PASS_MIN = 6;

// ── Types ─────────────────────────────────────────────────
type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

// ── Password strength ─────────────────────────────────────
function passwordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= PASS_MIN) score++;
  if (pw.length >= 10) score++;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3;
}

const strengthMeta: Record<
  1 | 2 | 3,
  { label: string; color: string; bar: string }
> = {
  1: { label: 'Weak', color: 'text-red-400/70', bar: 'bg-red-500/50' },
  2: { label: 'Fair', color: 'text-amber-400/70', bar: 'bg-amber-500/50' },
  3: { label: 'Good', color: 'text-emerald-400/70', bar: 'bg-emerald-500/50' },
};

function PasswordStrengthBar({ password }: { password: string }) {
  const level = passwordStrength(password);
  if (!password) return null;
  const meta = strengthMeta[level as 1 | 2 | 3];
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {([1, 2, 3] as const).map(i => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
              level >= i ? meta.bar : 'bg-[#1e2a3a]'
            }`}
          />
        ))}
      </div>
      <span className={`text-[10px] ${meta.color} shrink-0`} style={{ fontWeight: 500 }}>
        {meta.label}
      </span>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────
function Field({
  label, error, hint, children,
}: {
  label: string;
  error?: string;
  hint?: string;
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
  maxLength,
  right,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  maxLength?: number;
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
        maxLength={maxLength}
        className={`w-full bg-[#080d14] border ${borderClass} rounded-lg px-3.5 py-2.5 text-[12px] text-gray-200 placeholder:text-gray-700 focus:outline-none transition-colors disabled:opacity-40 ${right ? 'pr-10' : ''}`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  );
}

// ── Signup Closed ─────────────────────────────────────────
function SignupClosed() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen bg-[#06090f] flex flex-col items-center justify-center px-5"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-[15px] text-gray-300 mb-2" style={{ fontWeight: 600 }}>
          Signup Closed
        </h2>
        <p className="text-[12px] text-gray-600 leading-relaxed mb-6">
          New account registration is not currently available. Check back soon.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 text-[12px] text-gray-400 bg-[#0c1018] border border-[#1e2a3a] rounded-lg hover:bg-[#111827] transition-colors"
          style={{ fontWeight: 500 }}
        >
          Back to Scanner
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function Signup() {
  const navigate = useNavigate();
  const { signup, loading, user } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess]         = useState(false);

  if (!isFeatureEnabled('signupEnabled')) return <SignupClosed />;
  if (user) { navigate('/'); return null; }

  // ── Validation ──
  function validate(): boolean {
    const errs: FieldErrors = {};
    const nick = displayName.trim();
    if (!nick)           errs.displayName = 'Required';
    else if (nick.length < 2) errs.displayName = 'Too short (min 2)';
    else if (/\s/.test(nick)) errs.displayName = 'No spaces allowed';

    if (!email.trim())   errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';

    if (!password)       errs.password = 'Required';
    else if (password.length < PASS_MIN) errs.password = `Min ${PASS_MIN} characters`;

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const clearField = (field: keyof FieldErrors) =>
    setFieldErrors(p => ({ ...p, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    const ok = await signup(email, displayName.trim(), password);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } else {
      setError('An account with this email already exists.');
      setFieldErrors(p => ({ ...p, email: 'Already registered' }));
    }
  };

  return (
    <div
      className="min-h-screen bg-[#06090f] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Minimal top bar ── */}
      <div
        className="border-b border-[#1e2a3a]/60"
        style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)' }}
      >
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
            <span
              className="text-[12px] text-gray-500 tracking-tight hidden sm:inline"
              style={{ fontWeight: 500 }}
            >
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
                Create Account
              </h1>
              <p className="text-[11px] text-gray-600">
                Join the derivatives research community
              </p>
            </div>

            {/* Form body */}
            <div className="px-6 py-5">
              {/* Success flash */}
              {success && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5 mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Account created — taking you to the scanner…
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                {/* Nickname */}
                <Field
                  label="Nickname"
                  error={fieldErrors.displayName}
                  hint={`${displayName.length}/${NICKNAME_MAX}`}
                >
                  <Input
                    value={displayName}
                    onChange={v => { if (v.length <= NICKNAME_MAX) { setDisplayName(v); clearField('displayName'); setError(''); } }}
                    placeholder="TraderAlpha"
                    hasError={!!fieldErrors.displayName}
                    disabled={loading || success}
                    maxLength={NICKNAME_MAX}
                  />
                </Field>

                {/* Email */}
                <Field label="Email" error={fieldErrors.email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={v => { setEmail(v); clearField('email'); setError(''); }}
                    placeholder="you@example.com"
                    hasError={!!fieldErrors.email}
                    disabled={loading || success}
                  />
                </Field>

                {/* Password */}
                <Field
                  label="Password"
                  error={fieldErrors.password}
                  hint={!fieldErrors.password ? `Min ${PASS_MIN} chars` : undefined}
                >
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={v => { setPassword(v); clearField('password'); setError(''); }}
                    placeholder={`At least ${PASS_MIN} characters`}
                    hasError={!!fieldErrors.password}
                    disabled={loading || success}
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
                  <PasswordStrengthBar password={password} />
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
                  disabled={loading || success}
                  className="w-full py-2.5 mt-1 text-[12px] rounded-lg transition-all disabled:opacity-50 bg-cyan-500/12 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-500/35 active:scale-[0.99]"
                  style={{ fontWeight: 500 }}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating account…</span>
                    : success
                    ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>
                    : 'Create Account'
                  }
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#1e2a3a]/50">
              <p className="text-[11px] text-gray-600 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Scope note */}
          <div className="mt-3 rounded-lg border border-[#1e2a3a]/30 bg-[#080d14] px-4 py-3">
            <p className="text-[10px] text-gray-700 text-center leading-relaxed">
              Community access only — no financial products. Research use.
            </p>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
