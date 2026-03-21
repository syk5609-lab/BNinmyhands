"use client";

import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPreviewRoute = pathname?.startsWith("/preview") || pathname?.startsWith("/rebuild-preview");

  if (isPreviewRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.76)]">
        <div className="mx-auto flex max-w-[1700px] flex-col gap-1 px-6 py-4 text-[11px] text-[color:var(--bn-text-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>Research / educational use only. Not financial advice.</p>
          <p>Persisted runs, community notes, and sponsored placements may be delayed, incomplete, or stale.</p>
        </div>
      </footer>
    </>
  );
}
