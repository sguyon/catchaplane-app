import { NextRequest, NextResponse } from "next/server";
import { fetchNearbyFlights } from "@/lib/flight-api";
import { FALLBACK_FLIGHTS } from "@/lib/mock-data";
import { CONFIG } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const start = performance.now();
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  console.log(`[API] GET /api/flights -- lat=${lat} lng=${lng}`);

  if (isNaN(lat) || isNaN(lng)) {
    const ms = Math.round(performance.now() - start);
    console.log(`[API] GET /api/flights -- 400 -- ${ms}ms -- invalid params`);
    return NextResponse.json(
      { error: "Missing or invalid lat/lng parameters" },
      { status: 400 }
    );
  }

  // Clamp to valid ranges
  const clampedLat = Math.max(-90, Math.min(90, lat));
  const clampedLng = Math.max(-180, Math.min(180, lng));

  try {
    const { flights, fromCache } = await fetchNearbyFlights(
      clampedLat,
      clampedLng,
      CONFIG.flightSearchRadius,
      CONFIG.flightCacheTTL
    );

    if (flights.length === 0) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] GET /api/flights -- 200 -- ${ms}ms -- 0 flights, using fallback`);
      // Return fallback flights when none found nearby
      return NextResponse.json({
        flights: FALLBACK_FLIGHTS,
        fromCache: false,
        fallback: true,
      });
    }

    const ms = Math.round(performance.now() - start);
    console.log(`[API] GET /api/flights -- 200 -- ${ms}ms -- ${flights.length} flights (cache=${fromCache})`);
    return NextResponse.json({ flights, fromCache, fallback: false });
  } catch (error) {
    const ms = Math.round(performance.now() - start);
    console.error(`[API] GET /api/flights -- 500 -- ${ms}ms -- error:`, error);
    // On any error, return fallback flights so the app still works
    return NextResponse.json({
      flights: FALLBACK_FLIGHTS,
      fromCache: false,
      fallback: true,
      error: "Could not reach flight data. Using famous flights!",
    });
  }
}
