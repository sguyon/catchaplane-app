"use client";

import { useState, useCallback } from "react";
import type { Flight } from "@/lib/types";
import { getCachedAircraftImage, getCachedDestinationImage } from "@/lib/image-cache";

interface ImageState {
  aircraftUrl: string | null;
  destinationUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useImageGenerator() {
  const [state, setState] = useState<ImageState>({
    aircraftUrl: null,
    destinationUrl: null,
    loading: false,
    error: null,
  });

  const generateImages = useCallback(async (flight: Flight) => {
    // Use cached images (instant, no API calls needed)
    const aircraftUrl = getCachedAircraftImage(flight.aircraftType);
    const destinationUrl = getCachedDestinationImage(flight.destination);

    setState({
      aircraftUrl,
      destinationUrl,
      loading: false,
      error: null,
    });

    return { aircraftUrl, destinationUrl };
  }, []);

  return {
    ...state,
    generateImages,
  };
}
