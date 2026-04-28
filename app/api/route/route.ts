import { NextRequest, NextResponse } from "next/server";
import kvbRoutes from "@/lib/data/kvb-routes.json";
import { normalizeStopName } from "@/lib/utils/stopName";

interface RouteStop {
  name: string;
  shortName?: string;
  ass?: number;
}

const norm = (s: string) => normalizeStopName(s).toLowerCase().trim();

// Locate a stop in the route by (1) exact normalized name, (2) fuzzy substring
// in either direction. EFA destination headsigns sometimes include extra
// district prefixes (e.g. "Benzelrath Frechen-Benzelrath" → matches stop
// "Frechen-Benzelrath"), so a strict equality check misses these.
function findStopIndex(stops: RouteStop[], target: string): number {
  const t = norm(target);
  if (!t) return -1;
  const exact = stops.findIndex(s => norm(s.name) === t);
  if (exact >= 0) return exact;
  return stops.findIndex(s => {
    const n = norm(s.name);
    return n.length > 0 && (n.includes(t) || t.includes(n));
  });
}

export async function GET(request: NextRequest) {
  const lineNumber = request.nextUrl.searchParams.get("line") || "";
  const direction = request.nextUrl.searchParams.get("direction") || "";
  const currentStop = request.nextUrl.searchParams.get("currentStop") || "";

  if (!lineNumber) {
    return NextResponse.json({ stops: [] });
  }

  const route = (kvbRoutes as Record<string, RouteStop[]>)[lineNumber];

  if (!route || route.length === 0) {
    return NextResponse.json({ stops: [], message: "Line route not found" });
  }

  // The JSON stores each line in only one direction. Decide whether to reverse:
  //   1. If we know both the user's current stop and the trip's destination
  //      (headsign), reverse iff the headsign lies BEFORE the current stop in
  //      the stored array — handles Kurzläufer (e.g. line 7 "Frechen Bf") too.
  //   2. Otherwise fall back to a terminus heuristic: reverse iff the headsign
  //      matches the first stop of the array (and not the last).
  let oriented = route;
  if (route.length >= 2 && direction) {
    const dirIdx = findStopIndex(route, direction);
    const curIdx = findStopIndex(route, currentStop);

    let shouldReverse = false;
    if (dirIdx >= 0 && curIdx >= 0 && dirIdx !== curIdx) {
      shouldReverse = dirIdx < curIdx;
    } else if (dirIdx >= 0) {
      const target = norm(direction);
      const firstMatches = norm(route[0].name) === target;
      const lastMatches = norm(route[route.length - 1].name) === target;
      shouldReverse = firstMatches && !lastMatches;
    }
    if (shouldReverse) oriented = [...route].reverse();
  }

  const stopsWithInfo = oriented.map((stop, index) => ({
    id: String(index),
    name: stop.name,
    shortName: stop.shortName ?? "",
    ass: stop.ass ?? 0,
    index,
  }));

  return NextResponse.json({
    line: lineNumber,
    stops: stopsWithInfo,
    totalStops: stopsWithInfo.length,
  });
}
