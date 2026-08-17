import type { KidProfile } from "./types";

// Demo kid interests -- woven into personalized stories.
// Replace this profile locally; do not commit real children's details.
export const DEFAULT_INTERESTS = [
  "airplanes",
  "animals",
  "drawing",
  "space, rockets, and astronauts",
] as const;

export const DEFAULT_LANGUAGES = ["English"] as const;

// Canonical demo profile, always injected on load. Replaces any same-named
// profile created at runtime.
export const DEFAULT_PROFILE: KidProfile = {
  name: "Sam",
  gender: "neutral",
  avatarUrl: null,
  interests: [...DEFAULT_INTERESTS],
  languages: [...DEFAULT_LANGUAGES],
  createdAt: 0,
  lastUsed: 0,
};

// Colors matching the design system
export const COLORS = {
  sky: {
    light: "#e0f2fe",
    base: "#38bdf8",
    dark: "#0284c7",
  },
  navy: {
    base: "#1e293b",
    dark: "#0f172a",
  },
  amber: {
    light: "#fbbf24",
    base: "#f59e0b",
    dark: "#d97706",
  },
  emerald: {
    light: "#d1fae5",
    base: "#10b981",
  },
  indigo: {
    light: "#e0e7ff",
    base: "#6366f1",
  },
  rose: {
    light: "#ffe4e6",
    base: "#f43f5e",
  },
  cream: "#fffbeb",
  white: "#ffffff",
} as const;

// ATC character speech lines
export const ATC_LINES = {
  welcome: (name?: string) => `Hey ${name || "controller"}! Ready to find some planes?`,
  scanning: "I see incoming flights!",
  radioContact: (callsign: string) =>
    `Tower to Flight ${callsign}, do you copy, Captain?`,
  noFlights: "No planes nearby right now... Let's try a famous flight!",
  loading: "Calling the captain...",
} as const;

// App configuration
export const CONFIG = {
  flightSearchRadius: 150, // km
  radarAutoSelectDelay: 6000, // ms -- dramatic scanning sequence
  flightCacheTTL: 180_000, // 3 minutes
  maxFlightLogEntries: 50,
  hapticLockOn: [50, 50, 50] as number[],
  hapticTap: 10,
} as const;
