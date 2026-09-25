import "server-only";
import { config } from "@/lib/config";
import { fetchJson } from "@/lib/data/http";
import type { Notam, NotamSeverity } from "@/lib/types";

/**
 * NOTAMs.
 *  - NOTAM_PROVIDER=mock → demo NOTAMs (default)
 *  - NOTAM_PROVIDER=faa  → FAA NOTAM API (FAA_NOTAM_CLIENT_ID / FAA_NOTAM_CLIENT_SECRET)
 *    https://api.faa.gov/s/ — covers ICAO locations worldwide via the international feed.
 */
export async function getNotams(icao: string): Promise<Notam[]> {
  const code = icao.toUpperCase();
  if (config.NOTAM_PROVIDER === "faa") return notamsFromFaa(code);
  return mockNotams(code);
}

export function classifySeverity(text: string): NotamSeverity {
  const t = text.toUpperCase();
  if (/\b(CLSD|CLOSED|U\/S|UNSERVICEABLE)\b/.test(t) && /\b(RWY|AD|AERODROME)\b/.test(t)) return "critical";
  if (/\b(CLSD|U\/S|OBST|CRANE|WIP|LGT)\b/.test(t)) return "warning";
  return "info";
}

interface FaaNotamResponse {
  items: Array<{
    properties: {
      coreNOTAMData: {
        notam: {
          id: string;
          number: string;
          type: string;
          icaoLocation: string;
          effectiveStart: string;
          effectiveEnd: string;
          text: string;
          classification?: string;
          selectionCode?: string;
        };
      };
    };
  }>;
}

async function notamsFromFaa(icao: string): Promise<Notam[]> {
  if (!config.FAA_NOTAM_CLIENT_ID || !config.FAA_NOTAM_CLIENT_SECRET) {
    throw new Error("FAA_NOTAM_CLIENT_ID / FAA_NOTAM_CLIENT_SECRET are not configured");
  }
  const body = await fetchJson<FaaNotamResponse>(
    `https://external-api.faa.gov/notamapi/v1/notams?icaoLocation=${icao}&pageSize=50&sortBy=effectiveStartDate&sortOrder=Desc`,
    {
      headers: { client_id: config.FAA_NOTAM_CLIENT_ID, client_secret: config.FAA_NOTAM_CLIENT_SECRET },
      revalidate: 600,
    },
  );
  return body.items.map(({ properties }) => {
    const n = properties.coreNOTAMData.notam;
    return {
      id: n.id,
      icao: n.icaoLocation,
      number: n.number,
      type: n.classification ?? n.type,
      severity: classifySeverity(n.text),
      subject: n.selectionCode ?? n.text.split(/[.\n]/)[0].slice(0, 80),
      text: n.text,
      effectiveFrom: n.effectiveStart,
      effectiveTo: n.effectiveEnd === "PERM" ? null : n.effectiveEnd,
    };
  });
}

export function mockNotams(icao: string, now: Date = new Date()): Notam[] {
  const day = 86_400_000;
  const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * day).toISOString();
  const entries: Array<Omit<Notam, "id" | "icao" | "severity">> = [
    { number: "A1842/26", type: "Runway", subject: "RWY closure", text: `${icao} RWY 09L/27R CLSD DUE TO MAINT. DAILY 2300-0500.`, effectiveFrom: iso(-1), effectiveTo: iso(6) },
    { number: "A1836/26", type: "Obstacle", subject: "Crane erected", text: "OBST CRANE ERECTED 1.2NM E OF ARP. HGT 312FT AMSL. LGTD.", effectiveFrom: iso(-3), effectiveTo: iso(20) },
    { number: "A1829/26", type: "Navaid", subject: "ILS U/S", text: "ILS RWY 27L GP U/S.", effectiveFrom: iso(-2), effectiveTo: iso(2) },
    { number: "A1811/26", type: "Taxiway", subject: "TWY works", text: "TWY B BTN B4 AND B6 WIP. MARKED AND LGTD.", effectiveFrom: iso(-6), effectiveTo: iso(14) },
    { number: "A1798/26", type: "Aerodrome", subject: "Bird activity", text: "INCREASED BIRD ACTIVITY IN VICINITY OF AD.", effectiveFrom: iso(-8), effectiveTo: null },
    { number: "A1790/26", type: "Services", subject: "Fuel availability", text: "JET A-1 FUEL AVBL WITH PRIOR NOTICE 2HR. AVGAS NOT AVBL.", effectiveFrom: iso(-10), effectiveTo: iso(30) },
  ];
  return entries.map((e, i) => ({ ...e, id: `${icao}-${i}`, icao, severity: classifySeverity(e.text) }));
}
