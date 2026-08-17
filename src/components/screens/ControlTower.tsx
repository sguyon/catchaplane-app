"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { BigButton } from "@/components/ui/BigButton";
import { useApp } from "@/contexts/AppContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { ATC_LINES } from "@/lib/constants";

export function ControlTower() {
  const { goToScreen, setLocation, currentProfile } = useApp();
  const { requestLocation, loading: geoLoading, error: geoError } = useGeolocation();
  const [locationDenied, setLocationDenied] = useState(false);

  const handleStartScanning = async () => {
    const loc = await requestLocation();
    if (loc) {
      setLocation(loc);
      goToScreen("radar-room");
    } else {
      setLocationDenied(true);
      // Still allow proceeding with fallback flights (no location)
      setTimeout(() => goToScreen("radar-room"), 1500);
    }
  };

  const handleChangeProfile = () => {
    goToScreen("profile-select");
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky via-sky-light to-white">
      {/* Sky decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Clouds */}
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] left-[10%] w-20 h-8 bg-white/60 rounded-full"
        />
        <motion.div
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-16 h-6 bg-white/40 rounded-full"
        />
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[30%] w-12 h-5 bg-white/50 rounded-full"
        />

        {/* Flying plane */}
        <motion.div
          initial={{ x: -100, y: 60 }}
          animate={{ x: "calc(100vw + 100px)", y: 20 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
          className="absolute top-[10%]"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="white" opacity="0.7">
            <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
          </svg>
        </motion.div>

        {/* Control tower silhouette */}
        <div className="absolute top-[2%] left-1/2 -translate-x-1/2">
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none" opacity="0.15">
            <rect x="30" y="30" width="20" height="70" fill="currentColor" />
            <rect x="15" y="20" width="50" height="15" rx="3" fill="currentColor" />
            <rect x="20" y="10" width="40" height="12" rx="2" fill="currentColor" />
            <circle cx="40" cy="8" r="4" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Main content - centered with safe area */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4 pt-safe pb-28 gap-3 h-full">
        {/* ATC greeting at top - KEEP THIS VISIBLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0"
        >
          <SpeechBubble variant="atc">
            {locationDenied
              ? "No worries! Let's try some famous flights instead!"
              : geoError
                ? geoError
                : typeof ATC_LINES.welcome === "function"
                  ? ATC_LINES.welcome(currentProfile?.name)
                  : ATC_LINES.welcome}
          </SpeechBubble>
        </motion.div>

        {/* LARGE PROFILE SECTION - BIG AND CENTRAL */}
        {currentProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
            className="flex flex-col items-center gap-4 bg-white rounded-[32px] p-6 shadow-2xl border-4 border-sky flex-shrink-0"
          >
            {/* HUGE Avatar */}
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-sky bg-sky/10 flex items-center justify-center flex-shrink-0">
              {currentProfile.avatarUrl ? (
                <img
                  src={currentProfile.avatarUrl}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl">
                  {currentProfile.gender === "boy"
                    ? "👦"
                    : currentProfile.gender === "girl"
                      ? "👧"
                      : "🧒"}
                </span>
              )}
            </div>

            {/* HUGE Name */}
            <h2 className="text-4xl font-black text-navy text-center leading-tight">
              {currentProfile.name}
            </h2>

            {/* Change Pilot Button - HUGE and obvious */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleChangeProfile}
              className="w-full bg-amber hover:bg-amber/90 active:bg-amber-dark text-white font-black px-6 py-3 rounded-[28px] text-xl shadow-lg transition-colors"
            >
              ✏️ Change Pilot
            </motion.button>
          </motion.div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* CTA Button at bottom - HUGE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full flex-shrink-0"
        >
          <BigButton
            onClick={handleStartScanning}
            loading={geoLoading}
            icon={
              <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
                <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
              </svg>
            }
          >
            START SCANNING
          </BigButton>
        </motion.div>
      </div>

      {/* Runway dashes at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 pb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-1.5 bg-navy/20 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
