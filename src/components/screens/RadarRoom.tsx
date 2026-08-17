"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ATCAvatar } from "@/components/characters/ATCAvatar";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { RadarDisplay } from "@/components/radar/RadarDisplay";
import { useApp } from "@/contexts/AppContext";
import { useFlights } from "@/hooks/useFlights";
import { useGyroscope } from "@/hooks/useGyroscope";
import { useRadioSound } from "@/hooks/useRadioSound";
import { CONFIG } from "@/lib/constants";
import { triggerLockOnHaptic } from "@/lib/haptics";

// Default location (Paris CDG) used when geolocation is unavailable
const DEFAULT_LOCATION = { lat: 49.0097, lng: 2.5479 };

type ScanPhase = "scanning" | "detected" | "locking" | "locked";

const PHASE_MESSAGES: Record<ScanPhase, string> = {
  scanning: "Scanning the skies...",
  detected: "Wait... I'm picking up signals!",
  locking: "I see planes! Locking on...",
  locked: "Target acquired!",
};

const PHASE_TITLES: Record<ScanPhase, string> = {
  scanning: "SCANNING RADAR",
  detected: "SIGNAL DETECTED",
  locking: "LOCKING ON",
  locked: "TARGET LOCKED",
};

export function RadarRoom() {
  const { location, flights: contextFlights, setFlights, selectFlight, goToScreen } = useApp();
  const { fetchFlights, loading: flightsLoading, isFallback } = useFlights();
  const { offsetX, offsetY, requestPermission } = useGyroscope();
  const { play: playRadioSound, stop: stopRadioSound } = useRadioSound();
  const autoSelectTimer = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);
  const hasRequestedGyro = useRef(false);
  const hasStartedSound = useRef(false);
  const [scanPhase, setScanPhase] = useState<ScanPhase>("scanning");
  const [showBlips, setShowBlips] = useState(false);
  const phaseTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Request gyroscope permission on mount (iOS needs explicit permission)
  useEffect(() => {
    if (hasRequestedGyro.current) return;
    hasRequestedGyro.current = true;
    requestPermission();
  }, [requestPermission]);

  // Play radio sound on mount (follows user gesture chain from START SCANNING tap)
  useEffect(() => {
    if (hasStartedSound.current) return;
    hasStartedSound.current = true;
    playRadioSound();
    return () => stopRadioSound();
  }, [playRadioSound, stopRadioSound]);

  // Fetch real flights when screen mounts
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function loadFlights() {
      const loc = location || DEFAULT_LOCATION;
      const fetched = await fetchFlights(loc.lat, loc.lng);
      if (fetched.length > 0) {
        setFlights(fetched);
      }
    }

    loadFlights();
  }, [location, fetchFlights, setFlights]);

  // Phased scanning sequence -- timed reveals for drama
  useEffect(() => {
    if (contextFlights.length === 0 || flightsLoading) return;

    // Phase 1 (0s): Already "scanning" by default
    // Phase 2 (~2s): "Signal detected!" -- show blips start appearing
    const t1 = setTimeout(() => {
      setScanPhase("detected");
      setShowBlips(true);
    }, 2000);

    // Phase 3 (~4s): "Locking on..."
    const t2 = setTimeout(() => {
      setScanPhase("locking");
    }, 4000);

    // Phase 4 (~5.5s): "Target locked!" just before auto-select
    const t3 = setTimeout(() => {
      setScanPhase("locked");
    }, 5500);

    phaseTimers.current = [t1, t2, t3];

    return () => {
      phaseTimers.current.forEach(clearTimeout);
    };
  }, [contextFlights.length, flightsLoading]);

  const handleFlightSelect = useCallback(
    (flight: typeof contextFlights[0]) => {
      if (autoSelectTimer.current) {
        clearTimeout(autoSelectTimer.current);
      }
      phaseTimers.current.forEach(clearTimeout);
      stopRadioSound();
      triggerLockOnHaptic();
      selectFlight(flight);
      goToScreen("radio-contact");
    },
    [selectFlight, goToScreen, stopRadioSound]
  );

  // Auto-select a random flight after delay
  useEffect(() => {
    if (contextFlights.length === 0 || flightsLoading) return;

    autoSelectTimer.current = setTimeout(() => {
      const randomFlight = contextFlights[Math.floor(Math.random() * contextFlights.length)];
      handleFlightSelect(randomFlight);
    }, CONFIG.radarAutoSelectDelay);

    return () => {
      if (autoSelectTimer.current) {
        clearTimeout(autoSelectTimer.current);
      }
    };
  }, [contextFlights, flightsLoading, handleFlightSelect]);

  const speechText = flightsLoading
    ? "Scanning the skies..."
    : isFallback
      ? "No planes nearby... Let's try a famous flight!"
      : PHASE_MESSAGES[scanPhase];

  const titleText = flightsLoading ? "SCANNING RADAR" : PHASE_TITLES[scanPhase];

  const titleColor =
    scanPhase === "locked" ? "text-amber" : scanPhase === "locking" ? "text-sky" : "text-sky";

  return (
    <div className="relative h-full flex flex-col items-center bg-navy-dark overflow-hidden">
      {/* Stars / sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + (i % 3),
              delay: (i % 5) * 0.4,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Header with ATC */}
      <div className="relative z-10 flex items-start gap-3 pt-12 px-6 w-full max-w-md">
        <ATCAvatar size="sm" />
        <AnimatePresence mode="wait">
          <motion.div
            key={speechText}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
          >
            <SpeechBubble variant="atc">{speechText}</SpeechBubble>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scanning Radar title -- pulses during scanning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mt-4"
      >
        <AnimatePresence mode="wait">
          <motion.h2
            key={titleText}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [1, scanPhase === "locked" ? 1.1 : 1.05, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className={`${titleColor} font-extrabold text-2xl text-center tracking-wide`}
          >
            {titleText}
          </motion.h2>
        </AnimatePresence>
        <p className="text-sky/50 font-semibold text-sm text-center mt-1">
          {scanPhase === "scanning" || flightsLoading
            ? "Searching for aircraft..."
            : scanPhase === "detected"
              ? "Tilt your phone to find planes"
              : scanPhase === "locking"
                ? "Almost there..."
                : "Got one!"}
        </p>
      </motion.div>

      {/* Radar display */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-8 py-4">
        {flightsLoading ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-2 border-sky/30 rounded-full border-t-sky"
            />
            <span className="text-sky/60 font-bold text-sm">Finding planes...</span>
          </div>
        ) : (
          <RadarDisplay
            flights={showBlips ? contextFlights : []}
            onFlightSelect={handleFlightSelect}
            offsetX={offsetX}
            offsetY={offsetY}
            revealDelay={0.2}
          />
        )}
      </div>

      {/* Bottom instruction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 pb-10 px-6 flex items-center justify-center gap-3"
      >
        <div className="bg-sky/20 rounded-[20px] px-5 py-3 flex items-center gap-3">
          {/* Radio wave icon during scanning, phone tilt icon after */}
          {scanPhase === "scanning" || flightsLoading ? (
            <motion.div className="flex items-end gap-0.5 h-6 w-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-sky rounded-full"
                  animate={{ height: ["4px", `${10 + i * 4}px`, "4px"] }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <rect
                x="5"
                y="2"
                width="14"
                height="20"
                rx="3"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <circle cx="12" cy="18" r="1.5" fill="#38bdf8" />
            </motion.svg>
          )}
          <span className="text-sky/70 font-bold text-sm">
            {flightsLoading
              ? "Scanning..."
              : !showBlips
                ? "Searching frequencies..."
                : `${contextFlights.length} flights detected!`}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
