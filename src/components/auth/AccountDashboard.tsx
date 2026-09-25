"use client";

import { Building2, CloudSun, Heart, LogOut, Mail, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useAuth, type SessionUser } from "@/lib/auth/auth-context";

// Same browser storage the provider FavoriteButton writes to.
const FAVORITES_KEY = "ga_favorites";
const FAVORITES_EVENT = "ga:favorites";

function readFavoritesRaw(): string {
  try {
    return window.localStorage.getItem(FAVORITES_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribeFavorites(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(FAVORITES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(FAVORITES_EVENT, onChange);
  };
}

function countFavorites(raw: string): number {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

const ROLE_LABEL: Record<SessionUser["role"], { label: string; tone: "blue" | "green" | "purple" }> = {
  USER: { label: "Member", tone: "blue" },
  PROVIDER: { label: "Service Provider", tone: "green" },
  ADMIN: { label: "Administrator", tone: "purple" },
};

const LINKS = [
  { href: "/directory", title: "Browse the Directory", text: "FBOs, handlers, fuel, MRO & charter worldwide", icon: Search },
  { href: "/tools/weather", title: "Aviation Tools", text: "METAR, TAF, NOTAMs, runways & nearby airports", icon: CloudSun },
] as const;

export function AccountDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const favorites = countFavorites(useSyncExternalStore(subscribeFavorites, readFavoritesRaw, () => "[]"));

  useEffect(() => {
    if (!loading && !user && !signingOut) router.replace("/login?next=/account");
  }, [loading, user, signingOut, router]);

  async function handleLogout() {
    setSigningOut(true);
    await logout();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="container-site py-16" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your account…</span>
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  const role = ROLE_LABEL[user.role];
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <>
      <section className="bg-hero-navy text-white">
        <div className="container-site py-12 md:py-14">
          <Eyebrow tone="light">My Account</Eyebrow>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.6px] md:text-4xl">
            Welcome back, <span className="text-brand-gradient">{user.firstName}</span>
          </h1>
          <p className="mt-2 text-sm text-white/60">Your aviation command centre — saved providers, tools and account details.</p>
        </div>
      </section>

      <div className="container-site grid gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section aria-labelledby="profile-heading" className="rounded-card border border-line bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-4">
              <span aria-hidden className="bg-brand-gradient flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="profile-heading" className="truncate text-lg font-bold text-ink">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="flex items-center gap-1.5 truncate text-sm text-muted">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {user.email}
                </p>
              </div>
              <Badge tone={role.tone} className="px-3 py-1 text-xs">
                {role.label}
              </Badge>
            </div>
            <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
                <Heart className="size-5 text-danger" aria-hidden />
                <div>
                  <dt className="text-xs text-muted">Saved favourites</dt>
                  <dd className="text-xl font-extrabold text-ink">{favorites}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
                {user.role === "PROVIDER" ? <Building2 className="size-5 text-brand" aria-hidden /> : <ShieldCheck className="size-5 text-success" aria-hidden />}
                <div>
                  <dt className="text-xs text-muted">Account type</dt>
                  <dd className="text-sm font-bold text-ink">{user.role === "PROVIDER" ? "Business listing account" : "Verified member"}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section aria-label="Quick links" className="grid gap-4 sm:grid-cols-2">
            {LINKS.map(({ href, title, text, icon: Icon }) => (
              <Link key={href} href={href} className="group rounded-card border border-line bg-white p-5 shadow-soft transition hover:border-brand/40 hover:shadow-card">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand/8 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-3 block font-bold text-ink group-hover:text-brand">{title} →</span>
                <span className="mt-1 block text-sm text-muted">{text}</span>
              </Link>
            ))}
          </section>
        </div>

        <aside className="h-fit rounded-card border border-line bg-white p-6 shadow-soft">
          <h2 className="font-bold text-ink">Session</h2>
          <p className="mt-1 text-sm text-muted">Signed in as {user.email}.</p>
          <Button variant="outline" className="mt-5 w-full" onClick={handleLogout} loading={signingOut}>
            <LogOut className="size-4" aria-hidden />
            Log out
          </Button>
        </aside>
      </div>
    </>
  );
}
