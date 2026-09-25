import "server-only";
import { config } from "@/lib/config";
import { ADS } from "@/lib/mock/ads";
import { FAQS } from "@/lib/mock/faq";
import { NEWS } from "@/lib/mock/news";
import type { Advertisement, FaqItem, NewsArticle, NewsCategory, Paginated } from "@/lib/types";
import { paginate } from "@/lib/utils";
import { apiGet, buildQuery } from "./http";

export interface NewsQuery {
  q?: string;
  category?: NewsCategory | "all";
  page?: number;
  pageSize?: number;
}

export async function listNews(query: NewsQuery = {}): Promise<Paginated<NewsArticle>> {
  const { q = "", category = "all", page = 1, pageSize = 9 } = query;
  if (config.DATA_SOURCE === "mock") {
    const needle = q.trim().toLowerCase();
    const list = NEWS.filter(
      (n) => (category === "all" || n.category === category) && (!needle || `${n.title} ${n.excerpt}`.toLowerCase().includes(needle)),
    ).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return paginate(list, page, pageSize);
  }
  return (
    (await apiGet<Paginated<NewsArticle>>(`/news${buildQuery({ q, category, page, pageSize })}`)) ?? {
      items: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    }
  );
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  if (config.DATA_SOURCE === "mock") return NEWS.find((n) => n.slug === slug) ?? null;
  return apiGet<NewsArticle>(`/news/${encodeURIComponent(slug)}`);
}

export async function listFaqs(category?: string): Promise<FaqItem[]> {
  if (config.DATA_SOURCE === "mock") return category ? FAQS.filter((f) => f.category === category) : FAQS;
  return (await apiGet<FaqItem[]>(`/faqs${buildQuery({ category })}`)) ?? [];
}

export async function getAdvertisement(placement: Advertisement["placement"]): Promise<Advertisement | null> {
  if (config.DATA_SOURCE === "mock") return ADS.find((a) => a.placement === placement) ?? null;
  return apiGet<Advertisement>(`/ads/serve${buildQuery({ placement })}`, { revalidate: 300 });
}
