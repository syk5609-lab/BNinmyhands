"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const linkClass = (href: string) =>
    [
      "inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium transition",
      pathname === href
        ? "bg-[rgba(82,213,255,0.14)] text-[var(--bn-text-strong)] shadow-[inset_0_0_0_1px_rgba(82,213,255,0.16)]"
        : "text-[color:var(--bn-text-muted)] hover:bg-white/[0.04] hover:text-[var(--bn-text-strong)]",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-linear-to-br from-cyan-400/18 to-cyan-400/5 text-xs font-semibold tracking-[0.2em] text-cyan-200">
              BN
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.02em] text-[var(--bn-text-strong)]">
                BNinmyhands
              </p>
              <p className="truncate text-[11px] text-[color:var(--bn-text-faint)]">Persisted futures scanner</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-[color:var(--bn-border-soft)] bg-[rgba(10,15,22,0.72)] p-1 md:flex">
            <Link href="/" className={linkClass("/")}>
              Dashboard
            </Link>
            <Link href="/community" className={linkClass("/community")}>
              Community
            </Link>
            {user?.role === "admin" ? (
              <Link href="/admin" className={linkClass("/admin")}>
                Admin
              </Link>
            ) : null}
            <Link href="/account" className={linkClass("/account")}>
              Account
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-[color:var(--bn-text-faint)]">Loading account...</span>
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-[var(--bn-text-strong)]">{user.nickname}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--bn-text-faint)]">
                  {user.role}
                </p>
              </div>
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/14"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-lg border border-[color:var(--bn-border)] bg-[rgba(10,15,22,0.7)] px-3 py-2 text-sm font-medium text-[var(--bn-text)] transition hover:border-[color:var(--bn-text-faint)] hover:text-[var(--bn-text-strong)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-[color:var(--bn-border)] bg-[rgba(10,15,22,0.72)] px-3 py-2 text-sm font-medium text-[var(--bn-text)] transition hover:border-cyan-400/20 hover:text-[var(--bn-text-strong)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-400/20 bg-linear-to-r from-cyan-400/18 to-cyan-400/8 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:from-cyan-400/24 hover:to-cyan-400/12"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
