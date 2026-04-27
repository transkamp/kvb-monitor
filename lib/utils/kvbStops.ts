/**
 * Whitelist of stop names served by any KVB line — including stops in
 * neighboring municipalities (Hürth, Brühl, Bergisch Gladbach, Frechen,
 * Bornheim, Alfter, Bonn) which are reached by Stadtbahn lines 1, 7, 16, 18.
 *
 * The EFA municipality filter `de:05315:*` (Köln) alone is not enough — it
 * would drop e.g. "Efferen" (Hürth) or "Bensberg" (Bergisch Gladbach).
 *
 * We build a Set<string> of canonical keys at module load (one-time, ~5 ms,
 * cached as module singleton). Lookup is O(1) via Set.has.
 *
 * The canonical form is aggressive on purpose so that minor spelling
 * variants between EFA and KVB OpenData ("Brühler Straße" vs. "Brühler Str.")
 * still match.
 */
import kvbRoutes from "@/lib/data/kvb-routes.json";
import { normalizeStopName } from "./stopName";

type RouteStop = { name: string; shortName?: string; ass?: number };

/**
 * Canonical key for stop-name comparison. Deterministic, no fuzzy matching.
 *
 * Pipeline:
 *   1. normalizeStopName  — strips leading "Köln "
 *   2. lowercase
 *   3. transliterate ä/ö/ü/ß → ae/oe/ue/ss
 *   4. straße/strasse → str  (must run before step 5)
 *   5. drop everything outside [a-z0-9]
 *
 * Examples:
 *   "Brühler Straße"      → "bruehlerstr"
 *   "Brühler Str."        → "bruehlerstr"   ✓ same key
 *   "Aachener Str./Gürtel"→ "aachenerstrguertel"
 *   "Frechen-Benzelrath"  → "frechenbenzelrath"
 */
export function canonicalize(name: string | undefined | null): string {
  if (!name) return "";
  return normalizeStopName(name)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/stra(ss|ß)e/g, "str")
    .replace(/[^a-z0-9]+/g, "");
}

let canonicalSet: Set<string> | null = null;

function getCanonicalSet(): Set<string> {
  if (canonicalSet) return canonicalSet;
  const set = new Set<string>();
  const routes = kvbRoutes as Record<string, RouteStop[]>;
  for (const stops of Object.values(routes)) {
    for (const stop of stops) {
      const key = canonicalize(stop.name);
      if (key) set.add(key);
    }
  }
  canonicalSet = set;
  return set;
}

/**
 * Returns true if the given stop name appears on any KVB line route.
 * Use this in addition to the EFA `de:05315:` Köln-prefix filter to admit
 * stops in neighboring municipalities that KVB Stadtbahn lines actually serve.
 */
export function isKvbServedStop(name: string | undefined | null): boolean {
  const key = canonicalize(name);
  if (!key) return false;
  return getCanonicalSet().has(key);
}
