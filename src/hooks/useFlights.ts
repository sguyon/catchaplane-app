"use client";

import { useState, useCallback } from "react";
import type { Flight } from "@/lib/types";

interface FlightsState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

export function useFlights() {
  const [state, setState] = useState<FlightsState>({
    flights: [],
    loading: false,
    error: null,
    isFallback: false,
  });

  const fetchFlights = useCallback(async (lat: number, lng: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/flights?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch flights");
      }

      setState({
        flights: data.flights,
        loading: false,
        error: null,
        isFallback: data.fallback || false,
      });

      return data.flights as Flight[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not find flights";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      return [];
    }
  }, []);

  return {
    ...state,
    fetchFlights,
  };
}
