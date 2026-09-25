import Image from "next/image";
import Link from "next/link";
import { Phone, Star } from "lucide-react";
import { TierBadge, VerifiedBadge } from "@/components/ui/Badge";
import { getCategory } from "@/lib/mock/categories";
import type { Provider } from "@/lib/types";
import { cn, flagEmoji, formatNumber } from "@/lib/utils";
import { FavoriteButton, ShareButton } from "./ProviderActions";

const CATEGORY_EMOJI: Record<string, string> = {
  fbo: "✈️",
  fuel: "⛽",
  catering: "🍽️",
  mro: "🔧",
  "ground-handler": "🛄",
  "trip-support": "🌍",
  permit: "📋",
  "ground-transportation": "🚘",
  "charter-operator": "🛩️",
  "charter-broker": "📑",
  "supervisory-agent": "🧑‍✈️",
  "meet-and-assist": "🤝",
};

export function ProviderCard({ provider, layout = "grid" }: { provider: Provider; layout?: "grid" | "list" }) {
  const category = getCategory(provider.category);
  const href = `/providers/${provider.slug}`;
  const showRating = provider.tier !== "basic";

  return (
    <article
      className={cn(
        "group flex overflow-hidden rounded-[20px] border border-brand/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card",
        layout === "grid" ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden bg-navy-900", layout === "grid" ? "h-[192px] w-full" : "h-[192px] w-full sm:h-auto sm:w-[300px]")}>
        <Image src={provider.coverImage} alt="" fill sizes="(max-width: 768px) 100vw, 440px" className="object-cover opacity-85 transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent to-50%" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <TierBadge tier={provider.tier} />
          {provider.verified && provider.tier === "ultra_pro" && <VerifiedBadge />}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <FavoriteButton providerId={provider.id} tone="dark" />
          <ShareButton title={provider.name} path={href} tone="dark" />
        </div>
        <span className="absolute bottom-3 left-3 text-[30px] drop-shadow" aria-hidden>
          {CATEGORY_EMOJI[provider.category] ?? "✈️"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base leading-6 font-bold text-ink">
            <Link href={href} className="hover:text-brand">
              {provider.name}
            </Link>
          </h3>
          {showRating && (
            <p className="flex shrink-0 items-center gap-1 text-xs" aria-label={`Rated ${provider.rating} out of 5 from ${provider.reviewCount} reviews`}>
              <Star className="size-3 fill-warning text-warning" aria-hidden />
              <span className="font-bold text-ink">{provider.rating.toFixed(1)}</span>
              <span className="text-subtle">({formatNumber(provider.reviewCount)})</span>
            </p>
          )}
        </div>
        <p className="mt-1 text-xs text-subtle">
          <span aria-hidden>{flagEmoji(provider.countryCode)}</span> {provider.country} · {category?.name ?? provider.category}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-[22.75px] text-muted">{provider.summary}</p>
        <div className="mt-4 flex items-center gap-2">
          <Link href={href} className="bg-brand-gradient flex h-10 flex-1 items-center justify-start rounded-[25px] px-7 text-[13px] font-semibold text-white transition hover:brightness-110">
            View Profile
          </Link>
          <a
            href={`tel:${provider.contact.phone.replace(/[^\d+]/g, "")}`}
            aria-label={`Call ${provider.name}`}
            className="flex size-10 items-center justify-center rounded-[12px] border border-brand/20 bg-brand/8 text-brand transition hover:bg-brand/12"
          >
            <Phone className="size-3.5" />
          </a>
          <ShareButton title={provider.name} path={href} tone="light" />
        </div>
      </div>
    </article>
  );
}
