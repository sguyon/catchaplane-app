import type { Flight } from "./types";

// OpenSky Network API response types
interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  true_track: number | null;
}

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][] | null;
}

// Simple in-memory cache
let cachedFlights: { flights: Flight[]; timestamp: number; key: string } | null = null;

function cacheKey(lat: number, lng: number): string {
  // Round to 0.1 degree grid for cache bucketing
  return `${Math.round(lat * 10) / 10},${Math.round(lng * 10) / 10}`;
}

function isCacheValid(lat: number, lng: number, ttl: number): boolean {
  if (!cachedFlights) return false;
  const key = cacheKey(lat, lng);
  return cachedFlights.key === key && Date.now() - cachedFlights.timestamp < ttl;
}

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Calculate bounding box from center point + radius in km
function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const R = 6371; // Earth radius in km
  const dLat = radiusKm / R;
  const dLng = radiusKm / (R * Math.cos(toRad(lat)));

  const latDeg = (dLat * 180) / Math.PI;
  const lngDeg = (dLng * 180) / Math.PI;

  return {
    lamin: lat - latDeg,
    lamax: lat + latDeg,
    lomin: lng - lngDeg,
    lomax: lng + lngDeg,
  };
}

// Known ICAO type codes -> friendly aircraft names
const AIRCRAFT_TYPES: Record<string, string> = {
  A20N: "Airbus A320neo",
  A21N: "Airbus A321neo",
  A319: "Airbus A319",
  A320: "Airbus A320",
  A321: "Airbus A321",
  A332: "Airbus A330",
  A333: "Airbus A330",
  A339: "Airbus A330neo",
  A343: "Airbus A340",
  A359: "Airbus A350",
  A35K: "Airbus A350",
  A388: "Airbus A380",
  B738: "Boeing 737",
  B737: "Boeing 737",
  B38M: "Boeing 737 MAX",
  B39M: "Boeing 737 MAX",
  B744: "Boeing 747",
  B748: "Boeing 747",
  B752: "Boeing 757",
  B763: "Boeing 767",
  B772: "Boeing 777",
  B77W: "Boeing 777",
  B788: "Boeing 787",
  B789: "Boeing 787",
  B78X: "Boeing 787",
  E190: "Embraer E190",
  E195: "Embraer E195",
  CRJ9: "Bombardier CRJ900",
  DH8D: "Dash 8",
};

function guessAircraftType(callsign: string): string {
  // Try to infer from airline prefix
  const prefix = callsign.slice(0, 3).toUpperCase();
  const airlines: Record<string, string> = {
    AAL: "Boeing 737",
    BAW: "Boeing 777",
    DAL: "Boeing 737",
    UAL: "Boeing 737",
    AFR: "Airbus A320",
    DLH: "Airbus A320",
    EZY: "Airbus A320",
    RYR: "Boeing 737",
    SWA: "Boeing 737",
    JBU: "Airbus A320",
    UAE: "Boeing 777",
    SIA: "Airbus A350",
    ANA: "Boeing 787",
    JAL: "Boeing 787",
    QFA: "Boeing 787",
    KLM: "Boeing 737",
    THY: "Airbus A330",
  };
  return airlines[prefix] || "Airliner";
}

// Map callsign prefix to airline origin city (rough heuristic)
function guessOriginDestination(callsign: string): { origin: string; destination: string } {
  const prefix = callsign.slice(0, 3).toUpperCase();
  const hubs: Record<string, string> = {
    AAL: "Dallas",
    BAW: "London",
    DAL: "Atlanta",
    UAL: "Chicago",
    AFR: "Paris",
    DLH: "Frankfurt",
    EZY: "London",
    RYR: "Dublin",
    SWA: "Dallas",
    JBU: "New York",
    UAE: "Dubai",
    SIA: "Singapore",
    ANA: "Tokyo",
    JAL: "Tokyo",
    QFA: "Sydney",
    KLM: "Amsterdam",
    THY: "Istanbul",
    TAP: "Lisbon",
    IBE: "Madrid",
    AZA: "Rome",
    SAS: "Stockholm",
    FIN: "Helsinki",
    LOT: "Warsaw",
    CSA: "Prague",
    AUA: "Vienna",
    SWR: "Zurich",
    BEL: "Brussels",
    EIN: "Dublin",
    VIR: "London",
    NKS: "Fort Lauderdale",
    AAR: "Seoul",
    CPA: "Hong Kong",
    CAL: "Taipei",
    EVA: "Taipei",
    CCA: "Beijing",
    CSN: "Guangzhou",
    CES: "Shanghai",
    AIC: "Delhi",
    ETH: "Addis Ababa",
    SAA: "Johannesburg",
    RAM: "Casablanca",
    MSR: "Cairo",
    MEA: "Beirut",
    GIA: "Jakarta",
    MAS: "Kuala Lumpur",
    THA: "Bangkok",
    VNA: "Hanoi",
    PAL: "Manila",
  };

  // Pick a destination that's different from origin
  const destinations = [
    "New York", "London", "Paris", "Tokyo", "Dubai",
    "Sydney", "Rome", "Berlin", "Amsterdam", "Singapore",
    "Los Angeles", "Miami", "Barcelona", "Istanbul", "Seoul",
  ];

  const origin = hubs[prefix] || "Unknown";
  // Pick a destination that isn't the origin
  const filtered = destinations.filter((d) => d !== origin);
  const destination = filtered[Math.abs(hashCode(callsign)) % filtered.length];
  return { origin, destination };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export async function fetchNearbyFlights(
  lat: number,
  lng: number,
  radiusKm: number,
  cacheTTL: number
): Promise<{ flights: Flight[]; fromCache: boolean }> {
  // Check cache first
  if (isCacheValid(lat, lng, cacheTTL)) {
    return { flights: cachedFlights!.flights, fromCache: true };
  }

  const bbox = getBoundingBox(lat, lng, radiusKm);
  const url = `https://opensky-network.org/api/states/all?lamin=${bbox.lamin}&lomin=${bbox.lomin}&lamax=${bbox.lamax}&lomax=${bbox.lomax}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data: OpenSkyResponse = await response.json();

  if (!data.states || data.states.length === 0) {
    return { flights: [], fromCache: false };
  }

  // OpenSky state vector indices:
  // 0=icao24, 1=callsign, 2=origin_country, 5=longitude, 6=latitude, 7=baro_altitude, 10=true_track
  const flights: Flight[] = data.states
    .filter((s) => s[1] && s[5] != null && s[6] != null) // must have callsign + position
    .map((s) => {
      const callsign = (s[1] as string).trim();
      const { origin, destination } = guessOriginDestination(callsign);
      return {
        id: s[0] as string,
        callsign,
        aircraftType: guessAircraftType(callsign),
        origin,
        destination,
        latitude: s[6] as number,
        longitude: s[5] as number,
        altitude: s[7] as number | undefined,
        heading: s[10] as number | undefined,
      };
    })
    // Only keep flights with a known origin AND destination -- no "Unknown",
    // so kids never get "Unknown -> London". Flights whose callsign prefix
    // isn't in our hub map are dropped.
    .filter(
      (f) =>
        f.callsign.length > 0 &&
        f.origin !== "Unknown" &&
        f.destination !== "Unknown"
    )
    .slice(0, 20); // Limit to 20 flights for radar display

  // Update cache
  cachedFlights = {
    flights,
    timestamp: Date.now(),
    key: cacheKey(lat, lng),
  };

  return { flights, fromCache: false };
}
