"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Favorite, Stop } from "@/lib/types";
import {
  getFavorites,
  addFavorite as storageAdd,
  removeFavorite as storageRemove,
} from "@/lib/storage";

interface FavoritesContextValue {
  favorites: Favorite[];
  add: (stop: Stop) => void;
  remove: (stopId: string) => void;
  toggle: (stop: Stop) => void;
  isFavorite: (stopId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const add = useCallback((stop: Stop) => {
    setFavorites(storageAdd(stop));
  }, []);

  const remove = useCallback((stopId: string) => {
    setFavorites(storageRemove(stopId));
  }, []);

  const isFavorite = useCallback(
    (stopId: string) => favorites.some((f) => f.id === stopId),
    [favorites]
  );

  const toggle = useCallback(
    (stop: Stop) => {
      if (favorites.some((f) => f.id === stop.id)) {
        setFavorites(storageRemove(stop.id));
      } else {
        setFavorites(storageAdd(stop));
      }
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, add, remove, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavoritesContext must be used within FavoritesProvider");
  }
  return ctx;
}
