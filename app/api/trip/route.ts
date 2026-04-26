import { NextRequest, NextResponse } from "next/server";
import { normalizeStopName } from "@/lib/utils/stopName";
import { getBerlinDateParts } from "@/lib/utils/berlinTime";

const EFA_BASE_URL = "https://openservice-test.vrr.de/openservice";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tripId = searchParams.get("tripId") || "";
  const stopId = searchParams.get("stopId") || "";

  if (!tripId) {
    return NextResponse.json({ stops: [] });
  }

  try {
    const { year, month, day, hour, minute } = getBerlinDateParts();

    const params = new URLSearchParams({
      outputFormat: "rapidJSON",
      version: "10.4.18.18",
      type: "trip",
      tripId: tripId,
      itdDateDay: day,
      itdDateMonth: month,
      itdDateYear: year,
      itdTimeHour: hour,
      itdTimeMinute: minute,
      mode: "detail",
    });

    const response = await fetch(`${EFA_BASE_URL}/XML_TRIP_REQUEST2?${params}`);
    const data = await response.json();

    const stops: any[] = [];
    
    if (data.trip) {
      const trip = data.trip;
      const legs = trip.legs?.leg || [];
      const legsArray = Array.isArray(legs) ? legs : [legs];
      
      for (const leg of legsArray) {
        const points = leg.route?.points?.point || [];
        const pointsArray = Array.isArray(points) ? points : [points];
        
        for (const point of pointsArray) {
          if (point.stop) {
            const stop = point.stop;
            const isPassed = point.$ === "PATTERN_MAP" || point.arrival?.changed || point.departure?.changed;
            
            stops.push({
              id: stop.id || stop.ref,
              name: normalizeStopName(stop.disassembledName || stop.name),
              platform: point.platform || stop.platform,
              arrivalTime: point.arrival?.time,
              departureTime: point.departure?.time,
              isPassed: isPassed,
              isOrigin: point.$ === "FIRST",
              isDestination: point.$ === "LAST",
            });
          }
        }
      }
    }

    return NextResponse.json({ stops });
  } catch (error) {
    console.error("Trip details fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch trip details" }, { status: 500 });
  }
}