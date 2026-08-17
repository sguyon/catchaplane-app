"use client";

import { motion } from "framer-motion";
import { ATCAvatar } from "@/components/characters/ATCAvatar";
import { SpeechBubble } from "@/components/ui/SpeechBubble";

interface LoadingRadioProps {
  message?: string;
}

export function LoadingRadio({
  message = "Calling the captain...",
}: LoadingRadioProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-sky to-sky-light px-6">
      {/* Radio waves animation */}
      <div className="relative mb-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border-2 border-amber/30 rounded-full"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2 + i * 0.5, opacity: 0 }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ width: 100, height: 100, top: -10, left: -10 }}
          />
        ))}
        <ATCAvatar size="lg" />
      </div>

      <SpeechBubble variant="atc">{message}</SpeechBubble>

      {/* Radio static dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-amber rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
