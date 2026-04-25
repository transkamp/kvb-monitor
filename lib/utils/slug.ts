/**
 * Slug utilities for URL-based stop routing.
 * ASCII-only slugs with German umlaut transliteration.
 */
import { normalizeStopName } from "./stopName";

export function slugify(name: string): string {
  return normalizeStopName(name)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugMatches(name: string, slug: string): boolean {
  return slugify(name) === slug;
}
