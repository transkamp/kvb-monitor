import { NextRequest, NextResponse } from "next/server";
import { normalizeStopName } from "@/lib/utils/stopName";
import { getBerlinDateParts, formatBerlinTime, formatBerlinDate } from "@/lib/utils/berlinTime";

const EFA_BASE_URL = "https://openservice-test.vrr.de/openservice";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stopId = searchParams.get("stopId") || "";
  const stopName = searchParams.get("name") || "";

  if (!stopId && !stopName) {
    return NextResponse.json({ departures: [] });
  }

  try {
    const { year, month, day, hour, minute } = getBerlinDateParts();

    // Prefer EFA stopID (from unified search). Fall back to name lookup.
    const useId = stopId && /^de:|^[0-9]{6,}/.test(stopId);

    const params = new URLSearchParams({
      outputFormat: "rapidJSON",
      version: "10.4.18.18",
      type_dm: useId ? "any" : "stop",
      name_dm: useId ? stopId : (stopName || stopId),
      mode: "direct",
      useRealtime: "1",
      itdDateDay: day,
      itdDateMonth: month,
      itdDateYear: year,
      itdTimeHour: hour,
      itdTimeMinute: minute,
    });

    if (!useId) {
      params.set("place_dm", "Köln");
    }

    const response = await fetch(`${EFA_BASE_URL}/XML_DM_REQUEST?${params}`);
    const data = await response.json();

    const departures: any[] = [];
    
    const eventList = data.stopEvents || data.departureList || [];
    const events = Array.isArray(eventList) ? eventList : [eventList];
    
    let idx = 0;
    for (const dep of events) {
      const transportation = dep.transportation || {};
      const location = dep.location || {};

      const plannedTime = dep.departureTimePlanned;
      const estimatedTime = dep.departureTimeEstimated;

      let delay: number | undefined;
      if (estimatedTime && plannedTime) {
        const planned = new Date(plannedTime).getTime();
        const estimated = new Date(estimatedTime).getTime();
        const diff = Math.round((estimated - planned) / 60000);
        // Treat 0-minute delta as on-time (no value).
        if (diff !== 0) delay = diff;
      }

      const number = transportation.number || transportation.name || "?";
      const product = transportation.product || {};
      const productClass = product.class;

      let lineType = "STRAB";
      if (productClass === 5) lineType = "BUS";
      else if (productClass === 1) lineType = "SBahn";
      else if (productClass >= 8) lineType = "REGIONAL";

      const tripId = dep.properties?.AVMSTripID || dep.properties?.tripCode;
      const uniqueId = `${tripId ?? "no-trip"}-${number}-${plannedTime ?? "no-time"}-${idx++}`;

      // Derive realtime quality
      const statusArr: string[] = Array.isArray(dep.realtimeStatus) ? dep.realtimeStatus : [];
      const isCancelled = dep.isCancelled === true || statusArr.includes("TRIP_CANCELLED");
      const isStopCancelled = statusArr.includes("STOP_CANCELLED");
      const isExtra = statusArr.includes("EXTRA_TRIP") || statusArr.includes("EXTRA_STOPS");

      let realtimeQuality:
        | "live"
        | "predicted"
        | "scheduled"
        | "extra"
        | "cancelled"
        | "stop-cancelled" = "scheduled";
      if (isCancelled) realtimeQuality = "cancelled";
      else if (isStopCancelled) realtimeQuality = "stop-cancelled";
      else if (isExtra) realtimeQuality = "extra";
      else if (dep.isRealtimeControlled && estimatedTime) realtimeQuality = "live";
      else if (dep.isRealtimeControlled) realtimeQuality = "predicted";

      // Filter hints: keep only relevant live/incident/stop/line info, drop static
      // timetable cosmetics like "WLAN verfügbar", "Toilette an Bord".
      const rawHints: any[] = Array.isArray(dep.hints) ? dep.hints : [];
      const hints = rawHints
        .filter(
          (h) =>
            h?.type === "RTIncidentCall" ||
            h?.type === "Stop" ||
            h?.type === "Line"
        )
        .map((h) => ({ content: String(h.content || ""), type: String(h.type) }))
        .filter((h) => h.content.length > 0);

      departures.push({
        id: uniqueId,
        servingLine: {
          number: number.replace(/^Stadtbahn |^S-Bahn /, ""),
          destination: normalizeStopName(transportation.destination?.name),
          direction: normalizeStopName(transportation.destination?.name),
          type: lineType,
          productName: product.name,
          operatorName: transportation.operator?.name,
        },
        dateTime: {
          date: plannedTime ? formatBerlinDate(plannedTime) : "",
          time: plannedTime ? formatBerlinTime(plannedTime) : "",
          timestamp: plannedTime ? new Date(plannedTime).getTime() : 0,
        },
        realDateTime: estimatedTime ? {
          date: formatBerlinDate(estimatedTime),
          time: formatBerlinTime(estimatedTime),
          timestamp: new Date(estimatedTime).getTime(),
        } : undefined,
        delay,
        platform: location.properties?.platform,
        platformName: location.properties?.platformName || location.disassembledName,
        realtimeQuality,
        hints: hints.length > 0 ? hints : undefined,
      });
    }

    return NextResponse.json({ departures });
  } catch (error) {
    console.error("Departures fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch departures" }, { status: 500 });
  }
}