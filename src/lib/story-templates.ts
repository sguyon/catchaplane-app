/**
 * Story template system to reduce AI repetition.
 * Each flight gets a deterministic template based on its ID,
 * ensuring the same flight gets the same story theme on replay.
 */

export type DinnerTheme = "silly-foods" | "magical-menu" | "international-cuisine";
export type PassengerTheme = "adventure" | "discovery" | "funny-moment" | "friendship";
export type DestinationFocus = "landmark" | "culture" | "nature" | "fun-fact";

// The narrative genre that reframes the WHOLE flight -- this is the big lever
// for structural variety. A "spy-caper" flight feels totally different from a
// "bedtime-lullaby" one even with the same dinner/passenger/destination themes.
export type StoryVibe =
  | "superhero-mission"
  | "space-voyage"
  | "spy-caper"
  | "time-travel"
  | "treasure-hunt"
  | "creature-friends"
  | "race-and-speed"
  | "silly-mixup"
  | "bedtime-lullaby"
  | "talent-show";

// How wild the story gets. Most flights are warm and fun; some go gloriously
// bananas. Picked deterministically, weighted toward the middle.
export type Wildness = "gentle" | "playful" | "wild";

export interface StoryTemplate {
  id: string;
  dinnerTheme: DinnerTheme;
  passengerTheme: PassengerTheme;
  destinationFocus: DestinationFocus;
  storyVibe: StoryVibe;
  wildness: Wildness;
}

const DINNER_THEMES: DinnerTheme[] = [
  "silly-foods",
  "magical-menu",
  "international-cuisine",
];
const PASSENGER_THEMES: PassengerTheme[] = [
  "adventure",
  "discovery",
  "funny-moment",
  "friendship",
];
const DESTINATION_FOCUSES: DestinationFocus[] = [
  "landmark",
  "culture",
  "nature",
  "fun-fact",
];
const STORY_VIBES: StoryVibe[] = [
  "superhero-mission",
  "space-voyage",
  "spy-caper",
  "time-travel",
  "treasure-hunt",
  "creature-friends",
  "race-and-speed",
  "silly-mixup",
  "bedtime-lullaby",
  "talent-show",
];
// Weighted so most flights are "playful", fewer are fully "wild".
const WILDNESS_POOL: Wildness[] = [
  "gentle",
  "playful",
  "playful",
  "playful",
  "wild",
  "wild",
];

/**
 * A pool of "magical details" to weave into a story. Picked deterministically
 * by flight ID so it stays consistent on replay, but adds variety between
 * different planes even when they land on the same theme template.
 */
export const STORY_FLAVORS: string[] = [
  "a friendly little cloud that floats alongside the plane and waves hello",
  "a tiny robot co-pilot who beeps happy songs",
  "a singing suitcase that hums tunes from the cargo hold",
  "a sleepy star that hitched a ride on the wing",
  "a rainbow that appears in the window whenever someone giggles",
  "a magic snack trolley that refills itself with surprises",
  "a paper airplane that flies loops around the big plane",
  "a wise old owl wearing tiny pilot goggles",
  "a bouncy beach ball that floats when the plane turns",
  "a friendly gust of wind named Whoosh who helps push the plane",
  "a box of crayons that draws pictures in the sky",
  "a tiny dragon who keeps the engines cozy and warm",
  "a chatty seagull who knows all the best shortcuts",
  "a glowing nightlight jellyfish that lives in the overhead bin",
  "a pair of dancing socks that do a wiggly jig at takeoff",
  "a curious little comet that plays peekaboo behind the clouds",
];

/**
 * Pick a magical flavor deterministically from the flight ID.
 */
export function selectFlavor(flightId: string): string {
  const index = simpleHash(flightId + "flavor") % STORY_FLAVORS.length;
  return STORY_FLAVORS[index];
}

/**
 * Pick an item from a pool deterministically, using a salted hash of the
 * flight ID so each axis varies independently. Same flight + same salt always
 * yields the same pick (keeps the story cache warm on replay).
 */
function pick<T>(pool: T[], flightId: string, salt: string): T {
  return pool[simpleHash(flightId + salt) % pool.length];
}

/**
 * Build a story template deterministically from the flight ID. Each axis is
 * chosen independently, so different planes spread across
 * 3 x 4 x 4 x 10 x (3 wildness) = ~1440 distinct flavor combinations, while a
 * given plane always tells the same story (cache stays warm on replay).
 */
export function selectTemplate(flightId: string): StoryTemplate {
  const dinnerTheme = pick(DINNER_THEMES, flightId, "dinner");
  const passengerTheme = pick(PASSENGER_THEMES, flightId, "passenger");
  const destinationFocus = pick(DESTINATION_FOCUSES, flightId, "destination");
  const storyVibe = pick(STORY_VIBES, flightId, "vibe");
  const wildness = pick(WILDNESS_POOL, flightId, "wildness");

  return {
    id: `${dinnerTheme}__${passengerTheme}__${destinationFocus}__${storyVibe}__${wildness}`,
    dinnerTheme,
    passengerTheme,
    destinationFocus,
    storyVibe,
    wildness,
  };
}

/**
 * Select companion profiles for a story.
 * - If ≤ 2 other profiles: include all
 * - If > 2 other profiles: deterministically select 2
 * Same flight + current profile = same companions (deterministic for caching)
 */
export function selectCompanions(
  allProfiles: Array<{ name: string }>,
  currentProfileName: string
): Array<string> {
  const others = allProfiles.filter((p) => p.name !== currentProfileName);

  if (others.length <= 2) {
    return others.map((p) => p.name);
  }

  // Deterministically select 2 from the larger group
  // Use hash of (flight not available here, but we hash the names)
  // Actually, for determinism we need the flightId, so this will be called differently
  // Let me reconsider...
  // Actually, the seed should come from flightId + current profile
  // Let me refactor this to accept a seed
  return others.slice(0, 2).map((p) => p.name);
}

/**
 * Select companion profiles deterministically based on flight ID and current profile.
 * Same flight + current profile = same companions (deterministic for caching)
 */
export function selectCompanionsDeterministic(
  allProfiles: Array<{ name: string }>,
  currentProfileName: string,
  flightId: string
): Array<string> {
  const others = allProfiles.filter((p) => p.name !== currentProfileName);

  if (others.length <= 2) {
    return others.map((p) => p.name);
  }

  // Deterministically select 2 using hash of flightId + current profile
  const seed = simpleHash(flightId + currentProfileName);
  const startIndex = seed % (others.length - 1); // -1 to allow room for 2 selections
  return [
    others[startIndex].name,
    others[(startIndex + 1) % others.length].name,
  ];
}

/**
 * Simple hash function for string.
 * Deterministic and doesn't require crypto.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get guidance text for dinner theme
 */
export function getDinnerGuidance(theme: DinnerTheme): string {
  const guides: Record<DinnerTheme, string> = {
    "silly-foods":
      "Create impossible, funny food items with sound effects like sizzle, crunch, or pop!",
    "magical-menu":
      "Foods that do magical things: change color, float, sparkle, or taste like clouds!",
    "international-cuisine":
      "Real foods from the destination, but with silly names and funny descriptions to make them fun for kids.",
  };
  return guides[theme];
}

/**
 * Get guidance text for passenger theme
 */
export function getPassengerGuidance(
  theme: PassengerTheme,
  kidName: string,
  companions?: string[]
): string {
  const companionText =
    companions && companions.length > 0 ? ` with ${companions.join(" and ")}` : "";

  const guides: Record<PassengerTheme, string> = {
    adventure: `${kidName} goes on a fun exploration or mission on the plane${companionText}, discovering something cool together.`,
    discovery: `${kidName} discovers something amazing, secret, or surprising${companionText ? " and gets to share it with " + companions?.join(" and ") : ""}!`,
    "funny-moment": `${kidName} does something silly, clumsy, or hilarious that makes everyone${companionText ? ", especially " + companions?.join(" and ") : ""} laugh.`,
    friendship: `${kidName}${companionText ? " and " + companions?.join(" and ") + " become" : " makes"} best friends${companionText ? "" : " with a person, animal, or even an object"} on the plane!`,
  };
  return guides[theme];
}

/**
 * Get guidance text for destination focus
 */
export function getDestinationGuidance(focus: DestinationFocus, destination: string): string {
  const guides: Record<DestinationFocus, string> = {
    landmark: `Share a fun, amazing fact about the main landmark in ${destination}. Use comparisons kids understand.`,
    culture: `Share something cool about the culture, traditions, or people of ${destination}.`,
    nature: `Share about the natural beauty, animals, or weather that makes ${destination} special.`,
    "fun-fact": `Share a surprising, silly, or amazing fact that would blow a kid's mind about ${destination}!`,
  };
  return guides[focus];
}

/**
 * Get guidance text for the overall story vibe / genre. This reframes the
 * WHOLE flight, so the same themes can feel completely different.
 */
export function getVibeGuidance(vibe: StoryVibe): string {
  const guides: Record<StoryVibe, string> = {
    "superhero-mission":
      "Frame the flight as a top-secret superhero mission. The plane has secret gadgets, the captain is a hero in disguise, and there's a fun (never scary) mission to complete before landing.",
    "space-voyage":
      "Pretend the plane zooms so high it brushes the edge of space. Wave at astronauts, dodge friendly comets, and peek at the planets. Big cosmic wonder.",
    "spy-caper":
      "A playful secret-agent caper. Secret codes, a mysterious (friendly) package, sneaky-but-silly missions, and a clever twist. Whisper-exciting, never scary.",
    "time-travel":
      "The plane accidentally zips through time. Maybe it visits dinosaurs, knights, or the far future for a moment, then zooms back. Keep it giggly and safe.",
    "treasure-hunt":
      "A treasure hunt across the sky. Follow a map of clouds, collect clues, and find a silly, delightful 'treasure' by the end.",
    "creature-friends":
      "Friendly magical creatures join the flight (a tiny dragon, a cloud-whale, a sky-fox). They help out and become friends.",
    "race-and-speed":
      "A joyful, fast race feeling -- zooming, whooshing, going SO fast. Great for a kid who loves speed, scooters, running, and football. Add whoosh and zoom sound effects.",
    "silly-mixup":
      "A goofy mix-up where everything is hilariously upside-down or backwards, and the captain cheerfully figures it all out. Maximum giggles.",
    "bedtime-lullaby":
      "A soft, cozy, dreamy flight. Gentle wonder, soothing imagery, slow and warm. Perfect for winding down.",
    "talent-show":
      "The whole plane puts on a mid-air talent show -- singing, dancing, silly tricks. Everyone gets a turn and cheers each other on.",
  };
  return guides[vibe];
}

/**
 * Get guidance text for how wild the story should get.
 */
export function getWildnessGuidance(wildness: Wildness): string {
  const guides: Record<Wildness, string> = {
    gentle:
      "Keep it warm, cozy, and easy to follow -- sweet wonder over big chaos.",
    playful:
      "Be bouncy and fun with a couple of surprising, giggly twists.",
    wild:
      "Go gloriously WILD and unexpected! Big imagination, a bonkers surprise, over-the-top silliness and sound effects. Be bold and novel -- surprise even a grown-up. (Still never scary, sad, or unsafe.)",
  };
  return guides[wildness];
}
