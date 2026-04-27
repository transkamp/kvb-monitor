import { NextRequest, NextResponse } from "next/server";
import { normalizeStopName, isKoelnStop } from "@/lib/utils/stopName";
import { isKvbServedStop } from "@/lib/utils/kvbStops";

const EFA_BASE_URL = "https://openservice-test.vrr.de/openservice";

interface EFALocation {
  id: string;
  type: string;
  name: string;
  disassembledName?: string;
  matchQuality?: number;
  parent?: {
    name?: string;
    type?: string;
  };
  properties?: Record<string, unknown>;
  coord?: [number, number];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ stops: [] });
  }

  try {
    const params = new URLSearchParams({
      outputFormat: "rapidJSON",
      version: "10.4.18.18",
      type_sf: "any",
      name_sf: query,
      anyObjFilter_sf: "2", // 2 = stops only
      locationServerActive: "1",
    });

    const response = await fetch(`${EFA_BASE_URL}/XML_STOPFINDER_REQUEST?${params}`);
    const data = await response.json();

    const locations: EFALocation[] = data.locations || [];
    const queryLower = query.toLowerCase();

    // Filter to KVB-served territory.
    // - Köln stops via EFA municipality code (de:05315:*) — fast prefix check.
    // - Plus stops in neighboring municipalities (Hürth, Brühl, Bergisch Gladbach,
    //   Frechen, Bornheim, Alfter, Bonn) that are actually served by a KVB
    //   Stadtbahn line (whitelist from lib/data/kvb-routes.json).
    // Both checks are O(1); name normalization runs once per record.
    const kvbLocations = locations.filter((loc) => loc.type === "stop");

    // Normalize names and dedupe
    const seen = new Map<string, { id: string; name: string; lat?: number; lon?: number; matchQuality?: number }>();

    for (const loc of kvbLocations) {
      const cleanName = normalizeStopName(loc.disassembledName || loc.name);
      if (!cleanName) continue;
      if (!isKoelnStop(loc.id) && !isKvbServedStop(cleanName)) continue;

      // Dedupe by normalized name; keep the entry with highest matchQuality
      const key = cleanName.toLowerCase();
      const existing = seen.get(key);
      const candidate = {
        id: loc.id,
        name: cleanName,
        lat: loc.coord?.[1],
        lon: loc.coord?.[0],
        matchQuality: loc.matchQuality,
      };
      if (!existing || (candidate.matchQuality ?? 0) > (existing.matchQuality ?? 0)) {
        seen.set(key, candidate);
      }
    }

    const stops = Array.from(seen.values()).map(({ matchQuality: _mq, ...rest }) => rest);

    stops.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(queryLower);
      const bExact = b.name.toLowerCase().startsWith(queryLower);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ stops: stops.slice(0, 20) });
  } catch (error) {
    console.error("Stop search error:", error);
    return NextResponse.json({ error: "Failed to search stops" }, { status: 500 });
  }
}
