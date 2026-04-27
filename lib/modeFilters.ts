export const TRANSPORT_MODES = ["STRAB", "BUS", "SBahn", "REGIONAL"] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

const STORAGE_KEY = "kvb-mode-filters";

function isValidMode(value: unknown): value is TransportMode {
  return typeof value === "string" && (TRANSPORT_MODES as readonly string[]).includes(value);
}

export function getModeFilters(): TransportMode[] {
  if (typeof window === "undefined") return [...TRANSPORT_MODES];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [...TRANSPORT_MODES];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [...TRANSPORT_MODES];
    return parsed.filter(isValidMode);
  } catch {
    return [...TRANSPORT_MODES];
  }
}

export function setModeFilters(modes: TransportMode[]): TransportMode[] {
  const cleaned = modes.filter(isValidMode);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    // ignore quota / disabled storage
  }
  return cleaned;
}
