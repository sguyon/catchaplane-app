"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CaptainAvatar } from "@/components/characters/CaptainAvatar";
import { StoryCard } from "@/components/ui/StoryCard";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { BigButton } from "@/components/ui/BigButton";
import { useApp } from "@/contexts/AppContext";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { formatStoryForNarration } from "@/lib/story-formatter";

export function CaptainStory() {
  const { currentFlight, currentStory, goToScreen, addToFlightLog } = useApp();
  const { isPlaying, hasAudio, loading: audioLoading, generateAudio, play, toggle } = useAudioPlayer();
  const { aircraftUrl, destinationUrl, generateImages } = useImageGenerator();
  const hasStarted = useRef(false);

  // Generate audio + images in parallel when story is ready
  useEffect(() => {
    if (!currentFlight || !currentStory || hasStarted.current) return;
    hasStarted.current = true;

    const narration = formatStoryForNarration(currentStory, currentFlight);

    // Kick off audio and images in parallel
    generateAudio(narration).then((success) => {
      if (success) {
        play();
      }
    });

    generateImages(currentFlight);
  }, [currentFlight, currentStory, generateAudio, play, generateImages]);

  if (!currentFlight || !currentStory) return null;

  const handleSeeFlights = () => {
    addToFlightLog({
      flight: currentFlight,
      story: currentStory,
      imageUrls: {
        aircraft: aircraftUrl || undefined,
        destination: destinationUrl || undefined,
      },
      timestamp: Date.now(),
    });
    goToScreen("flight-log");
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Aircraft hero image at top */}
      <div className="relative h-40 bg-gradient-to-b from-sky via-sky-light to-white flex items-center justify-center shrink-0 overflow-hidden">
        {aircraftUrl ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={aircraftUrl}
            alt={`${currentFlight.aircraftType} illustration`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <motion.svg
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="white"
            opacity="0.6"
          >
            <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
          </motion.svg>
        )}

        {/* Route overlay */}
        <div className="absolute bottom-3 left-0 right-0 text-center z-10">
          <span className="bg-white/80 backdrop-blur-sm text-navy font-bold text-sm px-4 py-1.5 rounded-full">
            {currentFlight.origin} → {currentFlight.destination}
          </span>
        </div>
      </div>

      {/* AUDIO PLAYER - Prominent but compact */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-white border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AudioPlayer
            captainName={currentStory.captainName}
            isPlaying={isPlaying}
            onToggle={toggle}
            loading={audioLoading}
            hasAudio={hasAudio}
          />
        </motion.div>
      </div>

      {/* Captain introduction */}
      <div className="px-6 py-4 flex items-start gap-3">
        <CaptainAvatar size="md" />
        <div className="flex-1">
          <h2 className="text-navy font-extrabold text-lg">
            {currentStory.captainName}
          </h2>
          <p className="text-navy text-sm line-clamp-2">
            {currentStory.personality}
          </p>
        </div>
      </div>

      {/* Story cards */}
      <div className="px-6 space-y-3 pb-4">
        <StoryCard
          title="On the menu tonight:"
          variant="dinner"
          icon={<span>🍕</span>}
          delay={0.1}
        >
          {currentStory.dinnerMenu}
        </StoryCard>

        <StoryCard
          title={`Flying to ${currentFlight.destination}!`}
          variant="destination"
          icon={<span>🌍</span>}
          delay={0.3}
          imageUrl={destinationUrl || undefined}
        >
          {currentStory.destinationFact}
        </StoryCard>

        <StoryCard
          title="On board today:"
          variant="passenger"
          icon={<span>👦</span>}
          delay={0.5}
        >
          {currentStory.passengerStory}
        </StoryCard>
      </div>

      {/* CTA - See your flights */}
      <div className="px-6 pb-4">
        <BigButton onClick={handleSeeFlights} variant="secondary">
          See Your Flights
        </BigButton>
      </div>
    </div>
  );
}
