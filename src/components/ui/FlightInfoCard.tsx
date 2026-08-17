"use client";

import type { Flight } from "@/lib/types";

interface FlightInfoCardProps {
  flight: Flight;
  className?: string;
}

export function FlightInfoCard({ flight, className = "" }: FlightInfoCardProps) {
  return (
    <div
      className={`backdrop-blur-md bg-white/80 border-2 border-white/60 rounded-[20px] px-5 py-4 shadow-lg ${className}`}
    >
      {/* Aircraft type */}
      <div className="text-navy font-extrabold text-lg">
        {flight.aircraftType}
      </div>

      {/* Callsign badge */}
      <div className="mt-1 inline-flex items-center gap-1.5">
        <span className="bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full font-mono tracking-wider">
          {flight.callsign}
        </span>
      </div>

      {/* Route */}
      <div className="mt-2 flex items-center gap-2 text-navy/70 font-semibold text-sm">
        <span>{flight.origin}</span>
        <svg width="20" height="12" viewBox="0 0 20 12" className="text-amber">
          <path
            d="M 0 6 L 16 6 M 12 2 L 17 6 L 12 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span>{flight.destination}</span>
      </div>
    </div>
  );
}
