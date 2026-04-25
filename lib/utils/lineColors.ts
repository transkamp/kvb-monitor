/**
 * KVB Linienfarben - harmonische, gedämpfte Palette passend zum App-Design.
 * Alle Farben sind WCAG AA konform für weißen Text auf farbigem Hintergrund.
 */

export const KVB_LINE_COLORS: Record<string, string> = {
  "1":  "#B23A48", // gedämpftes Rot
  "3":  "#C77D2E", // warmes Orange
  "4":  "#C77D2E", // warmes Orange (teilt Strecke mit Linie 3)
  "5":  "#3E8E5A", // Salbeigrün
  "7":  "#7A2E3E", // Bordeaux
  "9":  "#A8581C", // Terracotta
  "12": "#6B4894", // Aubergine/Violett
  "13": "#8B6F47", // Taupe/Braun
  "15": "#1D4ED8", // App-Hauptfarbe (--accent)
  "16": "#2980B9", // Stahlblau
  "17": "#2980B9", // Stahlblau (teilt Strecke mit Linie 16)
  "18": "#3E8E5A", // Salbeigrün (teilt Strecke mit Linie 5)
};

const BUS_COLOR = "#1A1A1A";
const FALLBACK_COLOR = "#1D4ED8";

/**
 * Liefert den Hex-Farbwert für eine KVB-Linie.
 * Stadtbahn 1-18: aus KVB_LINE_COLORS oder Fallback.
 * Bus: einheitliches Dunkelgrau.
 */
export function getLineColor(lineNumber: string, type: string): string {
  if (type === "BUS") return BUS_COLOR;
  return KVB_LINE_COLORS[lineNumber] ?? FALLBACK_COLOR;
}
