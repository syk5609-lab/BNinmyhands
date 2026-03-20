"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

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
    `text-sm transition ${pathname === href ? "text-emerald-300" : "text-zinc-300 hover:text-zinc-100"}`;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-100">
            BN Futures Heat Scanner
          </Link>
          <nav className="hidden items-center gap-3 sm:flex">
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
            <span className="text-xs text-zinc-500">Loading account...</span>
          ) : user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-zinc-100">{user.nickname}</p>
                <p className="text-xs text-zinc-400">{user.role}</p>
              </div>
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
              >
                Account
              </Link>
              <Button type="button" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
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
