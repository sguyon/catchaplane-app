"use client";

import type { Flight } from "@/lib/types";
import { RadarBlip } from "./RadarBlip";

interface RadarDisplayProps {
  flights: Flight[];
  selectedFlight?: Flight | null;
  onFlightSelect?: (flight: Flight) => void;
  offsetX?: number;
  offsetY?: number;
  revealDelay?: number;
  className?: string;
}

// Distribute flights around the radar in a visually pleasing way (deterministic)
function getBlipPosition(index: number, total: number): { x: number; y: number } {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  // Deterministic radius variation based on index
  const radius = 22 + ((index * 7 + 3) % 18);
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

export function RadarDisplay({
  flights,
  selectedFlight,
  onFlightSelect,
  offsetX = 0,
  offsetY = 0,
  revealDelay = 0,
  className = "",
}: RadarDisplayProps) {
  return (
    <div className={`relative w-full aspect-square max-w-[320px] mx-auto ${className}`}>
      {/* Radar background circle */}
      <div className="absolute inset-0 rounded-full bg-navy-dark/80 border-2 border-sky/30 overflow-hidden">
        {/* Concentric rings */}
        {[25, 50, 75].map((size) => (
          <div
            key={size}
            className="absolute border border-sky/15 rounded-full"
            style={{
              width: `${size}%`,
              height: `${size}%`,
              left: `${(100 - size) / 2}%`,
              top: `${(100 - size) / 2}%`,
            }}
          />
        ))}

        {/* Cross lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-sky/10" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-sky/10" />

        {/* Sweep line */}
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
          style={{
            animation: "radar-sweep 4s linear infinite",
            background: "linear-gradient(90deg, rgba(56,189,248,0.6), transparent)",
          }}
        />

        {/* Sweep glow trail */}
        <div
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            animation: "radar-sweep 4s linear infinite",
            width: "50%",
            height: "40%",
            marginTop: "-20%",
            background:
              "conic-gradient(from -30deg, transparent, rgba(56,189,248,0.08), transparent 60deg)",
          }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-sky rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Flight blips */}
        <div
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          {flights.map((flight, i) => {
            const pos = getBlipPosition(i, flights.length);
            return (
              <RadarBlip
                key={flight.id}
                callsign={flight.callsign}
                x={pos.x}
                y={pos.y}
                delay={revealDelay + i * 0.3}
                isSelected={selectedFlight?.id === flight.id}
                onClick={() => onFlightSelect?.(flight)}
                heading={flight.heading || 0}
                showSprite={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
