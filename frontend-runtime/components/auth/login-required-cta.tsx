"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function LoginRequiredCTA({
  title = "Login required",
  description = "Sign in to use this write action.",
}: {
  title?: string;
  description?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-4 text-sm text-zinc-300">
      <p className="font-medium text-zinc-100">{title}</p>
      <p className="mt-1 text-zinc-400">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
        >
          Log in
        </Link>
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="inline-flex items-center justify-center rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
