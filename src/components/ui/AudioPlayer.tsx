"use client";

import { CaptainAvatar } from "@/components/characters/CaptainAvatar";

interface AudioPlayerProps {
  captainName: string;
  isPlaying?: boolean;
  onToggle?: () => void;
  loading?: boolean;
  hasAudio?: boolean;
  className?: string;
}

export function AudioPlayer({
  captainName,
  isPlaying = false,
  onToggle,
  loading = false,
  hasAudio = true,
  className = "",
}: AudioPlayerProps) {
  const statusText = loading
    ? "Preparing voice..."
    : !hasAudio
      ? "Voice not available"
      : isPlaying
        ? `${captainName} is speaking...`
        : "Tap to play";

  return (
    <div
      className={`bg-navy rounded-[20px] px-5 py-4 flex items-center gap-4 shadow-lg ${className}`}
    >
      {/* Captain avatar with speaking indicator */}
      <div className="relative shrink-0">
        <CaptainAvatar size="md" />
        {isPlaying && (
          <div
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald rounded-full border-2 border-navy"
            style={{ animation: "speaking-pulse 1s infinite" }}
          />
        )}
      </div>

      {/* Waveform visualization */}
      <div className="flex-1 flex items-center gap-1 h-10">
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-sky rounded-full min-w-1"
            style={{
              animation: isPlaying
                ? `waveform 0.8s ease-in-out ${i * 0.045}s infinite`
                : loading
                  ? `waveform 1.2s ease-in-out ${i * 0.07}s infinite`
                  : "none",
              opacity: loading ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Play/Pause button - responsive size */}
      <button
        onClick={onToggle}
        disabled={loading || !hasAudio}
        className="w-14 h-14 bg-amber rounded-full flex items-center justify-center shadow-md border-2 border-amber-600 cursor-pointer disabled:opacity-40 disabled:cursor-default shrink-0 hover:scale-110 transition-transform active:scale-95"
        aria-label={loading ? "Loading audio" : isPlaying ? "Pause" : "Play"}
      >
        {loading ? (
          <svg width="28" height="28" viewBox="0 0 20 20" fill="white" className="animate-spin">
            <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2" fill="none" strokeDasharray="40" strokeDashoffset="10" />
          </svg>
        ) : isPlaying ? (
          <svg width="28" height="28" viewBox="0 0 20 20" fill="white">
            <rect x="4" y="3" width="4" height="14" rx="1" />
            <rect x="12" y="3" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 20 20" fill="white">
            <path d="M 5 3 L 17 10 L 5 17 Z" />
          </svg>
        )}
      </button>

      {/* Speaking text */}
      <div className="hidden sm:flex flex-col text-white/70 text-xs font-semibold min-w-fit">
        <div className="text-white text-xs font-bold">{statusText}</div>
        <div className="text-white/60">{captainName}</div>
      </div>
    </div>
  );
}
