"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  TRANSPORT_MODES,
  TransportMode,
  getModeFilters,
  setModeFilters,
} from "@/lib/modeFilters";

interface TransportModeFilterContextValue {
  activeModes: TransportMode[];
  toggle: (mode: TransportMode) => void;
  isActive: (mode: TransportMode) => boolean;
  reset: () => void;
}

const TransportModeFilterContext = createContext<TransportModeFilterContextValue | null>(null);

export function TransportModeFilterProvider({ children }: { children: ReactNode }) {
  const [activeModes, setActiveModes] = useState<TransportMode[]>([...TRANSPORT_MODES]);

  useEffect(() => {
    setActiveModes(getModeFilters());
  }, []);

  const toggle = useCallback((mode: TransportMode) => {
    setActiveModes((prev) => {
      const next = prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode];
      return setModeFilters(next);
    });
  }, []);

  const isActive = useCallback(
    (mode: TransportMode) => activeModes.includes(mode),
    [activeModes]
  );

  const reset = useCallback(() => {
    setActiveModes(setModeFilters([...TRANSPORT_MODES]));
  }, []);

  return (
    <TransportModeFilterContext.Provider value={{ activeModes, toggle, isActive, reset }}>
      {children}
    </TransportModeFilterContext.Provider>
  );
}

export function useTransportModeFilterContext(): TransportModeFilterContextValue {
  const ctx = useContext(TransportModeFilterContext);
  if (!ctx) {
    throw new Error(
      "useTransportModeFilterContext must be used within TransportModeFilterProvider"
    );
  }
  return ctx;
}
