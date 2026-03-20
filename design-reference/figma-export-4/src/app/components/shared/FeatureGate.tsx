import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { isFeatureEnabled, type FeatureFlags } from '../../data/featureFlags';

interface Props {
  flag: keyof FeatureFlags;
  children: ReactNode;
  label?: string;
}

export function FeatureGate({ flag, children, label }: Props) {
  if (isFeatureEnabled(flag)) return <>{children}</>;

  return (
    <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-8 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-10 h-10 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-4 h-4 text-gray-600" />
      </div>
      <p className="text-[13px] text-gray-400" style={{ fontWeight: 500 }}>
        {label || 'Feature Not Available'}
      </p>
      <p className="text-[11px] text-gray-600 mt-1">
        This feature is currently disabled. It may be enabled in a future update.
      </p>
    </div>
  );
}

/** Full-page disabled state */
export function FeatureDisabledPage({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-sm text-center px-5">
        <div className="w-14 h-14 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-[15px] text-gray-300 mb-2" style={{ fontWeight: 600 }}>{label}</h2>
        <p className="text-[12px] text-gray-600 leading-relaxed">
          This section is not yet available. Check back soon.
        </p>
      </div>
    </div>
  );
}
