"use client";

import { CurrentUser, LoginResponse, MessageResponse, SignupResponse, UpdateProfilePayload } from "@/lib/types/auth";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class AuthApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.details = details;
  }
}

function resolveBaseUrl() {
  return process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
}

async function authJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
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
        : "Request failed.";
    throw new AuthApiError(detail, response.status, payload);
  }

  return payload as T;
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return authJson<CurrentUser>("/auth/me", { method: "GET" });
}

export function signup(payload: { email: string; password: string; nickname?: string }) {
  return authJson<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return authJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return authJson<MessageResponse>("/auth/logout", { method: "POST" });
}

export function updateAccountProfile(payload: UpdateProfilePayload) {
  return authJson<CurrentUser>("/account/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function requestVerification(email: string) {
  return authJson<MessageResponse>("/auth/verify/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function requestPasswordReset(email: string) {
  return authJson<MessageResponse>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
