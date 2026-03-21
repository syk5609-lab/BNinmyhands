"use client";

import { useRouter } from "next/navigation";

import { usePreviewRuntime } from "./preview-runtime";

function buildPreservedQuery(searchParams: URLSearchParams) {
  const next = new URLSearchParams();
  ["ads", "guest", "state"].forEach((key) => {
    const value = searchParams.get(key);
    if (value) next.set(key, value);
  });
  return next;
}

export function useNavigate() {
  const router = useRouter();
  const runtime = usePreviewRuntime();

  return (target: string) => {
    const preserved = buildPreservedQuery(runtime.searchParams);

    if (target === "/") {
      const timeframe = runtime.searchParams.get("timeframe");
      if (timeframe) preserved.set("timeframe", timeframe);
      const query = preserved.toString();
      router.push(query ? `/preview/dashboard-v3?${query}` : "/preview/dashboard-v3");
      return;
    }

    if (target.startsWith("/coin/")) {
      const [path, query = ""] = target.split("?");
      const symbol = path.replace("/coin/", "");
      const nextQuery = new URLSearchParams(query);
      ["ads", "guest", "state"].forEach((key) => {
        const value = preserved.get(key);
        if (value) nextQuery.set(key, value);
      });
      router.push(`/preview/coin-v3/${symbol}?${nextQuery.toString()}`);
      return;
    }

    router.push(target);
  };
}

export function useLocation() {
  const runtime = usePreviewRuntime();
  return {
    pathname: runtime.pathname.includes("/preview/dashboard-v3") ? "/" : runtime.pathname,
  };
}

export function useParams<T extends Record<string, string>>() {
  return usePreviewRuntime().params as T;
}

export function useSearchParams() {
  return [usePreviewRuntime().searchParams] as const;
}
