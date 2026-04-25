import { NextRequest, NextResponse } from "next/server";
import kvbRoutes from "@/lib/data/kvb-routes.json";

interface RouteStop {
  name: string;
  shortName?: string;
  ass?: number;
}

export async function GET(request: NextRequest) {
  const lineNumber = request.nextUrl.searchParams.get("line") || "";

  if (!lineNumber) {
    return NextResponse.json({ stops: [] });
  }

  const route = (kvbRoutes as Record<string, RouteStop[]>)[lineNumber];

  if (!route || route.length === 0) {
    return NextResponse.json({ stops: [], message: "Line route not found" });
  }

  const stopsWithInfo = route.map((stop, index) => ({
    id: String(index),
    name: stop.name,
    shortName: stop.shortName ?? "",
    ass: stop.ass ?? 0,
    index,
  }));

  return NextResponse.json({
    line: lineNumber,
    stops: stopsWithInfo,
    totalStops: stopsWithInfo.length,
  });
}
