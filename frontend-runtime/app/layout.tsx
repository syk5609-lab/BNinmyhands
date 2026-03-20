import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "BN Futures Heat Scanner",
  description: "Binance USDⓈ-M futures scanner dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.76)]">
            <div className="mx-auto flex max-w-[1700px] flex-col gap-1 px-6 py-4 text-[11px] text-[color:var(--bn-text-faint)] sm:flex-row sm:items-center sm:justify-between">
              <p>Research / educational use only. Not financial advice.</p>
              <p>Persisted runs, community notes, and sponsored placements may be delayed, incomplete, or stale.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
