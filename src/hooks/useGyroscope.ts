"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GyroscopeState {
  offsetX: number;
  offsetY: number;
  supported: boolean;
  permissionGranted: boolean;
}

/**
 * Maps device orientation to X/Y offset for radar tilt effect.
 * Range: -30px to +30px based on gamma (left/right) and beta (forward/back).
 */
export function useGyroscope() {
  const [state, setState] = useState<GyroscopeState>({
    offsetX: 0,
    offsetY: 0,
    supported: false,
    permissionGranted: false,
  });
  const rafRef = useRef<number | null>(null);
  const latestAngles = useRef({ gamma: 0, beta: 0 });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    // iOS 13+ requires explicit permission request
    const doeNeedPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === "function";

    if (doeNeedPermission) {
      try {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission === "granted") {
          setState((prev) => ({ ...prev, permissionGranted: true }));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    // Non-iOS or older browsers: permission is implicit
    if (typeof DeviceOrientationEvent !== "undefined") {
      setState((prev) => ({ ...prev, permissionGranted: true }));
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    // Check support
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      return;
    }

    setState((prev) => ({ ...prev, supported: true }));

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0; // Left-right tilt (-90 to 90)
      const beta = event.beta || 0;   // Front-back tilt (-180 to 180)
      latestAngles.current = { gamma, beta };
    };

    const updateOffset = () => {
      const { gamma, beta } = latestAngles.current;

      // Clamp and map to pixel offset (max 30px in each direction)
      const clampedGamma = Math.max(-30, Math.min(30, gamma));
      const clampedBeta = Math.max(-30, Math.min(30, beta - 30)); // Subtract 30 because phones are usually held at ~30 degrees

      const offsetX = (clampedGamma / 30) * 30;
      const offsetY = (clampedBeta / 30) * 30;

      setState((prev) => ({
        ...prev,
        offsetX: Math.round(offsetX * 10) / 10,
        offsetY: Math.round(offsetY * 10) / 10,
      }));

      rafRef.current = requestAnimationFrame(updateOffset);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    rafRef.current = requestAnimationFrame(updateOffset);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    ...state,
    requestPermission,
  };
}
