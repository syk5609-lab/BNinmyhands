"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";

type NavItem = {
  href: string;
  label: string;
  accent?: "amber";
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/community", label: "Community" },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", accent: "amber" as const }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href)) ?? false;

  const navClass = (item: NavItem) =>
    [
      "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-medium transition-colors",
      item.accent === "amber"
        ? isActive(item.href)
          ? "border border-amber-400/20 bg-amber-500/8 text-amber-300"
          : "text-[#6f7b90] hover:bg-[#0f1520] hover:text-amber-300"
        : isActive(item.href)
          ? "border border-cyan-400/18 bg-[#141c28] text-[#eef6ff]"
          : "text-[#6f7b90] hover:bg-[#0f1520] hover:text-[#b5c0d2]",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(30,42,58,0.88)] bg-[rgba(8,13,20,0.94)] backdrop-blur-xl">
      <div className="bn-dashboard-width mx-auto flex h-14 items-center justify-between px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(82,213,255,0.18),rgba(82,213,255,0.05))] text-[11px] font-semibold text-cyan-300">
              BN
            </span>
            <span className="truncate text-[14px] font-semibold tracking-tight text-[#f3f7fb]">BNinmyhands</span>
          </Link>

          <div className="ml-1 hidden h-5 w-px bg-[rgba(30,42,58,0.88)] bn-desktop-nav" />

          <nav className="bn-desktop-nav items-center gap-0.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClass(item)}>
                {item.label}
                {isActive(item.href) ? <span className="h-1 w-1 rounded-full bg-cyan-400" aria-hidden="true" /> : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-[11px] text-[#6f7b90]">Loading account...</span>
          ) : user ? (
            <>
              <Link
                href="/account"
                className="bn-desktop-user items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium text-[#a9b4c6] transition-colors hover:bg-[#111827]/60 hover:text-[#eef6ff]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">
                  {user.nickname.charAt(0).toUpperCase()}
                </span>
                <span className="hidden lg:inline">{user.nickname}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bn-desktop-user rounded-lg px-3 py-2 text-[11px] font-medium text-[#6f7b90] transition-colors hover:bg-[#111827]/60 hover:text-[#b5c0d2]"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-cyan-400/22 bg-[rgba(0,161,255,0.1)] px-3.5 py-2 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-[rgba(0,161,255,0.16)]"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="bn-mobile-toggle h-9 w-9 items-center justify-center rounded-lg text-[#6f7b90] transition-colors hover:bg-[#111827]/60 hover:text-[#b5c0d2]"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`text-sm transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}>v</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[rgba(30,42,58,0.4)] px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClass(item)} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account"
                  className="rounded-md px-3 py-2 text-[12px] font-medium text-[#b5c0d2] transition-colors hover:bg-[#0f1520]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-left text-[12px] font-medium text-[#6f7b90] transition-colors hover:bg-[#0f1520] hover:text-[#b5c0d2]"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-[12px] font-medium text-cyan-200 transition-colors hover:bg-[#0f1520]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
