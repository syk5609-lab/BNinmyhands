"use client";

import { usePreviewRuntime } from "./preview-runtime";

export function useFeatureFlags() {
  const runtime = usePreviewRuntime();
  return {
    sponsoredAdsEnabled: runtime.searchParams.get("ads") !== "off",
    discussionEnabled: true,
    communityEnabled: true,
  };
}
