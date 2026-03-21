import type { ReactNode } from 'react';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col">
      {children}
    </div>
  );
}

export function PageContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-[1600px] mx-auto px-5 py-5 flex-1 w-full ${className}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {children}
    </div>
  );
}

export function Disclaimer() {
  return (
    <footer className="border-t border-[#1e2a3a]/50 mt-auto px-5 py-5 max-w-[1600px] mx-auto w-full">
      <p className="text-[10px] text-gray-700 text-center tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
        Research / educational use only. Not financial advice. Data may be delayed, incomplete, or stale.
      </p>
    </footer>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-2.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
      {children}
    </h3>
  );
}
