"use client";

interface SpeechBubbleProps {
  children: string;
  variant?: "atc" | "captain";
  className?: string;
}

export function SpeechBubble({
  children,
  variant = "atc",
  className = "",
}: SpeechBubbleProps) {
  const bgColor = variant === "atc" ? "bg-sky-light" : "bg-amber-light";
  const borderColor =
    variant === "atc" ? "border-sky" : "border-amber";
  const tailColor = variant === "atc" ? "border-t-sky-light" : "border-t-amber-light";

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${bgColor} ${borderColor} border-2 rounded-[20px] px-5 py-3 text-navy font-bold text-base leading-snug max-w-[280px]`}
      >
        {children}
      </div>
      {/* Tail pointing down */}
      <div className="flex justify-center">
        <div
          className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] ${tailColor}`}
        />
      </div>
    </div>
  );
}
