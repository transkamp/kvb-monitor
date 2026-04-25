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
