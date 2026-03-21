import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/auth/auth-provider";
import { ChromeGate } from "@/components/layout/chrome-gate";

export const metadata: Metadata = {
  title: "BN Futures Heat Scanner",
  description: "Binance USDⓈ-M futures scanner dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <AuthProvider>
          <ChromeGate>{children}</ChromeGate>
        </AuthProvider>
      </body>
    </html>
  );
}
