"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-sky via-sky-light to-white px-8 text-center">
      <div className="text-6xl mb-4">🛩️</div>
      <h1 className="text-navy font-black text-2xl mb-2">
        Oops! Turbulence!
      </h1>
      <p className="text-navy/60 font-bold text-sm mb-8">
        Something went a bit wobbly. Let&apos;s try again!
      </p>
      <button
        onClick={reset}
        className="bg-amber text-white font-extrabold text-lg px-8 py-4 rounded-[28px] border-4 border-amber-dark shadow-lg cursor-pointer"
      >
        Try Again!
      </button>
    </div>
  );
}
