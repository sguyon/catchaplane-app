import type { Flight } from "./types";

const STYLE_SUFFIX = "children's book illustration, bright cheerful colors, rounded shapes, friendly and cute, simple composition, white background";
const AVATAR_STYLE = "playful aviation theme with clouds, rounded shapes, bright cheerful colors, friendly and cute, simple composition, headshot only, white or sky blue background";

/**
 * Build a prompt for generating an aircraft illustration
 */
export function buildAircraftPrompt(flight: Flight): string {
  return `A cute cartoon ${flight.aircraftType} airplane flying through sunny blue sky with fluffy white clouds. ${STYLE_SUFFIX}`;
}

/**
 * Build a prompt for generating a destination landmark illustration
 */
export function buildDestinationPrompt(flight: Flight): string {
  const landmark = LANDMARK_MAP[flight.destination.toUpperCase()] || flight.destination;
  return `${landmark} on a beautiful sunny day, seen from a distance. ${STYLE_SUFFIX}`;
}

/**
 * Build a prompt for generating a kid avatar
 */
export function buildAvatarPrompt(name: string, gender: "boy" | "girl" | "neutral"): string {
  const genderHint = gender === "boy" ? "boy" : gender === "girl" ? "girl" : "child";

  return `Portrait of ${name}, a happy ${genderHint} kid aged 3-5, wearing a toy pilot cap, big smile, looking at camera. Same style as the app icon: ${AVATAR_STYLE}. Children's book illustration style.`;
}

/**
 * Map destination names/codes to iconic landmarks for image prompts
 */
const LANDMARK_MAP: Record<string, string> = {
  // Cities
  "NEW YORK": "The Statue of Liberty with the New York City skyline",
  "PARIS": "The Eiffel Tower surrounded by trees and flowers",
  "LONDON": "Big Ben and the Tower Bridge",
  "TOKYO": "Mount Fuji with cherry blossom trees",
  "DUBAI": "The Burj Khalifa skyscraper in the desert",
  "SYDNEY": "The Sydney Opera House by the harbor",
  "ROME": "The Colosseum in Rome",
  "BEIJING": "The Great Wall of China on a green hillside",
  "SAN FRANCISCO": "The Golden Gate Bridge over the bay",
  "LOS ANGELES": "The Hollywood sign on a sunny hillside",
  "MIAMI": "A tropical beach with palm trees and turquoise water",
  "ATLANTA": "A peach tree-lined street in Atlanta",
  "SINGAPORE": "The Marina Bay Sands building with gardens",
  "HONG KONG": "Hong Kong harbor with colorful boats",
  "AMSTERDAM": "Colorful canal houses in Amsterdam with tulips",
  "BARCELONA": "The colorful Sagrada Familia church",
  "MOSCOW": "The colorful onion domes of Saint Basil's Cathedral",
  "CAIRO": "The Pyramids of Giza with a friendly camel",
  "RIO DE JANEIRO": "Christ the Redeemer statue on a green mountain",
  "ISTANBUL": "The Blue Mosque with its beautiful domes",
  "WASHINGTON D.C.": "The White House with a green lawn",
  "CHICAGO": "The Chicago skyline with the Bean sculpture",
  "TORONTO": "The CN Tower in Toronto",
  "MUMBAI": "The Gateway of India in Mumbai",
  "SEOUL": "A beautiful Korean palace with cherry blossoms",
  // Airport codes
  "JFK": "The Statue of Liberty with the New York City skyline",
  "CDG": "The Eiffel Tower surrounded by trees and flowers",
  "LHR": "Big Ben and the Tower Bridge",
  "NRT": "Mount Fuji with cherry blossom trees",
  "HND": "Mount Fuji with cherry blossom trees",
  "DXB": "The Burj Khalifa skyscraper in the desert",
  "SYD": "The Sydney Opera House by the harbor",
  "FCO": "The Colosseum in Rome",
  "PEK": "The Great Wall of China on a green hillside",
  "SFO": "The Golden Gate Bridge over the bay",
  "LAX": "The Hollywood sign on a sunny hillside",
  "MIA": "A tropical beach with palm trees and turquoise water",
  "ATL": "A peach tree-lined street in Atlanta",
  "SIN": "The Marina Bay Sands building with gardens",
  "HKG": "Hong Kong harbor with colorful boats",
  "AMS": "Colorful canal houses in Amsterdam with tulips",
  "BCN": "The colorful Sagrada Familia church",
  "SVO": "The colorful onion domes of Saint Basil's Cathedral",
  "CAI": "The Pyramids of Giza with a friendly camel",
  "GIG": "Christ the Redeemer statue on a green mountain",
  "IST": "The Blue Mosque with its beautiful domes",
  "IAD": "The White House with a green lawn",
  "ORD": "The Chicago skyline with the Bean sculpture",
  "YYZ": "The CN Tower in Toronto",
  "BOM": "The Gateway of India in Mumbai",
  "ICN": "A beautiful Korean palace with cherry blossoms",
};
