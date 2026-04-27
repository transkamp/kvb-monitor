"use client";

import { Departure } from "@/lib/types";
import { TripStop } from "@/lib/types";
import { useState, useEffect, useRef, useCallback } from "react";
import { getLineColor } from "@/lib/utils/lineColors";
import { useDialogA11y } from "@/hooks/useDialogA11y";

interface TripDetailsModalProps {
  departure: Departure;
  currentStopName: string;
  onClose: () => void;
  onStopSelect: (stopName: string) => void;
}

interface TripStopWithTime {
  id: string;
  name: string;
  shortName?: string;
  index: number;
  scheduledTime?: string;
  isPassed?: boolean;
}

// Estimated minutes per stop (placeholder - real timing data not available)
// TODO: Replace with actual schedule data from KVB/VRR API when available
const ESTIMATED_MINUTES_PER_STOP = 2;

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^\wäöüß]/g, "").trim();
}

export default function TripDetailsModal({ departure, currentStopName, onClose, onStopSelect }: TripDetailsModalProps) {
  const [routeStops, setRouteStops] = useState<TripStopWithTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const modalRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stopRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useDialogA11y({
    isOpen: true,
    panelRef: modalRef,
    onClose,
    initialFocusRef: closeButtonRef,
  });

  // Keyboard navigation through stops (using refs, not getElementById)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (routeStops.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = prev < routeStops.length - 1 ? prev + 1 : prev;
        stopRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => {
        const next = prev > 0 ? prev - 1 : 0;
        stopRefs.current[next]?.focus();
        return next;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      stopRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIdx = routeStops.length - 1;
      setActiveIndex(lastIdx);
      stopRefs.current[lastIdx]?.focus();
    }
  }, [routeStops]);

  // Fetch route data
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      setError(null);

      try {
        const lineNumber = departure.servingLine.number;
        const response = await fetch(`/api/route?line=${encodeURIComponent(lineNumber)}`);
        const data = await response.json();

        if (data.stops && data.stops.length > 0) {
          const stops: TripStopWithTime[] = data.stops.map((s: TripStop, idx: number) => ({
            ...s,
            index: idx,
          }));
          setRouteStops(stops);

          // Match current bahn/bus position = the stop the user is currently at
          const target = normalize(currentStopName);
          let foundIdx = 0;
          if (target) {
            const exactIdx = stops.findIndex(s => normalize(s.name) === target);
            if (exactIdx >= 0) {
              foundIdx = exactIdx;
            } else {
              const partialIdx = stops.findIndex(s =>
                normalize(s.name).includes(target) || target.includes(normalize(s.name))
              );
              if (partialIdx >= 0) foundIdx = partialIdx;
            }
          }
          setCurrentStopIndex(foundIdx);
        } else {
          setRouteStops([]);
        }
      } catch (err) {
        setError("Route konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [departure, currentStopName]);

  // Auto-scroll to current stop when route is loaded (container-scoped)
  useEffect(() => {
    if (loading) return;
    const nav = navRef.current;
    const stop = stopRefs.current[currentStopIndex];
    if (!nav || !stop) return;

    const navRect = nav.getBoundingClientRect();
    const stopRect = stop.getBoundingClientRect();
    nav.scrollTop += stopRect.top - navRect.top - navRect.height / 2 + stopRect.height / 2;
  }, [loading, currentStopIndex, routeStops.length]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const departureTime = departure.realDateTime?.timestamp || departure.dateTime.timestamp;

  // Returns timestamp + formatted time for a given stop index
  const getScheduledArrivalTimestamp = (stopIndex: number): number | null => {
    if (!departureTime || stopIndex < currentStopIndex) return null;
    const minutesFromDeparture = (stopIndex - currentStopIndex) * ESTIMATED_MINUTES_PER_STOP;
    return departureTime + minutesFromDeparture * 60000;
  };

  const getScheduledArrival = (stopIndex: number): string => {
    const ts = getScheduledArrivalTimestamp(stopIndex);
    if (ts === null) return "";
    return new Date(ts).toLocaleTimeString("de-DE", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPassed = (stopIndex: number): boolean => stopIndex < currentStopIndex;

  const getTimelineStatus = (index: number): string => {
    if (index === currentStopIndex) return "aktuelle Haltestelle";
    if (index < currentStopIndex) return "bereits passiert";
    return "kommend";
  };

  // Linienfarbe (kontextbezogen)
  const lineColor = getLineColor(departure.servingLine.number, departure.servingLine.type);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading
          ? "Lade Routeninformationen"
          : error
            ? "Fehler beim Laden der Route"
            : `Linie ${departure.servingLine.number} nach ${departure.servingLine.destination}, ${routeStops.length} Haltestellen`
        }
      </div>

      <div
        ref={modalRef}
        className="bg-surface w-full max-w-md max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <header className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: lineColor }}
                aria-hidden="true"
              >
                {departure.servingLine.number}
              </div>
              <div>
                <h2 id="modal-title" className="font-semibold text-lg">
                  → {departure.servingLine.destination}
                </h2>
                <p id="modal-desc" className="text-sm text-[var(--secondary)]">
                  Abfahrt: {departure.dateTime.time}
                  {departure.delay !== undefined && departure.delay > 0 && (
                    <span className="text-[var(--warning)] ml-2">
                      (+{departure.delay} Min)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Modal schließen"
              className="p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!loading && !error && routeStops.length > 0 && (
            <p className="text-xs text-[var(--secondary)] italic mt-2">
              Ankunftszeiten geschätzt
            </p>
          )}
        </header>

        {/* Timeline with keyboard navigation */}
        <nav
          ref={navRef}
          className="p-4 overflow-y-auto flex-1"
          aria-label="Routenverlauf"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12" role="status">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Pulse rings */}
                <div
                  className="absolute inset-0 rounded-full pulse-ring"
                  style={{ backgroundColor: lineColor }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 rounded-full pulse-ring"
                  style={{ backgroundColor: lineColor, animationDelay: "0.6s" }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 rounded-full pulse-ring"
                  style={{ backgroundColor: lineColor, animationDelay: "1.2s" }}
                  aria-hidden="true"
                />
                {/* Center: line number */}
                <div
                  className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  style={{ backgroundColor: lineColor }}
                >
                  {departure.servingLine.number}
                </div>
              </div>
              <p className="mt-6 text-[var(--secondary)] font-medium">Lade Route...</p>
              <span className="sr-only">Lädt Routeninformationen</span>
            </div>
          ) : error ? (
            <p className="text-center text-[var(--warning)] py-8" role="alert">
              {error}
            </p>
          ) : routeStops.length === 0 ? (
            <p className="text-center text-[var(--secondary)] py-8">
              Keine Routeninformation verfügbar
            </p>
          ) : (
            <div className="space-y-0" role="list">
              {routeStops.map((stop, index) => {
                const passed = isPassed(index);
                const isCurrent = index === currentStopIndex;
                const arrivalTs = getScheduledArrivalTimestamp(index);
                const hasTime = getScheduledArrival(index);
                const timelineStatus = getTimelineStatus(index);

                return (
                  <div
                    key={stop.id}
                    className={`flex items-stretch gap-3 ${passed ? "opacity-50" : ""}`}
                    role="listitem"
                  >
                    {/* Timeline dot + connector (flex-grow for gap-less line) */}
                    <div className="flex flex-col items-center w-3 flex-shrink-0" aria-hidden="true">
                      <div
                        className="w-3 h-3 rounded-full border-2 mt-3 flex-shrink-0"
                        style={
                          isCurrent
                            ? { backgroundColor: lineColor, borderColor: lineColor }
                            : passed
                              ? { backgroundColor: "var(--secondary)", borderColor: "var(--secondary)" }
                              : { backgroundColor: "var(--surface)", borderColor: "var(--border-strong)" }
                        }
                      />
                      {index < routeStops.length - 1 && (
                        <div
                          className="w-0.5 flex-grow"
                          style={{
                            backgroundColor: passed ? "var(--secondary)" : lineColor,
                          }}
                        />
                      )}
                    </div>

                    {/* Stop button for keyboard navigation */}
                    <button
                      ref={(el) => { stopRefs.current[index] = el; }}
                      onClick={() => {
                        setActiveIndex(index);
                        if (!isCurrent) {
                          onStopSelect(stop.name);
                        }
                      }}
                      disabled={isCurrent}
                      aria-label={`${stop.name}, ${timelineStatus}${hasTime && !passed ? `, geschätzte Ankunft ${hasTime}` : ""}${!isCurrent ? ", auswählen für Abfahrten" : ""}`}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`flex-grow text-left py-2 px-2 -mx-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                        isCurrent
                          ? "cursor-default"
                          : "hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] cursor-pointer"
                      }`}
                    >
                      <div
                        className="font-medium flex items-center justify-between"
                        style={isCurrent ? { color: lineColor } : { color: "var(--primary)" }}
                      >
                        <span>
                          {stop.name}
                          {isCurrent && (
                            <span className="ml-2 font-bold" style={{ color: lineColor }}>
                              ← Hier
                            </span>
                          )}
                        </span>
                        {hasTime && !passed && arrivalTs && (
                          <time
                            className="text-sm font-mono"
                            dateTime={new Date(arrivalTs).toISOString()}
                          >
                            {hasTime}
                          </time>
                        )}
                      </div>
                      {stop.shortName && (
                        <div className="text-xs text-[var(--secondary)]">
                          {stop.shortName}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Keyboard hints */}
        <footer className="p-3 border-t border-[var(--border)] bg-[var(--surface-muted)] text-xs text-[var(--secondary)]">
          <p aria-hidden="true">
            <kbd className="px-1.5 py-0.5 bg-[var(--kbd-bg)] rounded text-xs font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--kbd-bg)] rounded text-xs font-mono ml-1">↓</kbd>
            <span className="ml-2">Navigieren</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--kbd-bg)] rounded text-xs font-mono ml-4">Home</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--kbd-bg)] rounded text-xs font-mono ml-1">Ende</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--kbd-bg)] rounded text-xs font-mono ml-4">Esc</kbd>
            <span className="ml-2">Schließen</span>
          </p>
          <p className="sr-only">
            Pfeiltasten navigieren durch Haltestellen, Home springt zum Anfang, Ende zum Ende, Escape schließt das Modal
          </p>
        </footer>
      </div>
    </div>
  );
}
