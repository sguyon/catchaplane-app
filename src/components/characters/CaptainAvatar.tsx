"use client";

interface CaptainAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: 48,
  md: 80,
  lg: 120,
};

export function CaptainAvatar({
  size = "md",
  className = "",
}: CaptainAvatarProps) {
  const s = SIZES[size];

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-label="Captain"
    >
      {/* Body / Uniform */}
      <ellipse cx="60" cy="105" rx="35" ry="20" fill="#1e3a5f" />
      {/* Wings badge on chest */}
      <path
        d="M 45 98 L 60 93 L 75 98 L 60 96 Z"
        fill="#d4a017"
      />
      <circle cx="60" cy="96" r="3" fill="#e8b930" />
      {/* Epaulettes */}
      <rect x="28" y="90" width="14" height="6" rx="3" fill="#d4a017" />
      <rect x="78" y="90" width="14" height="6" rx="3" fill="#d4a017" />

      {/* Head */}
      <circle cx="60" cy="58" r="30" fill="#e8a849" />

      {/* Aviator Sunglasses */}
      {/* Left lens */}
      <path
        d="M 34 52 Q 34 46 42 46 L 52 46 Q 56 46 56 52 Q 56 60 45 62 Q 34 60 34 52 Z"
        fill="#2a2a3a"
        stroke="#888"
        strokeWidth="1.5"
      />
      {/* Right lens */}
      <path
        d="M 64 52 Q 64 46 72 46 L 82 46 Q 86 46 86 52 Q 86 60 75 62 Q 64 60 64 52 Z"
        fill="#2a2a3a"
        stroke="#888"
        strokeWidth="1.5"
      />
      {/* Bridge */}
      <path
        d="M 56 50 Q 60 47 64 50"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Lens shine */}
      <path d="M 38 49 L 44 48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 68 49 L 74 48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Smile */}
      <path
        d="M 45 68 Q 60 80 75 68"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheeks */}
      <circle cx="38" cy="65" r="5" fill="#f0b86e" opacity="0.6" />
      <circle cx="82" cy="65" r="5" fill="#f0b86e" opacity="0.6" />

      {/* Pilot Cap */}
      <path
        d="M 28 48 Q 28 28 60 25 Q 92 28 92 48 L 87 48 Q 87 33 60 30 Q 33 33 33 48 Z"
        fill="#1a1a2e"
      />
      {/* Cap visor */}
      <path
        d="M 26 48 L 94 48 L 90 53 L 30 53 Z"
        fill="#111122"
      />
      {/* Gold cap band */}
      <rect x="33" y="44" width="54" height="4" rx="2" fill="#d4a017" />
      {/* Cap emblem */}
      <circle cx="60" cy="36" r="5" fill="#d4a017" />
      {/* Wings on cap */}
      <path d="M 48 36 L 55 36" stroke="#e8b930" strokeWidth="2" strokeLinecap="round" />
      <path d="M 65 36 L 72 36" stroke="#e8b930" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
