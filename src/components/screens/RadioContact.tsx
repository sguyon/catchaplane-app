"use client";

import { motion } from "framer-motion";
import { ATCAvatar } from "@/components/characters/ATCAvatar";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { FlightInfoCard } from "@/components/ui/FlightInfoCard";
import { BigButton } from "@/components/ui/BigButton";
import { useApp } from "@/contexts/AppContext";
import { useStoryGenerator } from "@/hooks/useStoryGenerator";
import { ATC_LINES } from "@/lib/constants";

export function RadioContact() {
  const {
    currentFlight,
    currentProfile,
    savedProfiles,
    goToScreen,
    setCurrentStory,
    isLoading,
    setIsLoading,
  } = useApp();
  const { generateStory } = useStoryGenerator();

  if (!currentFlight) return null;

  const handleTalkToCaptain = async () => {
    setIsLoading(true);
    const story = await generateStory(currentFlight, currentProfile, savedProfiles);
    if (story) {
      setCurrentStory(story);
    }
    setIsLoading(false);
    goToScreen("captain-story");
  };

  return (
    <div className="relative h-full flex flex-col items-center bg-gradient-to-b from-sky via-sky-light to-white overflow-hidden">
      {/* Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[5%] w-24 h-10 bg-white/50 rounded-full"
        />
        <motion.div
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[10%] w-20 h-8 bg-white/40 rounded-full"
        />
      </div>

      {/* ATC header */}
      <div className="relative z-10 flex items-start gap-3 pt-12 px-6 w-full max-w-md">
        <ATCAvatar size="sm" />
        <SpeechBubble variant="atc">
          {ATC_LINES.radioContact(currentFlight.callsign)}
        </SpeechBubble>
      </div>

      {/* CONTACT badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
        className="relative z-10 mt-4"
      >
        <span className="bg-amber text-white font-extrabold text-xs px-4 py-1.5 rounded-full border-2 border-amber-dark tracking-widest">
          CONTACT!
        </span>
      </motion.div>

      {/* Crosshair / viewfinder */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-52 h-52"
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber rounded-br-lg" />

          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-[15%] right-[15%] h-px bg-amber/30" />
          <div className="absolute left-1/2 top-[15%] bottom-[15%] w-px bg-amber/30" />

          {/* Plane in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-sky-light rounded-full flex items-center justify-center border-3 border-sky"
            >
              <svg width="40" height="40" viewBox="0 0 32 32" fill="#0284c7">
                <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Flight info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 px-6 w-full max-w-md"
      >
        <FlightInfoCard flight={currentFlight} />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 px-6 pb-10 pt-4 w-full max-w-md"
      >
        <BigButton
          onClick={handleTalkToCaptain}
          loading={isLoading}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2Z" />
            </svg>
          }
        >
          Talk to the Captain!
        </BigButton>
      </motion.div>
    </div>
  );
}
