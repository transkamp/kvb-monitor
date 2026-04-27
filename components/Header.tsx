"use client";

import { Stop } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  onMenuClick: () => void;
  currentStop: Stop | null;
}

export default function Header({ onMenuClick, currentStop }: HeaderProps) {
  const { isFavorite, toggle } = useFavorites();
  const { mode, resolved, cycle } = useTheme();
  const isCurrentFavorite = currentStop ? isFavorite(currentStop.id) : false;

  const themeLabel =
    mode === "system"
      ? `System (${resolved === "dark" ? "dunkel" : "hell"})`
      : mode === "dark"
      ? "Dunkel"
      : "Hell";

  return (
    <header
      className="sticky top-0 z-30 bg-background border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 hover:bg-surface rounded-lg transition-colors"
            aria-label="Menü öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-grow text-center min-w-0">
            <h1 className="text-lg font-semibold truncate">
              {currentStop ? currentStop.name : "KVB Abfahrtsmonitor"}
            </h1>
          </div>

          <button
            onClick={cycle}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            aria-label={`Theme: ${themeLabel}. Klicken zum Wechseln.`}
            title={`Theme: ${themeLabel}`}
          >
            {mode === "system" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : resolved === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {currentStop && (
            <button
              onClick={() => toggle(currentStop)}
              className="p-2 -mr-2 hover:bg-surface rounded-lg transition-colors"
              aria-label={isCurrentFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
            >
              <svg
                className={`w-6 h-6 transition-colors ${
                  isCurrentFavorite ? "text-warning fill-current" : "text-secondary"
                }`}
                fill={isCurrentFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
