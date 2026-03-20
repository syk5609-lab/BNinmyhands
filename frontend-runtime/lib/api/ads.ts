"use client";

import { AdCreativeStatus, AdEventType, AdminAdCreative, AdminAdSlot, AdPlacement, AdSlotRender } from "@/lib/types/ads";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class AdsApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AdsApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveBaseUrl() {
  return process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function adsJson<T>(path: string, init?: RequestInit): Promise<T> {
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
        : "Ads request failed.";
    throw new AdsApiError(detail, response.status, payload);
  }

  return payload as T;
}

export function fetchAdSlots(placement: AdPlacement) {
  const search = new URLSearchParams({ placement });
  return adsJson<AdSlotRender[]>(`/ads/slots?${search.toString()}`, { method: "GET" });
}

export async function logAdEvent(slotId: number, creativeId: number, eventType: AdEventType) {
  const baseUrl = resolveBaseUrl();
  const body = JSON.stringify({
    slot_id: slotId,
    creative_id: creativeId,
    event_type: eventType,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(`${baseUrl}/ads/events`, blob);
      return;
    }

    await fetch(`${baseUrl}/ads/events`, {
      method: "POST",
      body,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Best-effort logging only.
  }
}

export function fetchAdminAdSlots() {
  return adsJson<AdminAdSlot[]>("/admin/ads/slots", { method: "GET" });
}

export function updateAdminAdSlot(slotId: number, payload: { label?: string; enabled?: boolean; priority?: number }) {
  return adsJson<AdminAdSlot>(`/admin/ads/slots/${slotId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminAdCreatives() {
  return adsJson<AdminAdCreative[]>("/admin/ads/creatives", { method: "GET" });
}

export function createAdminAdCreative(payload: {
  slot_id: number;
  title: string;
  body_copy?: string | null;
  image_url?: string | null;
  target_url: string;
  cta_label?: string | null;
  status: AdCreativeStatus;
  starts_at?: string | null;
  ends_at?: string | null;
}) {
  return adsJson<AdminAdCreative>("/admin/ads/creatives", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminAdCreative(
  creativeId: number,
  payload: {
    title?: string;
    body_copy?: string | null;
    image_url?: string | null;
    target_url?: string;
    cta_label?: string | null;
    status?: AdCreativeStatus;
    starts_at?: string | null;
    ends_at?: string | null;
  },
) {
  return adsJson<AdminAdCreative>(`/admin/ads/creatives/${creativeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
