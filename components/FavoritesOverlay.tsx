"use client";

import { Favorite, Stop } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoritesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stop: Stop) => void;
  currentStopId: string | null;
}

export default function FavoritesOverlay({
  isOpen,
  onClose,
  onSelect,
  currentStopId,
}: FavoritesOverlayProps) {
  const { favorites, remove, isFavorite } = useFavorites();

  const handleSelect = (stop: Stop) => {
    onSelect(stop);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-surface z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Favoriten</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {favorites.length === 0 ? (
            <div className="p-4 text-center text-secondary">
              Keine Favoriten gespeichert
            </div>
          ) : (
            <div className="py-2">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex items-center group"
                >
                  <button
                    onClick={() => handleSelect(favorite)}
                    className={`flex-grow px-4 py-3 text-left hover:bg-background transition-colors ${
                      currentStopId === favorite.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="font-medium">{favorite.name}</div>
                    {favorite.shortName && (
                      <div className="text-sm text-secondary">{favorite.shortName}</div>
                    )}
                  </button>
                  <button
                    onClick={() => remove(favorite.id)}
                    className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-warning"
                    title="Entfernen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`hidden md:block fixed top-0 right-0 h-full w-[280px] bg-surface z-50 border-l border-border transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Favoriten</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {favorites.length === 0 ? (
            <div className="p-4 text-center text-secondary">
              Keine Favoriten gespeichert
            </div>
          ) : (
            <div className="py-2">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex items-center group"
                >
                  <button
                    onClick={() => handleSelect(favorite)}
                    className={`flex-grow px-4 py-3 text-left hover:bg-background transition-colors ${
                      currentStopId === favorite.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="font-medium">{favorite.name}</div>
                    {favorite.shortName && (
                      <div className="text-sm text-secondary">{favorite.shortName}</div>
                    )}
                  </button>
                  <button
                    onClick={() => remove(favorite.id)}
                    className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity hover:text-warning"
                    title="Entfernen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}