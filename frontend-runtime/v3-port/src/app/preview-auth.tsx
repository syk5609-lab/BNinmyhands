"use client";

import { usePreviewRuntime } from "./preview-runtime";

export function useAuth() {
  return {
    user: usePreviewRuntime().user,
  };
}
