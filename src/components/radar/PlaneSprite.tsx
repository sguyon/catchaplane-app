"use client";

import { motion } from "framer-motion";

interface PlaneSpriteProps {
  heading?: number; // Bearing in degrees (0-360)
  isSelected?: boolean;
  size?: "sm" | "md" | "lg";
}

// SVG plane icon inspired by aviation symbols
function PlaneIcon({ heading = 0 }: { heading: number }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ transform: `rotate(${heading}deg)` }}
    >
      {/* Fuselage */}
      <ellipse cx="12" cy="12" rx="2.5" ry="5" fill="currentColor" />
      {/* Nose */}
      <polygon points="12,6 11,7 13,7" fill="currentColor" />
      {/* Wings */}
      <rect x="2" y="10" width="20" height="4" rx="2" fill="currentColor" opacity="0.8" />
      {/* Tail stabilizer */}
      <polygon points="12,18 10,15 14,15" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export function PlaneSprite({
  heading = 0,
  isSelected = false,
  size = "md",
}: PlaneSpriteProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Bright colors that stand out on dark radar background
  const colorClass = isSelected ? "text-amber-300" : "text-sky-300";

  return (
    <motion.div
      animate={{
        scale: isSelected ? [1, 1.2, 1] : 1,
        opacity: isSelected ? [1, 0.8, 1] : 1,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`${sizeClasses[size]} ${colorClass}`}
    >
      <PlaneIcon heading={heading} />
    </motion.div>
  );
}
