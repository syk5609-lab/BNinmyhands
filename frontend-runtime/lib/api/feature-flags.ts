"use client";

import { AdminFeatureFlag, FeatureFlagKey, RuntimeFeatureFlags } from "@/lib/types/feature-flags";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class FeatureFlagsApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "FeatureFlagsApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveBaseUrl() {
  return process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function flagsJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : "Feature flag request failed.";
    throw new FeatureFlagsApiError(detail, response.status, payload);
  }

  return payload as T;
}

export function fetchRuntimeFlags() {
  return flagsJson<RuntimeFeatureFlags>("/runtime/flags", { method: "GET" });
}

export function fetchAdminFeatureFlags() {
  return flagsJson<AdminFeatureFlag[]>("/admin/feature-flags", { method: "GET" });
}

export function updateAdminFeatureFlag(key: FeatureFlagKey, enabled: boolean) {
  return flagsJson<AdminFeatureFlag>(`/admin/feature-flags/${key}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}
