"use client";

import { createContext, useContext } from "react";
import { useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from "next/navigation";

type PreviewUser = {
  displayName: string;
  role: "member" | "admin";
};

type PreviewRuntimeValue = {
  pathname: string;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  user: PreviewUser | null;
  nowIso: string;
};

const PreviewRuntimeContext = createContext<PreviewRuntimeValue | null>(null);

export function PreviewRuntimeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const nextParams = useNextParams();
  const nextSearchParams = useNextSearchParams();
  const params = Object.fromEntries(Object.entries(nextParams).map(([key, value]) => [key, String(value)]));
  const searchParams = new URLSearchParams(nextSearchParams.toString());
  const guest = searchParams.get("guest") === "1";
  const user = guest ? null : { displayName: "Hunnit", role: "member" as const };

  const value: PreviewRuntimeValue = {
    pathname,
    params,
    searchParams,
    user,
    nowIso: "2026-03-20T20:52:00.000Z",
  };

  return <PreviewRuntimeContext.Provider value={value}>{children}</PreviewRuntimeContext.Provider>;
}

export function usePreviewRuntime() {
  const context = useContext(PreviewRuntimeContext);
  if (!context) {
    throw new Error("Preview runtime is unavailable.");
  }
  return context;
}
