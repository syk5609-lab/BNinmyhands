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
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased flex flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 px-6 py-4 text-xs text-white/60">
            Research / educational use only. Not financial advice. Data may be delayed, incomplete, or stale.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
