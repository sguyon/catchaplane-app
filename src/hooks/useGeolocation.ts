"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
  });

  const requestLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setState({
          location: null,
          error: "Your device doesn't support location.",
          loading: false,
        });
        resolve(null);
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({ location: loc, error: null, loading: false });
          resolve(loc);
        },
        (err) => {
          let message = "We need your location to find planes nearby!";
          if (err.code === err.PERMISSION_DENIED) {
            message = "Please allow location access so we can find planes near you!";
          } else if (err.code === err.TIMEOUT) {
            message = "Finding your location took too long. Let's try again!";
          }
          setState({ location: null, error: message, loading: false });
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000, // Accept cached position up to 1 minute old
        }
      );
    });
  }, []);

  return {
    ...state,
    requestLocation,
  };
}
