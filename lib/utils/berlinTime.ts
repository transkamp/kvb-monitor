/**
 * Berlin (Europe/Berlin) timezone helpers.
 *
 * Server runtimes (Vercel, etc.) default to UTC. EFA API works with local
 * Cologne time. Always use these helpers in API routes and any server-side
 * date formatting to avoid 1–2 hour shifts.
 */

const TZ = "Europe/Berlin";

interface BerlinDateParts {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

/** Returns Date components in Europe/Berlin TZ as zero-padded strings. */
export function getBerlinDateParts(d: Date = new Date()): BerlinDateParts {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    // "24" can occur for midnight in en-GB; normalize to "00".
    hour: parts.hour === "24" ? "00" : parts.hour,
    minute: parts.minute,
  };
}

/** Formats an ISO timestamp string to "HH:mm" in Europe/Berlin. */
export function formatBerlinTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-DE", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats an ISO timestamp string to "DD.MM.YYYY" in Europe/Berlin. */
export function formatBerlinDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", { timeZone: TZ });
}
