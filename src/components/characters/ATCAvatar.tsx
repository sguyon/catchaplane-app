"use client";

interface ATCAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: 48,
  md: 80,
  lg: 120,
};

export function ATCAvatar({ size = "md", className = "" }: ATCAvatarProps) {
  const s = SIZES[size];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-label="Air Traffic Controller"
    >
      {/* Body / Uniform */}
      <ellipse cx="60" cy="105" rx="35" ry="20" fill="#1e3a5f" />
      {/* Epaulettes */}
      <rect x="28" y="90" width="14" height="6" rx="3" fill="#d4a017" />
      <rect x="78" y="90" width="14" height="6" rx="3" fill="#d4a017" />

      {/* Head */}
      <circle cx="60" cy="58" r="30" fill="#e8a849" />

      {/* Eyes */}
      <ellipse cx="48" cy="55" rx="4" ry="5" fill="#1e293b" />
      <ellipse cx="72" cy="55" rx="4" ry="5" fill="#1e293b" />
      {/* Eye shine */}
      <circle cx="50" cy="53" r="1.5" fill="white" />
      <circle cx="74" cy="53" r="1.5" fill="white" />

      {/* Smile */}
      <path
        d="M 45 65 Q 60 78 75 65"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheeks */}
      <circle cx="40" cy="63" r="5" fill="#f0b86e" opacity="0.6" />
      <circle cx="80" cy="63" r="5" fill="#f0b86e" opacity="0.6" />

      {/* ATC Cap */}
      <path
        d="M 30 48 Q 30 30 60 28 Q 90 30 90 48 L 85 48 Q 85 35 60 33 Q 35 35 35 48 Z"
        fill="#1e3a5f"
      />
      {/* Cap visor */}
      <path
        d="M 28 48 L 92 48 L 88 52 L 32 52 Z"
        fill="#152a45"
      />
      {/* Gold badge on cap */}
      <circle cx="60" cy="40" r="5" fill="#d4a017" />
      <circle cx="60" cy="40" r="3" fill="#e8b930" />

      {/* Headset band */}
      <path
        d="M 28 50 Q 28 25 60 22 Q 92 25 92 50"
        stroke="#333"
        strokeWidth="3"
        fill="none"
      />
      {/* Headset ear pieces */}
      <rect x="22" y="48" width="10" height="14" rx="5" fill="#444" />
      <rect x="88" y="48" width="10" height="14" rx="5" fill="#444" />

      {/* Boom microphone */}
      <path
        d="M 28 58 Q 20 65 18 72"
        stroke="#555"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="17" cy="74" r="4" fill="#666" />
      <circle cx="17" cy="74" r="2.5" fill="#444" />
    </svg>
  );
}
