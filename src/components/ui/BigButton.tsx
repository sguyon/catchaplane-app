"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BigButtonProps {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function BigButton({
  children,
  onClick,
  icon,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: BigButtonProps) {
  const baseStyles =
    "w-full flex items-center justify-center gap-3 font-extrabold text-xl rounded-[28px] border-4 transition-colors min-h-[60px] px-6 py-4";

  const variantStyles = {
    primary:
      "bg-amber text-white border-amber-dark shadow-lg hover:bg-amber-dark active:bg-amber-dark",
    secondary:
      "bg-sky text-white border-sky-dark shadow-lg hover:bg-sky-dark active:bg-sky-dark",
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      aria-busy={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {icon && <span className="text-2xl">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
