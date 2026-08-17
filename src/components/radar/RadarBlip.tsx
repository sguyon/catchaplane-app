"use client";

import { motion } from "framer-motion";
import { PlaneSprite } from "./PlaneSprite";

interface RadarBlipProps {
  callsign: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  isSelected?: boolean;
  onClick?: () => void;
  delay?: number;
  heading?: number; // Optional: plane heading in degrees
  showSprite?: boolean; // Show animated plane sprite instead of dot
}

export function RadarBlip({
  callsign,
  x,
  y,
  isSelected = false,
  onClick,
  delay = 0,
  heading = 0,
  showSprite = true,
}: RadarBlipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", bounce: 0.5 }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-0 p-0 hover:scale-110 transition-transform"
        aria-label={`Flight ${callsign}`}
      >
        {/* Animated plane sprite or blip dot */}
        {showSprite ? (
          <PlaneSprite
            heading={heading}
            isSelected={isSelected}
            size="md"
          />
        ) : (
          <div
            className={`w-3 h-3 rounded-full ${
              isSelected ? "bg-amber" : "bg-sky"
            }`}
            style={{ animation: "blip-pulse 2s infinite" }}
          />
        )}
        {/* Callsign label */}
        <span className="text-[10px] font-mono font-bold text-sky/80 tracking-wider">
          {callsign}
        </span>
      </button>
    </motion.div>
  );
}
