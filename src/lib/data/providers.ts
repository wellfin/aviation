import "server-only";
import { config } from "@/lib/config";
import { PROVIDERS } from "@/lib/mock/providers";
import type { Paginated, Provider, ProviderQuery } from "@/lib/types";
import { paginate } from "@/lib/utils";
import { apiGet, buildQuery } from "./http";

const TIER_WEIGHT: Record<Provider["tier"], number> = { ultra_pro: 3, pro: 2, basic: 1 };

function matches(p: Provider, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [p.name, p.summary, p.city, p.country, p.category, ...p.airports.flatMap((a) => [a.icao, a.iata, a.name, a.city])]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((t) => hay.includes(t));
}

function queryMock(query: ProviderQuery): Paginated<Provider> {
  const { q = "", category = "all", tier = "all", country, airport, sort = "rating", page = 1, pageSize = 9 } = query;
  let list = PROVIDERS.filter((p) => matches(p, q));
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (tier !== "all") list = list.filter((p) => p.tier === tier);
  if (country) list = list.filter((p) => p.countryCode.toLowerCase() === country.toLowerCase());
  if (airport) {
    const code = airport.toUpperCase();
    list = list.filter((p) => p.airports.some((a) => a.icao === code || a.iata === code));
  }
  list = [...list].sort((a, b) => {
    // Paid tiers are always ranked first, as in the design.
    const tierDiff = TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier];
    if (tierDiff !== 0) return tierDiff;
    switch (sort) {
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return b.rating - a.rating;
    }
  });
  return paginate(list, page, pageSize);
}

export async function listProviders(query: ProviderQuery = {}): Promise<Paginated<Provider>> {
  if (config.DATA_SOURCE === "mock") return queryMock(query);
  const result = await apiGet<Paginated<Provider>>(`/providers${buildQuery({ ...query })}`);
  return result ?? { items: [], total: 0, page: 1, pageSize: query.pageSize ?? 9, totalPages: 1 };
}

export async function getProvider(slug: string): Promise<Provider | null> {
  if (config.DATA_SOURCE === "mock") return PROVIDERS.find((p) => p.slug === slug) ?? null;
  return apiGet<Provider>(`/providers/${encodeURIComponent(slug)}`);
}

export async function getRelatedProviders(provider: Provider, limit = 4): Promise<Provider[]> {
  if (config.DATA_SOURCE === "mock") {
    return PROVIDERS.filter((p) => p.slug !== provider.slug && (p.category === provider.category || p.countryCode === provider.countryCode)).slice(0, limit);
  }
  return (await apiGet<Provider[]>(`/providers/${encodeURIComponent(provider.slug)}/related${buildQuery({ limit })}`)) ?? [];
}

export async function getProvidersAtAirport(icao: string, category?: string): Promise<Provider[]> {
  const result = await listProviders({ airport: icao, category: (category as ProviderQuery["category"]) ?? "all", pageSize: 100 });
  return result.items;
}
