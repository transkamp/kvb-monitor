import { Stop, Departure } from "./types";

export async function searchStops(query: string): Promise<Stop[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`/api/stops?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.stops || [];
  } catch (error) {
    console.error("Error searching stops:", error);
    return [];
  }
}

export async function getDepartures(stopId: string, stopName?: string): Promise<Departure[]> {
  try {
    const params = new URLSearchParams();
    // Prefer stopId (EFA-ID) when it looks like one; otherwise fall back to name lookup
    const looksLikeEfaId = stopId && /^de:|^[0-9]{6,}/.test(stopId);
    if (looksLikeEfaId) {
      params.set("stopId", stopId);
    } else if (stopName) {
      params.set("name", stopName);
    } else {
      params.set("stopId", stopId);
    }
    const response = await fetch(`/api/departures?${params}`);
    const data = await response.json();
    return data.departures || [];
  } catch (error) {
    console.error("Error fetching departures:", error);
    return [];
  }
}

export async function getStopById(stopId: string): Promise<Stop | null> {
  try {
    const response = await fetch(`/api/stops?q=${encodeURIComponent(stopId)}`);
    const data = await response.json();
    if (data.stops && data.stops.length > 0) {
      return data.stops[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching stop:", error);
    return null;
  }
}