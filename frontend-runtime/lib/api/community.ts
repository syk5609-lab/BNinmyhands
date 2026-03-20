"use client";

import { MessageResponse } from "@/lib/types/auth";
import { CommunityPost, CommunityReport, CommunityReportReason } from "@/lib/types/community";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class CommunityApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "CommunityApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveBaseUrl() {
  return process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function communityJson<T>(path: string, init?: RequestInit): Promise<T> {
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
        : "Community request failed.";
    throw new CommunityApiError(detail, response.status, payload);
  }

  return payload as T;
}

export function fetchCommunityPosts(symbol: string, runId?: number) {
  const search = new URLSearchParams({ symbol });
  if (typeof runId === "number" && Number.isFinite(runId)) {
    search.set("run_id", String(runId));
  }
  return communityJson<CommunityPost[]>(`/community/posts?${search.toString()}`, { method: "GET" });
}

export function fetchLatestCommunityPosts(limit: number = 50) {
  const search = new URLSearchParams({ limit: String(limit) });
  return communityJson<CommunityPost[]>(`/community/latest?${search.toString()}`, { method: "GET" });
}

export function createCommunityPost(payload: { symbol: string; run_id?: number; body: string }) {
  return communityJson<CommunityPost>("/community/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteCommunityPost(postId: number) {
  return communityJson<MessageResponse>(`/community/posts/${postId}`, {
    method: "DELETE",
  });
}

export function reportCommunityPost(postId: number, reason: CommunityReportReason) {
  return communityJson<MessageResponse>("/community/reports", {
    method: "POST",
    body: JSON.stringify({ post_id: postId, reason }),
  });
}

export function fetchAdminReports() {
  return communityJson<CommunityReport[]>("/admin/reports", { method: "GET" });
}
