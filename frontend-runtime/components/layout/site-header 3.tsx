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
      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
      item.accent === "amber"
        ? isActive(item.href)
          ? "bg-amber-500/8 text-amber-300"
          : "text-[color:var(--bn-text-faint)] hover:text-amber-300"
        : isActive(item.href)
          ? "bg-[#141c28] text-[var(--bn-text-strong)]"
          : "text-[color:var(--bn-text-faint)] hover:bg-[#0f1520] hover:text-[var(--bn-text)]",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--bn-border)] bg-[linear-gradient(180deg,rgba(8,13,20,0.96),rgba(10,16,25,0.94))] backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <span className="bn-mono text-[11px] font-semibold">BN</span>
            </span>
            <span className="truncate text-[14px] font-semibold tracking-tight text-[var(--bn-text-strong)]">
              BNinmyhands
            </span>
          </Link>

          <div className="hidden h-5 w-px bg-[color:var(--bn-border)] md:block" />

          <nav className="hidden items-center gap-0.5 md:flex">
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
            <span className="text-[11px] text-[color:var(--bn-text-faint)]">Loading account...</span>
          ) : user ? (
            <>
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--bn-text)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text-strong)] sm:inline-flex"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/18 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">
                  {user.nickname.charAt(0).toUpperCase()}
                </span>
                <span className="hidden lg:inline">{user.nickname}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--bn-text-faint)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text)] sm:inline-flex"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-400/14"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--bn-text-faint)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text)] sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--bn-text-faint)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text)] md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`text-sm transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}>v</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-[color:var(--bn-border-soft)] px-4 py-2 md:hidden">
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
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium text-[color:var(--bn-text)] transition-colors hover:bg-[#0f1520]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/18 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">
                    {user.nickname.charAt(0).toUpperCase()}
                  </span>
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] font-medium text-[color:var(--bn-text-faint)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text)]"
                >
                  <span className="bn-mono text-[11px]">x</span>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex rounded-md px-3 py-2 text-[12px] font-medium text-cyan-200 transition-colors hover:bg-cyan-400/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex rounded-md px-3 py-2 text-[12px] font-medium text-[color:var(--bn-text-faint)] transition-colors hover:bg-[#0f1520] hover:text-[var(--bn-text)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
