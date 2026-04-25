"use client";

import { Departure } from "@/lib/types";
import { forwardRef, useState } from "react";
import { getLineColor } from "@/lib/utils/lineColors";

interface DepartureItemProps {
  departure: Departure;
  onClick?: (departure: Departure) => void;
  isActive?: boolean;
  tabIndex?: number;
}

const DepartureItem = forwardRef<HTMLButtonElement, DepartureItemProps>(
  ({ departure, onClick, isActive, tabIndex }, ref) => {
    const { servingLine, dateTime, realDateTime, delay, realtimeQuality, hints } = departure;
    const timeInMinutes = getTimeInMinutes(realDateTime || dateTime);
    const actualTime = realDateTime || dateTime;
    const isDelayed = delay !== undefined && delay > 0;
    const isEarly = delay !== undefined && delay < 0;

    const [showHints, setShowHints] = useState(false);

    const isCancelled = realtimeQuality === "cancelled";
    const isStopCancelled = realtimeQuality === "stop-cancelled";
    const isLive = realtimeQuality === "live";
    const isScheduledOnly = realtimeQuality === "scheduled";
    const isExtra = realtimeQuality === "extra";

    const showPlatform =
      !!departure.platform &&
      (servingLine.type === "SBahn" || servingLine.type === "REGIONAL");

    const a11yStatusLabel = isCancelled
      ? "Fahrt entfällt"
      : isStopCancelled
      ? "Hält hier nicht"
      : isExtra
      ? "Sonderfahrt"
      : isLive
      ? "Echtzeit-Daten"
      : isScheduledOnly
      ? "Nur Fahrplan-Daten"
      : "";

    const a11yLabel = [
      `Linie ${servingLine.number} nach ${servingLine.destination || servingLine.direction}`,
      isCancelled
        ? "Fahrt entfällt"
        : timeInMinutes <= 1
        ? "Abfahrt sofort"
        : `in ${timeInMinutes} Minuten`,
      showPlatform ? `Gleis ${departure.platform}` : null,
      isDelayed ? `${delay} Minuten Verspätung` : null,
      isEarly ? `${Math.abs(delay!)} Minuten früher` : null,
      a11yStatusLabel && !isCancelled ? a11yStatusLabel : null,
      hints && hints.length > 0 ? `${hints.length} Hinweise verfügbar` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const containerClass = `
      w-full flex items-center gap-4 py-4 border-b border-[var(--border)] last:border-b-0
      transition-colors text-left relative
      ${
        isActive
          ? "bg-[var(--accent)]/10 ring-2 ring-[var(--accent)] ring-inset"
          : "hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)]"
      }
      ${isCancelled ? "opacity-70" : ""}
    `;

    return (
      <button
        ref={ref}
        tabIndex={tabIndex ?? 0}
        onClick={() => onClick?.(departure)}
        aria-label={a11yLabel}
        aria-disabled={isCancelled || undefined}
        role="listitem"
        className={containerClass}
      >
        {/* Line badge */}
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg text-white ${
            isCancelled ? "grayscale" : ""
          }`}
          style={{ backgroundColor: getLineColor(servingLine.number, servingLine.type) }}
          aria-hidden="true"
        >
          {servingLine.number}
        </div>

        {/* Destination */}
        <div className="flex-grow min-w-0">
          <div
            className={`font-medium text-[var(--primary)] truncate flex items-center gap-2 ${
              isCancelled ? "line-through" : ""
            }`}
          >
            <span className="truncate">→ {servingLine.destination || servingLine.direction}</span>

            {/* Status badges next to destination */}
            {isExtra && (
              <span
                className="flex-shrink-0 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[var(--success)] text-[var(--background)]"
                aria-hidden="true"
              >
                Sonderfahrt
              </span>
            )}
            {isStopCancelled && !isCancelled && (
              <span
                className="flex-shrink-0 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[var(--warning)] text-[var(--background)]"
                aria-hidden="true"
              >
                Hält nicht
              </span>
            )}

            {/* Hints icon */}
            {hints && hints.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`${hints.length} Hinweise anzeigen`}
                aria-expanded={showHints}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHints((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowHints((v) => !v);
                  }
                }}
                className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-hover)] text-[var(--secondary)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors text-xs cursor-pointer"
                title="Hinweise"
              >
                <span aria-hidden="true">i</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {/* Live indicator */}
            {isLive && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                <span
                  className="live-dot inline-block w-2 h-2 rounded-full bg-[var(--success)]"
                  aria-hidden="true"
                />
                <span>Live</span>
              </span>
            )}
            {isScheduledOnly && (
              <span className="text-xs text-[var(--secondary)]">Fahrplan</span>
            )}
            {showPlatform && (
              <span className="text-sm text-[var(--secondary)]">
                Gleis {departure.platform}
              </span>
            )}
          </div>

          {/* Hint details (expandable) */}
          {showHints && hints && hints.length > 0 && (
            <div
              role="region"
              aria-label="Live-Hinweise"
              className="mt-2 p-2 rounded bg-[var(--surface-muted)] border border-[var(--border)] text-xs text-[var(--primary)] space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {hints.map((h, i) => (
                <div key={i} className="leading-snug">
                  {h.content}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time display */}
        <div className="flex-shrink-0 text-right">
          {isCancelled ? (
            <div className="text-lg font-bold text-[var(--warning)]">Entfällt</div>
          ) : timeInMinutes <= 1 ? (
            <div className="text-lg font-bold text-[var(--success)]">sofort</div>
          ) : timeInMinutes > 0 ? (
            <div
              className={`text-lg font-bold ${
                isScheduledOnly ? "text-[var(--secondary)]" : "text-[var(--primary)]"
              }`}
            >
              {timeInMinutes} Min
            </div>
          ) : (
            <div className="text-lg font-bold text-[var(--secondary)]">
              {formatTime(actualTime)}
            </div>
          )}

          {!isCancelled && isDelayed && (
            <div className="text-sm text-[var(--warning)]">+{delay} Min</div>
          )}
          {!isCancelled && isEarly && (
            <div className="text-sm text-[var(--success)]">{delay} Min früher</div>
          )}
        </div>
      </button>
    );
  }
);

DepartureItem.displayName = "DepartureItem";

function getTimeInMinutes(dateTime: { timestamp: number }): number {
  const now = Date.now();
  const diff = dateTime.timestamp - now;
  return Math.round(diff / 60000);
}

function formatTime(dateTime: { time: string }): string {
  return dateTime.time;
}

export default DepartureItem;
