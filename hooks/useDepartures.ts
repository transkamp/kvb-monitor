"use client";

import { useState, useEffect, useCallback } from "react";
import { Departure } from "@/lib/types";
import { getDepartures } from "@/lib/api";

const REFRESH_INTERVAL = 30000;

import { Stop } from "@/lib/types";

export function useDepartures(stop: Stop | null) {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDepartures = useCallback(async () => {
    if (!stop) {
      setDepartures([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getDepartures(stop.id, stop.name);
      setDepartures(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Abfahrten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [stop]);

  useEffect(() => {
    fetchDepartures();

    const interval = setInterval(fetchDepartures, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDepartures]);

  return {
    departures,
    loading,
    error,
    lastUpdated,
    refresh: fetchDepartures,
  };
}