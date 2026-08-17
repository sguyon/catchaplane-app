"use client";

import { motion } from "framer-motion";
import type { KidProfile } from "@/lib/types";

interface ProfileCardProps {
  profile: KidProfile;
  isSelected?: boolean;
  onSelect: (profile: KidProfile) => void;
  onLongPress?: (profile: KidProfile) => void;
}

export function ProfileCard({
  profile,
  isSelected,
  onSelect,
  onLongPress,
}: ProfileCardProps) {
  let pressTimer: ReturnType<typeof setTimeout>;

  const handleMouseDown = () => {
    pressTimer = setTimeout(() => {
      onLongPress?.(profile);
    }, 500);
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  const handleTouchStart = () => {
    pressTimer = setTimeout(() => {
      onLongPress?.(profile);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimer);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onSelect(profile)}
      className={`
        relative flex flex-col items-center gap-3 p-4 rounded-[20px]
        border-3 transition-all
        ${
          isSelected
            ? "border-amber bg-amber/10"
            : "border-sky/30 bg-sky/5 hover:border-sky/60 hover:bg-sky/10"
        }
      `}
    >
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-sky bg-white flex items-center justify-center">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">
            {profile.gender === "boy"
              ? "👦"
              : profile.gender === "girl"
                ? "👧"
                : "🧒"}
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-lg font-bold text-navy text-center break-words max-w-[80px]">
        {profile.name}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedBadge"
          className="absolute top-2 right-2 bg-amber rounded-full w-6 h-6 flex items-center justify-center"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span className="text-white font-bold text-sm">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}
