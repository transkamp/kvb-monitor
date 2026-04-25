"use client";

import { Departure } from "@/lib/types";
import DepartureItem from "./DepartureItem";
import { useState, useRef, useEffect, useCallback } from "react";

interface DepartureListProps {
  departures: Departure[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  lastUpdated: Date | null;
  onDepartureClick?: (departure: Departure) => void;
}

export default function DepartureList({
  departures,
  loading,
  error,
  onRefresh,
  lastUpdated,
  onDepartureClick,
}: DepartureListProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (departures.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = Math.min(prev + 1, departures.length - 1);
        itemRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = Math.max(prev - 1, 0);
        itemRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      itemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIdx = departures.length - 1;
      setActiveIndex(lastIdx);
      itemRefs.current[lastIdx]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      if (activeIndex >= 0 && activeIndex < departures.length) {
        e.preventDefault();
        onDepartureClick?.(departures[activeIndex]);
      }
    }
  }, [departures, activeIndex, onDepartureClick]);

  // Reset active index and clean up refs when departures change
  useEffect(() => {
    setActiveIndex(-1);
    itemRefs.current = itemRefs.current.slice(0, departures.length);
  }, [departures]);

  if (loading && departures.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-[var(--secondary)] mb-4">{error}</div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[var(--secondary)]">Keine Abfahrten gefunden</div>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      aria-label={`Abfahrtsliste mit ${departures.length} Verbindungen. Pfeiltasten zum Navigieren, Enter zum Auswählen.`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--secondary)]">
          {lastUpdated && `Aktualisiert um ${lastUpdated.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors disabled:opacity-50"
          title="Aktualisieren"
          aria-label="Liste aktualisieren"
        >
          <svg
            className={`w-5 h-5 text-[var(--secondary)] ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div 
        className="bg-surface rounded-lg border border-[var(--border)]"
        role="list"
        aria-label="Abfahrten"
      >
        {departures.map((departure, index) => (
          <DepartureItem 
            key={`${departure.id}-${index}`} 
            departure={departure} 
            onClick={onDepartureClick}
            ref={(el) => { itemRefs.current[index] = el; }}
            isActive={index === activeIndex}
            tabIndex={
              index === activeIndex || (activeIndex === -1 && index === 0)
                ? 0
                : -1
            }
          />
        ))}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs text-[var(--secondary)]" aria-hidden="true">
          ↑↓ Navigieren • Enter Auswählen • Tippe für Route
        </p>
        <p className="sr-only">
          Pfeiltasten navigieren durch Abfahrten, Enter wählt eine Fahrt aus, um die Route anzuzeigen
        </p>
      </div>
    </div>
  );
}