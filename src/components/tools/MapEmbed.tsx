import { publicConfig } from "@/lib/public-config";
import { cn } from "@/lib/utils";

/**
 * Map iframe for airport locations and the satellite tool.
 * NEXT_PUBLIC_MAP_PROVIDER=osm (default, no key) or google (Maps Embed API key).
 */
export function MapEmbed({
  lat,
  lon,
  title,
  zoom = 13,
  mode = "roadmap",
  className,
}: {
  lat: number;
  lon: number;
  title: string;
  zoom?: number;
  mode?: "roadmap" | "satellite";
  className?: string;
}) {
  let src: string;
  if (publicConfig.mapProvider === "google" && publicConfig.googleMapsEmbedKey) {
    const params = new URLSearchParams({ key: publicConfig.googleMapsEmbedKey, center: `${lat},${lon}`, zoom: String(zoom), maptype: mode });
    src = `https://www.google.com/maps/embed/v1/view?${params.toString()}`;
  } else {
    // OSM has no satellite layer; bbox is derived from the zoom level.
    const span = 360 / 2 ** zoom;
    const bbox = [lon - span, lat - span / 2, lon + span, lat + span / 2].map((n) => n.toFixed(5)).join(",");
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  }

  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("h-[490px] w-full rounded-2xl border-0 bg-surface", className)}
      allowFullScreen
    />
  );
}
