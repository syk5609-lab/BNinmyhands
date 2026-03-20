import { useAuth } from '../../data/authContext';
import { useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import type { ReactNode } from 'react';

/** Renders children if logged in, otherwise a calm "sign in to access" prompt */
export function GuestGate({ children, action = 'access this feature' }: { children: ReactNode; action?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <>{children}</>;

  return (
    <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-8 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-center mx-auto mb-4">
        <LogIn className="w-4 h-4 text-cyan-400/60" />
      </div>
      <p className="text-[13px] text-gray-400 mb-1" style={{ fontWeight: 500 }}>
        Sign in to {action}
      </p>
      <p className="text-[11px] text-gray-600 mb-4">
        An account is required for community features.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="px-5 py-2 text-[12px] text-cyan-400 bg-cyan-500/8 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/15 transition-colors"
        style={{ fontWeight: 500 }}
      >
        Sign In
      </button>
    </div>
  );
}
