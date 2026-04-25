import { Favorite, Stop } from "./types";

const STORAGE_KEY = "kvb-favorites";
const MIGRATION_KEY = "kvb-favorites-migrated-v2";

function migrate(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_KEY)) return;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const arr = JSON.parse(data) as Favorite[];
      // Old IDs were short numeric KVB-ASS strings (1-4 digits).
      // New IDs follow EFA pattern: "de:05315:..." or longer numeric strings.
      const filtered = arr.filter((f) => /^de:|^[0-9]{6,}/.test(f.id));
      if (filtered.length !== arr.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  } catch {
    // ignore
  }
  localStorage.setItem(MIGRATION_KEY, "1");
}

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];

  migrate();

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addFavorite(stop: Stop): Favorite[] {
  const favorites = getFavorites();
  
  if (favorites.some((f) => f.id === stop.id)) {
    return favorites;
  }
  
  const newFavorite: Favorite = {
    ...stop,
    addedAt: Date.now(),
  };
  
  const updated = [...favorites, newFavorite];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFavorite(stopId: string): Favorite[] {
  const favorites = getFavorites();
  const updated = favorites.filter((f) => f.id !== stopId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function isFavorite(stopId: string): boolean {
  return getFavorites().some((f) => f.id === stopId);
}