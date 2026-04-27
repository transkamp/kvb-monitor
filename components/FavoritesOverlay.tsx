"use client";

import { Stop } from "@/lib/types";
import { useFavorites } from "@/hooks/useFavorites";
import TransportModeFilter from "@/components/TransportModeFilter";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";

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
  const { favorites, remove } = useFavorites();
  const headingId = `favorites-heading-${useId()}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const handleSelect = (stop: Stop) => {
    onSelect(stop);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-[280px] bg-surface z-50 flex flex-col md:border-l md:border-border transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id={headingId} className="text-lg font-semibold">
            Favoriten
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Favoriten schließen"
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="p-4 text-center text-secondary">
              Keine Favoriten gespeichert
            </div>
          ) : (
            <ul className="py-2" role="list">
              {favorites.map((favorite) => (
                <li key={favorite.id} className="flex items-center">
                  <button
                    onClick={() => handleSelect(favorite)}
                    className={`flex-grow px-4 py-3 text-left hover:bg-background transition-colors ${
                      currentStopId === favorite.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="font-medium">{favorite.name}</div>
                    {favorite.shortName && (
                      <div className="text-sm text-secondary">
                        {favorite.shortName}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => remove(favorite.id)}
                    aria-label={`${favorite.name} aus Favoriten entfernen`}
                    title="Entfernen"
                    className="px-4 py-3 text-secondary hover:text-warning transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <TransportModeFilter />

        <footer className="border-t border-border p-3 text-center space-y-2">
          <a
            href="https://github.com/transkamp/kvb-monitor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
            aria-label="Quellcode auf GitHub öffnen (neuer Tab)"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span>Quellcode auf GitHub</span>
          </a>
          <div className="text-xs text-secondary">
            <Link
              href="/impressum"
              onClick={onClose}
              className="hover:text-primary transition-colors"
            >
              Impressum
            </Link>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <Link
              href="/datenschutz"
              onClick={onClose}
              className="hover:text-primary transition-colors"
            >
              Datenschutz
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}
