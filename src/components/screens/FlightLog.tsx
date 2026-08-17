"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BigButton } from "@/components/ui/BigButton";
import { useApp } from "@/contexts/AppContext";
import { triggerSuccessHaptic } from "@/lib/haptics";

const TOTAL_SLOTS = 12;

const MILESTONES: Record<number, { title: string; subtitle: string }> = {
  1: { title: "First Flight!", subtitle: "You're officially an Air Traffic Controller!" },
  5: { title: "Junior Controller!", subtitle: "5 flights contacted -- you're a natural!" },
  10: { title: "Sky Expert!", subtitle: "10 flights! The planes love talking to you!" },
  20: { title: "Master of the Skies!", subtitle: "20 flights! You're legendary!" },
};

export function FlightLog() {
  const { flightLog, goToScreen, selectFlight, setCurrentStory } = useApp();
  const [showMilestone, setShowMilestone] = useState<{ title: string; subtitle: string } | null>(null);

  // Check for milestone on mount
  useEffect(() => {
    const milestone = MILESTONES[flightLog.length];
    if (milestone) {
      triggerSuccessHaptic();
      setShowMilestone(milestone);
      const timer = setTimeout(() => setShowMilestone(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [flightLog.length]);

  const emptySlots = Math.max(0, TOTAL_SLOTS - flightLog.length);

  const handleScanMore = () => {
    goToScreen("radar-room");
  };

  const handleReplay = (entry: typeof flightLog[0]) => {
    selectFlight(entry.flight);
    setCurrentStory(entry.story);
    goToScreen("captain-story");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-light/30 via-cream to-white overflow-y-auto">
      {/* Milestone celebration overlay */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 px-8"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-[28px] p-8 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-navy font-black text-2xl">{showMilestone.title}</h2>
              <p className="text-navy/60 font-bold text-sm mt-2">{showMilestone.subtitle}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 pt-12 px-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Logbook icon */}
          <div className="w-12 h-12 bg-amber rounded-[14px] flex items-center justify-center border-2 border-amber-dark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path
                d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-navy font-extrabold text-2xl">Flight Log</h1>
            <p className="text-navy/60 font-bold text-sm">
              {flightLog.length} flight{flightLog.length !== 1 ? "s" : ""}{" "}
              contacted!
            </p>
          </div>
        </div>
      </div>

      {/* Flight entries */}
      <div className="flex-1 px-6 space-y-3 pb-4">
        {flightLog.map((entry, i) => (
          <motion.div
            key={entry.timestamp}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[20px] border-2 border-navy/10 p-4 flex items-center gap-3 shadow-sm"
          >
            {/* Plane stamp icon */}
            <div className="w-14 h-14 bg-sky-light rounded-[14px] flex items-center justify-center border-2 border-sky/30 shrink-0">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="#0284c7">
                <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
              </svg>
            </div>

            {/* Flight info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-navy text-base">
                  {entry.flight.aircraftType}
                </span>
                <span className="bg-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {entry.flight.callsign}
                </span>
              </div>
              <p className="text-navy/50 font-semibold text-xs mt-0.5">
                {entry.story.captainName}
              </p>
              <p className="text-navy/40 font-medium text-xs">
                {entry.flight.origin} → {entry.flight.destination}
              </p>
            </div>

            {/* Replay button */}
            <button
              onClick={() => handleReplay(entry)}
              className="w-10 h-10 bg-amber rounded-full flex items-center justify-center border-2 border-amber-dark shrink-0 cursor-pointer"
              aria-label={`Replay ${entry.story.captainName}'s story`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
                <path d="M 5 3 L 17 10 L 5 17 Z" />
              </svg>
            </button>
          </motion.div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (flightLog.length + i) * 0.05 }}
            className="border-2 border-dashed border-navy/15 rounded-[20px] p-4 flex items-center gap-3"
          >
            <div className="w-14 h-14 bg-navy/5 rounded-[14px] flex items-center justify-center shrink-0">
              <span className="text-navy/20 text-2xl font-bold">?</span>
            </div>
            <p className="text-navy/30 font-bold text-sm">Scan to discover!</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="shrink-0 px-6 pb-10 pt-4 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0">
        <BigButton
          onClick={handleScanMore}
          icon={
            <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor">
              <path d="M 2 16 L 12 14 L 18 4 L 20 4 L 17 14 L 26 13 L 28 10 L 30 10 L 28 14 L 28 18 L 30 22 L 28 22 L 26 19 L 17 18 L 20 28 L 18 28 L 12 18 L 2 16 Z" />
            </svg>
          }
        >
          Scan More Planes!
        </BigButton>
      </div>
    </div>
  );
}
