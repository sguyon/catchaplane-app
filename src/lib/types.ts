export type Screen = "profile-select" | "control-tower" | "radar-room" | "radio-contact" | "captain-story" | "flight-log";

export interface KidProfile {
  name: string;
  gender: "boy" | "girl" | "neutral";
  avatarUrl: string | null;
  /** Things this kid loves -- woven into their stories to personalize them. */
  interests?: string[];
  /** Languages the kid understands -- the captain sprinkles in friendly words. */
  languages?: string[];
  createdAt: number;
  lastUsed: number;
}

export interface Flight {
  id: string;
  callsign: string;
  aircraftType: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
}

export interface CaptainStory {
  captainName: string;
  personality: string;
  dinnerMenu: string;
  passengerStory: string;
  destinationFact: string;
}

export interface FlightLogEntry {
  flight: Flight;
  story: CaptainStory;
  imageUrls?: {
    aircraft?: string;
    destination?: string;
  };
  timestamp: number;
}

export interface AppState {
  currentScreen: Screen;
  currentFlight: Flight | null;
  currentStory: CaptainStory | null;
  audioUrl: string | null;
  imageUrls: { aircraft?: string; destination?: string } | null;
  location: { lat: number; lng: number } | null;
  flightLog: FlightLogEntry[];
  currentProfile: KidProfile | null;
  savedProfiles: KidProfile[];
}
