"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Screen, Flight, CaptainStory, FlightLogEntry, KidProfile } from "@/lib/types";
import { loadFlightLog, saveFlightLog, loadProfiles, saveProfiles, loadCurrentProfile, saveCurrentProfile } from "@/lib/storage";
import { DEFAULT_PROFILE } from "@/lib/constants";

interface AppContextType {
  // Screen state
  currentScreen: Screen;
  goToScreen: (screen: Screen) => void;

  // Flight state
  currentFlight: Flight | null;
  selectFlight: (flight: Flight) => void;
  flights: Flight[];
  setFlights: (flights: Flight[]) => void;

  // Story state
  currentStory: CaptainStory | null;
  setCurrentStory: (story: CaptainStory | null) => void;

  // Audio state
  audioUrl: string | null;
  setAudioUrl: (url: string | null) => void;

  // Image state
  imageUrls: { aircraft?: string; destination?: string } | null;
  setImageUrls: (urls: { aircraft?: string; destination?: string } | null) => void;

  // Location state
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number } | null) => void;

  // Flight log
  flightLog: FlightLogEntry[];
  addToFlightLog: (entry: FlightLogEntry) => void;

  // Profile state
  currentProfile: KidProfile | null;
  savedProfiles: KidProfile[];
  setCurrentProfile: (profile: KidProfile | null) => void;
  addProfile: (profile: KidProfile) => void;
  updateProfile: (name: string, updates: Partial<KidProfile>) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfileState] = useState<KidProfile | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<KidProfile[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>("profile-select");
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(null);
  const [currentStory, setCurrentStory] = useState<CaptainStory | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{
    aircraft?: string;
    destination?: string;
  } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightLog, setFlightLog] = useState<FlightLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedStorage = useRef(false);

  // Load persisted profiles and flight log on mount
  useEffect(() => {
    if (hasLoadedStorage.current) return;
    hasLoadedStorage.current = true;

    // Load profiles. The canonical default profile is always injected first
    // and fully replaces any same-named profile created at runtime.
    const others = loadProfiles().filter((p) => p.name !== DEFAULT_PROFILE.name);
    setSavedProfiles([DEFAULT_PROFILE, ...others]);

    // Pre-load the last-used profile so it's ready, but always start on the
    // landing screen (profile-select) so the kid sees it and taps to continue.
    const currentProf = loadCurrentProfile();
    if (currentProf) {
      // Resolve the default profile to its canonical version (fresh interests/avatar).
      const resolved =
        currentProf.name === DEFAULT_PROFILE.name ? DEFAULT_PROFILE : currentProf;
      setCurrentProfileState(resolved);
    }

    // Load flight log
    const saved = loadFlightLog();
    if (saved.length > 0) {
      setFlightLog(saved);
    }
  }, []);

  const goToScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const selectFlight = useCallback((flight: Flight) => {
    setCurrentFlight(flight);
    // Story is now generated via useStoryGenerator in RadioContact
    setCurrentStory(null);
  }, []);

  const addToFlightLog = useCallback(
    (entry: FlightLogEntry) => {
      setFlightLog((prev) => {
        const updated = [entry, ...prev];
        saveFlightLog(updated);
        return updated;
      });
    },
    []
  );

  const setCurrentProfile = useCallback((profile: KidProfile | null) => {
    setCurrentProfileState(profile);
    if (profile) {
      saveCurrentProfile(profile);
    }
  }, []);

  const addProfile = useCallback((profile: KidProfile) => {
    setSavedProfiles((prev) => {
      const updated = [profile, ...prev];
      saveProfiles(updated);
      return updated;
    });
  }, []);

  const updateProfile = useCallback((name: string, updates: Partial<KidProfile>) => {
    setSavedProfiles((prev) => {
      const updated = prev.map((p) =>
        p.name === name ? { ...p, ...updates } : p
      );
      saveProfiles(updated);
      return updated;
    });

    // Update current profile if it matches
    if (currentProfile?.name === name) {
      const updated = { ...currentProfile, ...updates };
      setCurrentProfileState(updated);
      saveCurrentProfile(updated);
    }
  }, [currentProfile]);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        goToScreen,
        currentFlight,
        selectFlight,
        flights,
        setFlights,
        currentStory,
        setCurrentStory,
        audioUrl,
        setAudioUrl,
        imageUrls,
        setImageUrls,
        location,
        setLocation,
        flightLog,
        addToFlightLog,
        currentProfile,
        savedProfiles,
        setCurrentProfile,
        addProfile,
        updateProfile,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
