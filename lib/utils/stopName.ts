/**
 * Stop name normalization for EFA-sourced data.
 *
 * EFA returns inconsistent name formats for Cologne stops:
 *   - "Köln, Hansaring" / disassembledName="Hansaring"
 *   - "Weidenpesch, Scheibenstr." / disassembledName="Scheibenstr."
 *   - "Köln, Köln Longerich Meerfeldstr." / disassembledName="Köln Longerich Meerfeldstr."
 *   - "Zollstock, Zollstock Südfriedhof" / disassembledName="Zollstock Südfriedhof"
 *
 * We always prefer disassembledName, then strip a leading "Köln " if present.
 * District names that lead the disassembledName are kept by default — they
 * are part of the official stop name (e.g. "Zollstock Südfriedhof").
 */
export function normalizeStopName(name: string | undefined | null): string {
  if (!name) return "";
  return name
    .replace(/^Köln[,\s]+/i, "")
    .replace(/^Köln\s+/i, "")
    .trim();
}

/** Köln EFA municipality code prefix used to identify all KVB-served stops. */
export const KOELN_ID_PREFIX = "de:05315:";

export function isKoelnStop(efaId: string): boolean {
  return typeof efaId === "string" && efaId.startsWith(KOELN_ID_PREFIX);
}

/**
 * EFA municipality prefixes for neighboring districts whose stops can be
 * served by KVB Stadtbahn lines (1, 7, 16, 18) or KVB buses:
 *   - de:05362: Rhein-Erft-Kreis (Hürth, Brühl, Frechen, ...)
 *   - de:05378: Rheinisch-Bergischer Kreis (Bergisch Gladbach / Bensberg, Refrath, ...)
 *   - de:05382: Rhein-Sieg-Kreis (Bornheim, Alfter, ...)
 *   - de:05314: Bonn (Stadtkreis, Endpunkt Linie 16/18)
 *
 * IMPORTANT: This prefix list is a *necessary* but not *sufficient* filter —
 * it must be combined with `isKvbServedStop(name)` from `./kvbStops`, otherwise
 * arbitrary bus stops in those districts (e.g. Bornheim village stops served
 * only by local buses) would leak into the KVB monitor results.
 */
export const KVB_NEIGHBOR_PREFIXES = [
  "de:05362:",
  "de:05378:",
  "de:05382:",
  "de:05314:",
] as const;

export function isKvbNeighborStop(efaId: string): boolean {
  if (typeof efaId !== "string") return false;
  for (const prefix of KVB_NEIGHBOR_PREFIXES) {
    if (efaId.startsWith(prefix)) return true;
  }
  return false;
}
