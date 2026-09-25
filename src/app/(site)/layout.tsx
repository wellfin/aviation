import type { ReactNode } from "react";
import { StickyFooterAd } from "@/components/ads/StickyFooterAd";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getAdvertisement } from "@/lib/data/content";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const stickyAd = await getAdvertisement("sticky-footer");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <StickyFooterAd ad={stickyAd} />
    </>
  );
}
