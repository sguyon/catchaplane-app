"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StoryCardProps {
  title: string;
  children: string;
  variant: "dinner" | "destination" | "passenger";
  icon: ReactNode;
  delay?: number;
  imageUrl?: string;
  className?: string;
}

const VARIANT_STYLES = {
  dinner: {
    bg: "bg-emerald-light",
    border: "border-emerald",
    iconBg: "bg-emerald",
  },
  destination: {
    bg: "bg-indigo-light",
    border: "border-indigo",
    iconBg: "bg-indigo",
  },
  passenger: {
    bg: "bg-rose-light",
    border: "border-rose",
    iconBg: "bg-rose",
  },
} as const;

export function StoryCard({
  title,
  children,
  variant,
  icon,
  delay = 0,
  imageUrl,
  className = "",
}: StoryCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", bounce: 0.3 }}
      className={`${styles.bg} ${styles.border} border-2 rounded-[20px] overflow-hidden ${className}`}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`${styles.iconBg} text-white w-8 h-8 rounded-full flex items-center justify-center text-lg`}
          >
            {icon}
          </div>
          <h3 className="font-extrabold text-navy text-base">{title}</h3>
        </div>
        <p className="text-navy/80 font-semibold text-sm leading-relaxed">
          {children}
        </p>
      </div>
    </motion.div>
  );
}
