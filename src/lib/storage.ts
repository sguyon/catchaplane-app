import type { FlightLogEntry, KidProfile, CaptainStory } from "./types";
import { CONFIG } from "./constants";

const FLIGHT_LOG_KEY = "catch-a-plane:flight-log";
const PROFILES_KEY = "catch-a-plane:kid-profiles";
const CURRENT_PROFILE_KEY = "catch-a-plane:current-profile";
const STORY_CACHE_KEY = "catch-a-plane:story-cache";

const STORY_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoryCacheEntry {
  flightId: string;
  templateId: string;
  story: CaptainStory;
  timestamp: number;
}

/**
 * Load flight log from localStorage.
 * Returns empty array on error or if nothing stored.
 */
export function loadFlightLog(): FlightLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FLIGHT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FlightLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Save flight log to localStorage.
 * Trims to max entries to prevent unbounded storage growth.
 */
export function saveFlightLog(log: FlightLogEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = log.slice(0, CONFIG.maxFlightLogEntries);
    localStorage.setItem(FLIGHT_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable -- silently ignore
  }
}

/**
 * Clear the flight log from localStorage.
 */
export function clearFlightLog(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FLIGHT_LOG_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Load saved kid profiles from localStorage.
 * Returns empty array on error or if nothing stored.
 */
export function loadProfiles(): KidProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as KidProfile[];
  } catch {
    return [];
  }
}

/**
 * Save kid profiles to localStorage.
 */
export function saveProfiles(profiles: KidProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Storage full or unavailable -- silently ignore
  }
}

/**
 * Load current active kid profile from localStorage.
 * Returns null if no profile selected.
 */
export function loadCurrentProfile(): KidProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as KidProfile;
  } catch {
    return null;
  }
}

/**
 * Save current active kid profile to localStorage.
 */
export function saveCurrentProfile(profile: KidProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage full or unavailable -- silently ignore
  }
}

/**
 * Load story cache from localStorage.
 * Returns empty array if nothing stored.
 */
function loadStoryCache(): StoryCacheEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORY_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoryCacheEntry[];
  } catch {
    return [];
  }
}

/**
 * Save story cache to localStorage.
 * Removes expired entries to prevent unbounded growth.
 */
function saveStoryCache(cache: StoryCacheEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    // Filter out expired entries
    const active = cache.filter((entry) => now - entry.timestamp < STORY_CACHE_TTL);
    // Keep only most recent 50 stories to prevent storage bloat
    const trimmed = active.slice(0, 50);
    localStorage.setItem(STORY_CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable -- silently ignore
  }
}

/**
 * Get a cached story for a flight + template combination.
 * Returns null if not found or expired.
 */
export function getCachedStory(flightId: string, templateId: string): CaptainStory | null {
  const cache = loadStoryCache();
  const now = Date.now();

  for (const entry of cache) {
    if (
      entry.flightId === flightId &&
      entry.templateId === templateId &&
      now - entry.timestamp < STORY_CACHE_TTL
    ) {
      return entry.story;
    }
  }

  return null;
}

/**
 * Cache a story for a flight + template combination.
 */
export function cacheStory(flightId: string, templateId: string, story: CaptainStory): void {
  const cache = loadStoryCache();
  // Add new entry at the beginning
  cache.unshift({
    flightId,
    templateId,
    story,
    timestamp: Date.now(),
  });
  saveStoryCache(cache);
}

/**
 * Clear all cached stories.
 */
export function clearStoryCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORY_CACHE_KEY);
  } catch {
    // Ignore
  }
}
