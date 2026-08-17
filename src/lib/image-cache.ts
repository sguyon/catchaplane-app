/**
 * Precached images from free stock photo services (Unsplash, Pixabay)
 * Used instead of DALL-E generation to reduce costs and improve performance
 */

interface ImageCache {
  aircraft: Record<string, string>;
  destinations: Record<string, string>;
}

export const IMAGE_CACHE: ImageCache = {
  // Aircraft images - diverse plane types
  aircraft: {
    // Default fallback
    default:
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    // Airbus family
    "Airbus A320":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Airbus A330":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Airbus A350":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Airbus A380":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    // Boeing family
    "Boeing 737":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Boeing 777":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Boeing 787":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    // Other aircraft
    "Bombardier Global":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    "Embraer E190":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
    // Fallback for unknown airlines
    "Airliner":
      "https://images.unsplash.com/photo-1548995307-d51695d13b2f?w=1024&h=768&fit=crop&q=80",
  },

  // Destination landmark images - cached to avoid generation
  destinations: {
    // US
    "NEW YORK":
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1024&h=768&fit=crop&q=80",
    "SAN FRANCISCO":
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=768&fit=crop&q=80",
    "LOS ANGELES":
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=768&fit=crop&q=80",
    "MIAMI":
      "https://images.unsplash.com/photo-1532619675605-1ede6c2e3e27?w=1024&h=768&fit=crop&q=80",
    "CHICAGO":
      "https://images.unsplash.com/photo-1494522510464-beb4379642fe?w=1024&h=768&fit=crop&q=80",
    "ATLANTA":
      "https://images.unsplash.com/photo-1490383840923-41e2e5b93d9e?w=1024&h=768&fit=crop&q=80",
    "WASHINGTON D.C.":
      "https://images.unsplash.com/photo-1489154488889-453e66b5d5ce?w=1024&h=768&fit=crop&q=80",

    // Europe
    "PARIS":
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1024&h=768&fit=crop&q=80",
    "LONDON":
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1024&h=768&fit=crop&q=80",
    "AMSTERDAM":
      "https://images.unsplash.com/photo-1534351173927-9a097c32d9db?w=1024&h=768&fit=crop&q=80",
    "ROME":
      "https://images.unsplash.com/photo-1552832230-8dfd3b0e3f6b?w=1024&h=768&fit=crop&q=80",
    "BARCELONA":
      "https://images.unsplash.com/photo-1562883676-8c6b0d8b5c6d?w=1024&h=768&fit=crop&q=80",
    "MOSCOW":
      "https://images.unsplash.com/photo-1519501678807-85d78b3fb2cc?w=1024&h=768&fit=crop&q=80",
    "ISTANBUL":
      "https://images.unsplash.com/photo-1524521252212-7f2a0e77de52?w=1024&h=768&fit=crop&q=80",
    "BERLIN":
      "https://images.unsplash.com/photo-1571896195881-99d4f1c5e158?w=1024&h=768&fit=crop&q=80",
    "FRANKFURT":
      "https://images.unsplash.com/photo-1567539794588-9f8056997f81?w=1024&h=768&fit=crop&q=80",
    "DUBLIN":
      "https://images.unsplash.com/photo-1532619675605-1ede6c2e3e27?w=1024&h=768&fit=crop&q=80",
    "MADRID":
      "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1024&h=768&fit=crop&q=80",
    "VIENNA":
      "https://images.unsplash.com/photo-1516110422313-52581002a659?w=1024&h=768&fit=crop&q=80",
    "ZURICH":
      "https://images.unsplash.com/photo-1585396969922-e3d79f06c843?w=1024&h=768&fit=crop&q=80",
    "BRUSSELS":
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1024&h=768&fit=crop&q=80",
    "PRAGUE":
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=1024&h=768&fit=crop&q=80",
    "STOCKHOLM":
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1024&h=768&fit=crop&q=80",
    "HELSINKI":
      "https://images.unsplash.com/photo-1541679379-97eb1b8dd46f?w=1024&h=768&fit=crop&q=80",
    "WARSAW":
      "https://images.unsplash.com/photo-1500595046891-87a88eaf8067?w=1024&h=768&fit=crop&q=80",
    "LISBON":
      "https://images.unsplash.com/photo-1565008576549-bdde6e1bbd2d?w=1024&h=768&fit=crop&q=80",

    // Asia
    "TOKYO":
      "https://images.unsplash.com/photo-1540959375944-7049f642e9d8?w=1024&h=768&fit=crop&q=80",
    "BEIJING":
      "https://images.unsplash.com/photo-1588084062227-e8e9b9c10e75?w=1024&h=768&fit=crop&q=80",
    "HONG KONG":
      "https://images.unsplash.com/photo-1501858915551-4e8d30928e4f?w=1024&h=768&fit=crop&q=80",
    "SHANGHAI":
      "https://images.unsplash.com/photo-1595432707802-6b2626ef1c91?w=1024&h=768&fit=crop&q=80",
    "BANGKOK":
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1024&h=768&fit=crop&q=80",
    "SINGAPORE":
      "https://images.unsplash.com/photo-1531651299228-7bae827c0ee1?w=1024&h=768&fit=crop&q=80",
    "SEOUL":
      "https://images.unsplash.com/photo-1530602884003-1cdf60f08936?w=1024&h=768&fit=crop&q=80",
    "MUMBAI":
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1024&h=768&fit=crop&q=80",
    "TAIPEI":
      "https://images.unsplash.com/photo-1547981609-4b6bfe74e6a7?w=1024&h=768&fit=crop&q=80",
    "GUANGZHOU":
      "https://images.unsplash.com/photo-1595432707802-6b2626ef1c91?w=1024&h=768&fit=crop&q=80",
    "DELHI":
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=1024&h=768&fit=crop&q=80",
    "JAKARTA":
      "https://images.unsplash.com/photo-1593865890768-e436de966e1d?w=1024&h=768&fit=crop&q=80",
    "KUALA LUMPUR":
      "https://images.unsplash.com/photo-1544074230-b83b2b23cec6?w=1024&h=768&fit=crop&q=80",
    "HANOI":
      "https://images.unsplash.com/photo-1531522564256-5c5b26ecb237?w=1024&h=768&fit=crop&q=80",
    "MANILA":
      "https://images.unsplash.com/photo-1593865890768-e436de966e1d?w=1024&h=768&fit=crop&q=80",

    // Oceania & Middle East
    "SYDNEY":
      "https://images.unsplash.com/photo-1506973404872-a4111814034e?w=1024&h=768&fit=crop&q=80",
    "DUBAI":
      "https://images.unsplash.com/photo-1512453694671-e11007f17c73?w=1024&h=768&fit=crop&q=80",
    "CAIRO":
      "https://images.unsplash.com/photo-1567526464027-f127ff144326?w=1024&h=768&fit=crop&q=80",
    "ADDIS ABABA":
      "https://images.unsplash.com/photo-1567526464027-f127ff144326?w=1024&h=768&fit=crop&q=80",
    "JOHANNESBURG":
      "https://images.unsplash.com/photo-1517622361917-98e1a38db3ba?w=1024&h=768&fit=crop&q=80",
    "CASABLANCA":
      "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1024&h=768&fit=crop&q=80",
    "BEIRUT":
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1024&h=768&fit=crop&q=80",

    // Americas
    "TORONTO":
      "https://images.unsplash.com/photo-1549144611-11ee7da8f73e?w=1024&h=768&fit=crop&q=80",
    "RIO DE JANEIRO":
      "https://images.unsplash.com/photo-1483729558449-99daa71bed51?w=1024&h=768&fit=crop&q=80",
    "FORT LAUDERDALE":
      "https://images.unsplash.com/photo-1532619675605-1ede6c2e3e27?w=1024&h=768&fit=crop&q=80",
    "DALLAS":
      "https://images.unsplash.com/photo-1516991490227-7e48dc2ae7f0?w=1024&h=768&fit=crop&q=80",

    // Fallback
    default:
      "https://images.unsplash.com/photo-1506973404872-a4111814034e?w=1024&h=768&fit=crop&q=80",
  },
};

/**
 * Get a cached aircraft image URL
 */
export function getCachedAircraftImage(aircraftType: string): string {
  const normalized = aircraftType.trim();
  const cached = IMAGE_CACHE.aircraft[normalized];

  if (cached) {
    return cached;
  }

  // Fallback: log if aircraft type not found for debugging
  if (typeof window !== "undefined") {
    console.warn(`[ImageCache] No cached aircraft image for: "${aircraftType}" (normalized: "${normalized}")`);
  }

  return IMAGE_CACHE.aircraft.default;
}

/**
 * Get a cached destination image URL
 */
export function getCachedDestinationImage(destination: string): string {
  const normalized = destination.toUpperCase().trim();
  const cached = IMAGE_CACHE.destinations[normalized];

  if (cached) {
    return cached;
  }

  // Fallback: log if destination not found for debugging
  if (typeof window !== "undefined") {
    console.warn(`[ImageCache] No cached destination image for: "${destination}" (normalized: "${normalized}")`);
  }

  return IMAGE_CACHE.destinations.default;
}
