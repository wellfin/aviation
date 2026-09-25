"use client";

import { Check, Heart, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const FAVORITES_KEY = "ga_favorites";
const FAVORITES_EVENT = "ga:favorites";

function readRaw(): string {
  try {
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function readFavorites(): string[] {
  try {
    return JSON.parse(readRaw()) as string[];
  } catch {
    return [];
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(FAVORITES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(FAVORITES_EVENT, onChange);
  };
}

const TONE = {
  dark: "size-8 rounded-lg bg-navy-950/70 text-white backdrop-blur-sm hover:bg-navy-950/85",
  light: "size-10 rounded-[12px] border border-brand/20 bg-brand/8 text-brand hover:bg-brand/12",
} as const;

/**
 * Favourite toggle. Stored per-browser for now; once accounts exist the
 * backend will persist favourites for signed-in users.
 */
export function FavoriteButton({ providerId, tone = "dark" }: { providerId: string; tone?: keyof typeof TONE }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const saved = raw.includes(`"${providerId}"`);

  function toggle() {
    const favs = new Set(readFavorites());
    if (favs.has(providerId)) favs.delete(providerId);
    else favs.add(providerId);
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
    } catch {
      /* storage unavailable — favourite won't persist */
    }
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? "Remove from favourites" : "Save to favourites"} className={cn("flex items-center justify-center transition", TONE[tone])}>
      <Heart className={cn("size-4", saved && "fill-danger text-danger")} />
    </button>
  );
}

/** Uses the Web Share API when available, otherwise copies the link. */
export function ShareButton({ title, path, tone = "light", label }: { title: string; path: string; tone?: keyof typeof TONE; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share sheet */
    }
  }

  if (label) {
    return (
      <button type="button" onClick={share} className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-brand-cyan backdrop-blur-sm hover:bg-white/10">
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {copied ? "Link copied" : label}
      </button>
    );
  }

  return (
    <button type="button" onClick={share} aria-label={copied ? "Link copied" : `Share ${title}`} className={cn("flex items-center justify-center transition", TONE[tone])}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
    </button>
  );
}
