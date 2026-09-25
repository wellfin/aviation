import "server-only";
import { listProviders } from "@/lib/data/providers";
import type { Provider } from "@/lib/types";

/** All listed air charter operators (optionally narrowed by the API-supported name/country filters). */
export async function loadCharterOperators(query: { q?: string; country?: string } = {}): Promise<Provider[]> {
  const result = await listProviders({ category: "charter-operator", q: query.q, country: query.country, sort: "rating", pageSize: 500 });
  return result.items;
}
