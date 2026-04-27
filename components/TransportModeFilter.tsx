"use client";

import { TRANSPORT_MODES, TransportMode } from "@/lib/modeFilters";
import { useTransportModeFilter } from "@/hooks/useTransportModeFilter";

interface ModeMeta {
  label: string;
  icon: React.ReactNode;
}

const MODE_META: Record<TransportMode, ModeMeta> = {
  STRAB: {
    label: "Stadtbahn",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="14" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11h14M9 7h.01M15 7h.01M8 21l2-3M16 21l-2-3" />
      </svg>
    ),
  },
  BUS: {
    label: "Bus",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h14M5 17V6a2 2 0 012-2h10a2 2 0 012 2v11M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-2M19 17v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2M5 10h14M9 14h.01M15 14h.01" />
      </svg>
    ),
  },
  SBahn: {
    label: "S-Bahn",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2 0 2.5 6 1.5 6 4 0 1.2-1.3 2-3 2-1.4 0-2.5-.5-3-1.5" />
      </svg>
    ),
  },
  REGIONAL: {
    label: "Regional",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15.5C4 17.4 5.6 19 7.5 19h9c1.9 0 3.5-1.6 3.5-3.5V8a4 4 0 00-4-4H8a4 4 0 00-4 4v7.5zM4 12h16M9 19l-2 2M15 19l2 2M9 8h6" />
        <circle cx="8" cy="15.5" r="1" fill="currentColor" />
        <circle cx="16" cy="15.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
};

export default function TransportModeFilter() {
  const { isActive, toggle } = useTransportModeFilter();

  return (
    <div className="border-t border-border p-3">
      <fieldset>
        <legend className="text-xs uppercase tracking-wider text-secondary mb-2">
          Verkehrsmittel
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORT_MODES.map((mode) => {
            const active = isActive(mode);
            const meta = MODE_META[mode];
            return (
              <button
                key={mode}
                type="button"
                onClick={() => toggle(mode)}
                aria-pressed={active}
                aria-label={`${meta.label}-Abfahrten anzeigen`}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface ${
                  active
                    ? "bg-accent border-accent text-[var(--background)] shadow-sm"
                    : "bg-transparent border-border text-secondary opacity-60 hover:opacity-100 hover:bg-background"
                }`}
              >
                <span className="flex-shrink-0" aria-hidden="true">{meta.icon}</span>
                <span aria-hidden="true" className={`truncate ${active ? "" : "line-through"}`}>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
