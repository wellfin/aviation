"use client";

import { publicConfig } from "@/lib/public-config";

/**
 * Browser → backend API client (/api/v1). Used by forms and auth.
 * When NEXT_PUBLIC_DATA_SOURCE=mock, requests are simulated locally so the UI
 * can be exercised end-to-end before the backend exists.
 */

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

export type MockHandler = (body: unknown) => unknown;

const mockHandlers = new Map<string, MockHandler>();

/** Register a simulated response for an endpoint (mock mode only). */
export function registerMock(method: string, path: string, handler: MockHandler): void {
  mockHandlers.set(`${method.toUpperCase()} ${path}`, handler);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiRequest<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
  if (publicConfig.dataSource === "mock") {
    await delay(500);
    const handler = mockHandlers.get(`${method} ${path}`);
    // Handlers throw ApiError to simulate validation / auth failures.
    return (handler ? handler(body) : { ok: true }) as T;
  }

  const res = await fetch(`${publicConfig.apiBaseUrl}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await res.json().catch(() => null)) as { data?: T; error?: ApiErrorBody } | null;
  if (!res.ok) {
    throw new ApiError(res.status, payload?.error ?? { code: "UNKNOWN", message: "Something went wrong. Please try again." });
  }
  return payload?.data as T;
}

export const apiPost = <T = { ok: true }>(path: string, body: unknown) => apiRequest<T>("POST", path, body);
