import "server-only";
import { config } from "@/lib/config";

export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

type QueryValue = string | number | boolean | undefined | null;

export function buildQuery(params: Record<string, QueryValue>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** GET a JSON resource from the platform backend (/api/v1/...). Returns null on 404. */
export async function apiGet<T>(path: string, init?: { revalidate?: number }): Promise<T | null> {
  const res = await fetch(`${config.API_BASE_URL}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: init?.revalidate ?? 60 },
    signal: AbortSignal.timeout(config.INTEGRATION_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new UpstreamError(`API ${path} failed`, res.status);
  const body = (await res.json()) as { data: T };
  return body.data;
}

/** Fetch JSON from a third-party integration with a timeout. */
export async function fetchJson<T>(url: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const { revalidate, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { Accept: "application/json", ...(rest.headers ?? {}) },
    next: { revalidate: revalidate ?? 300 },
    signal: AbortSignal.timeout(config.INTEGRATION_TIMEOUT_MS),
  });
  if (!res.ok) throw new UpstreamError(`Upstream request failed (${res.status})`, res.status);
  return (await res.json()) as T;
}
