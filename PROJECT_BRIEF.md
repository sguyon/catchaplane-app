# Catch-A-Plane -- Product & Technical Brief

> **Master Context Document** -- Share this with design and development agents/teams.
> This document describes the full product vision, user flow, screen-by-screen specs, character design, API strategy, and architecture for the Catch-A-Plane app.

---

## 1. Product Overview

**Catch-A-Plane** is a mobile-first app for children aged 3-5 that turns the real sky into a magical, narrated experience. The child plays the role of a **Little Air Traffic Controller**: they scan the sky to "catch" real planes overhead, establish "radio contact" with the captain, and hear a fun AI-generated story about the flight -- narrated aloud by the captain's voice.

### Core Loop

```
Open app -> Scan the sky -> Find a real plane -> "Radio" the captain -> Hear the captain's story -> Collect the flight -> Scan again
```

### Key Principles

- **One action per screen.** Every screen has a single, oversized CTA. No menus, no settings, no text-heavy UI. A 4-year-old should be able to use it with zero reading.
- **Two characters guide the experience.** An Air Traffic Controller (ATC) and a Captain (Pilot). The ATC is the narrator/guide; the Captain tells the stories.
- **Real planes, imagined stories.** Flight data is real (pulled from aviation APIs). The stories are AI-generated fiction: silly pilot names, invented dinner menus, little passenger adventures.
- **Voice-first.** Every story is spoken aloud. The child never needs to read. The voice should be warm, expressive, and theatrical -- like a bedtime story narrator.

---

## 2. Target Audience

- **Primary user:** Children aged 3-5
- **Secondary user (admin):** Parents who install the app, grant permissions (GPS, gyroscope), and may set parental controls
- **Usage context:** Outdoors, looking at the sky; or indoors near a window. Phone held up toward the sky.

---

## 3. Characters

### 3a. The Air Traffic Controller (ATC)

- **Role:** The app's guide and narrator. Greets the child, operates the radar, establishes radio contact with pilots.
- **Visual design:** Round face, warm skin tone (amber/golden), dark navy ATC cap with a gold badge, a headset with a boom microphone, navy uniform with gold epaulettes. Big friendly smile. The character should look like a cartoon -- chunky, rounded, approachable.
- **Voice (suggestion):** Could be a warm male voice. Confident but gentle. Think "friendly uncle who works at the airport."
- **Appears on:** Screen 1 (full avatar, speech bubble), Screen 2 (mini avatar in corner), Screen 3 (mini avatar, radioing the pilot).

### 3b. The Captain (Pilot)

- **Role:** The storyteller. Each flight has a different captain who tells the child about their plane, destination, passengers, and dinner menu.
- **Visual design:** Round face, amber skin, black pilot cap, aviator sunglasses (dark lenses), a smile. Navy pilot uniform with a gold wings badge on the chest. Distinct from the ATC -- the sunglasses and wings badge are the key differentiators.
- **Voice (suggestion):** Could vary per story. Consider generating different voices (pitch, accent) per captain to make each encounter feel unique.
- **Appears on:** Screen 4 (large avatar with speech bubble, also in the audio player bar at the bottom).
- **Note:** Captain names and personalities are AI-generated per flight. Examples: "Captain Marie" (flying Paris to New York), "Captain Hiro" (Tokyo to London), "Captain Sofia" (Rome to Berlin).

---

## 4. Screen-by-Screen Specification

### Screen 1: Control Tower (Home)

**Purpose:** Welcome the child and start the experience.

**Layout:**
- Background: Sky gradient (light blue to white), control tower silhouette at top, small clouds, a tiny plane flying by
- Center: ATC character (large avatar, ~80px), speech bubble saying something like "Hey controller! Ready to find some planes?"
- App title: "Catch-A-Plane" in large bold white text, subtitle "Air Traffic Control for Kids"
- Bottom: **One giant CTA button** -- "START SCANNING" with a plane icon. The button should be full-width, heavily rounded (~28px radius), thick border, bright color (suggest amber/yellow). The icon should be large (~40px) and stacked above the text.

**Behavior:**
- On first tap of "START SCANNING", request GPS/location permission
- On permission granted, transition to Screen 2
- If permission denied, show a friendly message (no error language -- keep it kid-friendly)

**Design notes:**
- Runway dashes at the very bottom as a decorative element
- Everything should feel like the child just walked into a control tower
- No navigation, no header bar, no back button. Full-screen immersive.

---

### Screen 2: Radar Room (Scanning)

**Purpose:** Show a radar-like view while detecting nearby flights.

**Layout:**
- Background: Dark (navy/dark blue), like a radar room at night
- Center: Large circular radar display with concentric rings and a rotating sweep line
- Radar blips: Small glowing dots on the radar, each with a callsign label (e.g., "AF1", "JL012"). These represent real nearby flights.
- Corner: ATC mini-avatar with speech bubble: "I see incoming flights!" or similar
- Bottom: Instruction text: "Move your phone to scan the sky!" with a phone-tilt icon

**Behavior:**
- On entering this screen:
  1. Fetch the user's GPS coordinates
  2. Call a flight tracking API to get nearby flights (see Section 6)
  3. Plot flights as blips on the radar display
- **Gyroscope interaction:** As the child tilts/moves the phone, the radar blips should shift slightly -- giving the feeling of "looking around" the sky. This does NOT need to be accurate AR. It's theatrical.
- **Auto-select:** When the child holds the phone steady for ~2 seconds pointed at any area, auto-select a nearby flight (could be random from the fetched list, or the one closest to the direction the phone is pointing). Transition to Screen 3.
- The radar sweep animation should be continuous and satisfying.
- Stars or small sparkles in the background for atmosphere.

**Design notes:**
- This screen should feel like being inside a real radar room -- dark, glowing, mysterious
- The callsign labels on blips should use a monospace or technical-looking font
- Radar rings should pulse subtly

---

### Screen 3: Radio Contact (Lock On)

**Purpose:** The ATC "radios" the pilot. The child sees the selected plane and can initiate the story.

**Layout:**
- Background: Sky gradient (bright blue), clouds
- Top: ATC mini-avatar with speech bubble: "Tower to Flight [CALLSIGN], do you copy, Captain?"
- Center: Large crosshair/viewfinder frame with the plane icon inside. The crosshair should have corner brackets (like a camera viewfinder). The plane sits in a circular container inside.
- Below crosshair: Flight info card (glass-morphism or frosted style) showing:
  - Aircraft type (e.g., "Airbus A320")
  - Callsign (e.g., "AF1")
  - Route (e.g., "Paris -> New York")
- Bottom: **One CTA button** -- "Talk to the Captain!" with a microphone icon. Full-width, rounded, prominent.

**Behavior:**
- Haptic feedback (vibration) when this screen appears -- the "lock on" feeling
- Tapping "Talk to the Captain!" triggers:
  1. AI story generation (see Section 7)
  2. Image generation for the plane and destination (see Section 8)
  3. Voice synthesis of the story (see Section 9)
  4. Transition to Screen 4 (can show a brief loading state -- consider a radio static animation)

**Design notes:**
- The crosshair should feel like you're "targeting" the plane through binoculars or a radar scope
- The flight info card should be semi-transparent, floating over the sky background

---

### Screen 4: Captain's Story (Narration)

**Purpose:** The captain tells the child a fun story about the flight. This is the core magic moment.

**Layout:**
- Top section: Hero image area showing the AI-generated plane image and/or destination landmark image. Gradient fade into white at the bottom.
- Below hero: Captain avatar (large, ~48px) with name label (e.g., "Captain Marie") and speech bubble containing the story text. The speech bubble should be styled distinctly from the ATC's (suggest warm amber/orange tones vs the ATC's sky blue).
- Story content area (scrollable): Multiple fun-fact cards, each a different color:
  - **Dinner card** (green tones): "On the menu tonight: Tiny pizzas shaped like airplanes and rainbow ice cream sundaes!"
  - **Destination card** (indigo/blue tones): "Flying to New York!" with an AI-generated image of the Statue of Liberty (or Eiffel Tower for Paris, etc.)
  - **Passenger story card** (pink/rose tones): "Little Leo is on board! He's going to see his grandma and brought his teddy bear!"
- Bottom: Audio player bar with:
  - Captain mini-avatar (with a green "live" dot indicating speaking)
  - Waveform visualization
  - Large play/pause button
  - Text: "Captain [Name] is speaking..."

**Behavior:**
- Voice narration auto-plays on screen load
- The play button toggles pause/resume
- Story text should appear progressively as the voice narrates (like subtitles)
- When narration finishes, show a "Next" or transition prompt to Screen 5
- Consider: a "Tell me another story!" button that re-generates with different content for the same flight

**Content generation (see Section 7 for details):**
- Captain name: AI-generated, fun/international
- Dinner menu: Always silly and kid-friendly (chocolate spaghetti, cloud-shaped cookies, etc.)
- Passenger story: A short story about a child passenger -- relatable adventures
- Destination fun fact: One interesting thing about the city, explained for a 4-year-old

**Design notes:**
- This screen should feel warm and storybook-like -- white background, colorful cards, rounded everything
- The captain's speech bubble should be visually distinct from the ATC's to reinforce the two-character system
- Consider adding subtle animation to the fun-fact cards (slight bounce on appear)

---

### Screen 5: Flight Log (Collection)

**Purpose:** A logbook of all the flights the child has "contacted." Gamification and replay.

**Layout:**
- Background: Warm (amber/cream to white gradient), like an old logbook
- Header: Logbook icon + "Flight Log" title + count ("3 flights contacted!")
- List: Vertical list of flight entries, each showing:
  - Plane icon (stamp-like feel)
  - Aircraft type and callsign badge
  - Captain name
  - Route
  - Small replay button (play icon) to re-hear the story
- Empty slots: Dashed-border placeholders with "?" and "Scan to discover!" text -- motivating the child to scan more
- Bottom: **One CTA button** -- "Scan More Planes!" with a plane icon. This restarts the loop (back to Screen 2).

**Behavior:**
- Tapping a replay button on a past flight re-plays its audio narration
- The list should persist between sessions (needs storage -- see Section 10)
- Empty slots create a "collect them all" motivation
- Consider: milestone rewards at 5, 10, 20 flights (badges, new ATC hat colors, etc.)

**Design notes:**
- Should feel like a child's scrapbook or stamp collection
- Each entry should be a distinct, colorful card
- The gradient overlay at the bottom should ensure the CTA is always visible even when scrolling

---

## 5. Navigation & Flow

```
[1. Control Tower] --tap "START SCANNING"--> [2. Radar Room] --hold steady ~2s--> [3. Radio Contact] --tap "Talk to Captain"--> [4. Captain's Story] --narration ends--> [5. Flight Log] --tap "Scan More!"--> [2. Radar Room]
```

- **No traditional navigation.** No hamburger menus, tabs, or back buttons.
- Flow is strictly linear and loops. The only way to go "back" is to complete the loop.
- Consider: a small, unobtrusive parent-only gesture (e.g., triple-tap in the corner) to access settings/permissions.

---

## 6. Flight Data API

**Goal:** Fetch real flights currently flying near the user's location.

**Suggested APIs (evaluate and choose):**

| API | Pros | Cons |
|-----|------|------|
| **OpenSky Network** | Free, open-source, REST API, good coverage | Rate-limited, can be slow, no commercial license clarity |
| **ADS-B Exchange** | Very comprehensive, real-time, hobbyist-friendly | Requires API key, pricing tiers |
| **FlightRadar24 API** | Best coverage, most popular | Expensive, restrictive licensing |
| **AeroDataBox (via RapidAPI)** | Easy to integrate, good docs | Paid, rate limits |
| **AviationStack** | REST API, flight data | Paid tiers |

**Minimum data needed per flight:**
- `callsign` (e.g., "AF1")
- `aircraft_type` or ICAO type code (e.g., "A320")
- `origin` and `destination` (airport codes or city names)
- `latitude`, `longitude` (for radar positioning)
- `altitude`, `heading` (optional, for realism)

**Query approach:**
1. Get user's GPS coordinates via browser Geolocation API
2. Query the flight API with a bounding box or radius around the user (suggest ~100-200km radius to ensure results)
3. Cache results for a few minutes to avoid excessive API calls
4. If no flights found, consider: expanding the radius, showing a "No planes nearby right now -- let's try a famous flight!" fallback with pre-seeded data

---

## 7. AI Story Generation

**Goal:** Generate a fun, fictional, child-friendly story about the flight.

**Suggested approach:** Use an LLM (via Vercel AI SDK or direct API) with a carefully crafted prompt.

**Prompt should produce:**
1. **Captain name** -- Fun, international-sounding (Captain Pierre, Captain Yuki, Captain Sofia, etc.)
2. **Captain personality** -- A one-line trait ("loves telling jokes", "always sings while flying")
3. **Dinner menu** -- Always silly (cloud-shaped cookies, spaghetti with rainbow sauce, tiny pizzas shaped like planes)
4. **Passenger micro-story** -- A 2-3 sentence story about a child passenger (relatable: going to see grandma, bringing a pet, first time flying)
5. **Destination fun fact** -- One fun thing about the destination city, explained simply for a 4-year-old

**Input to the prompt:**
- Aircraft type (from API)
- Origin and destination cities (from API)
- Callsign (from API)

**Output format:** Structured (JSON) so the app can render each section in its own card.

**Content safety:** The prompt should explicitly instruct: no scary content, no violence, no sadness. Everything happy, silly, and warm.

**Suggested model considerations:**
- Fast inference is important (child is waiting)
- A smaller/faster model may be preferable to a large one
- Consider streaming the response to show content progressively

---

## 8. Image Generation

**Goal:** Generate two images per flight:
1. The airplane (matching the aircraft type, e.g., "Airbus A320 flying through sunny clouds, cartoon style")
2. The destination landmark (e.g., "Eiffel Tower on a sunny day, children's book illustration style")

**Suggested approach:** Use an image generation API (fal.ai, DALL-E, Stable Diffusion, etc.)

**Style direction:** Children's book illustration, bright colors, rounded shapes, friendly and warm. NOT photorealistic.

**Considerations:**
- Image generation can be slow. Consider:
  - Pre-generating images for popular aircraft types and caching them
  - Generating images in parallel with story/voice generation
  - Showing a playful loading animation while images generate
- For destinations: maintain a mapping of airport codes to landmark names so the prompt is specific (CDG -> "Eiffel Tower", JFK -> "Statue of Liberty", NRT -> "Mount Fuji and cherry blossoms", etc.)

---

## 9. Voice Narration (Text-to-Speech)

**Goal:** The captain "speaks" the story aloud. This is the emotional core of the experience.

**Suggested approaches:**

| Approach | Pros | Cons |
|----------|------|------|
| **ElevenLabs API** | High quality, expressive, multiple voices, voice cloning | Paid, latency, API dependency |
| **OpenAI TTS** | Good quality, simple API | Less expressive than ElevenLabs |
| **Web Speech API (browser native)** | Free, instant, no API calls | Robotic, inconsistent across devices |

**Ideal setup:**
- Primary: ElevenLabs or similar high-quality TTS for the captain's narration
- Fallback: Web Speech API if the primary fails or is unavailable

**Voice characteristics:**
- Warm, theatrical, slightly dramatic -- like a bedtime story
- Consider different voice profiles per captain to add variety
- The ATC character could have a different voice than the captains (if narrating transitions)

**Audio playback:**
- Auto-play when the story screen loads
- Large, obvious play/pause button (44px+ tap target)
- Visual feedback: waveform animation, "speaking..." indicator

---

## 10. Data Persistence

**Goal:** Save the child's flight log so they can see past flights and replay stories.

**Options to evaluate:**
- **Client-side:** localStorage or IndexedDB for simplicity (no account needed)
- **Server-side:** A database (Supabase, Neon, etc.) if accounts/cloud sync is desired
- **Hybrid:** Local-first with optional cloud backup

**What to store per flight:**
- Flight data (callsign, aircraft type, route)
- Captain name and personality
- Generated story text
- Generated image URLs
- Audio file URL or reference
- Timestamp

---

## 11. Device APIs

### Geolocation
- Used to: Fetch the user's GPS coordinates for the flight API query
- Permission: Must be requested on first "START SCANNING" tap
- Fallback: If denied, could allow manual city entry (parent mode) or use a default location

### Gyroscope / Device Orientation
- Used to: Create the "scanning" feel on the radar screen
- The phone tilt data shifts radar blips slightly, giving a sense of looking around
- This is theatrical, NOT accurate AR. Any nearby flight can be "found" regardless of phone direction.
- Fallback: If gyroscope unavailable, blips can just animate on their own

### Haptic Feedback (Vibration API)
- Used to: Buzz when a plane is "locked on" (transition to Screen 3)
- Short burst (~100ms)
- Fallback: Visual feedback only if vibration unavailable

---

## 12. Design Language Summary

| Element | Spec |
|---------|------|
| **Shape language** | Heavily rounded: 20-28px border radius on buttons, 16-24px on cards |
| **Borders** | Thick (3-4px) on buttons and character avatars |
| **Typography** | One chunky, rounded sans-serif (suggest Nunito, Baloo, or similar). Max 2 font families. |
| **Colors** | Sky blue (primary), amber/yellow (CTAs and captain), navy (ATC uniform/radar), white, and accent colors for fun-fact cards (emerald, indigo, rose) |
| **Tap targets** | Minimum 48px. CTAs should be 56-64px tall. |
| **Iconography** | Inline SVG, cartoon-style. No icon library -- custom drawn to match the character style. |
| **Animations** | Radar sweep, blip pulse, crosshair lock-on, waveform, card bounce-in. Keep them performant. |
| **Accessibility** | Large text (min 14px body), high contrast on CTAs, voice-first (no reading required) |

---

## 13. Technical Architecture (High-Level)

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   Mobile Client  |---->|   Next.js API     |---->|  Flight Data API |
|   (Next.js PWA)  |     |   Routes          |     |  (OpenSky/ADS-B) |
|                  |     |                   |     |                  |
+------------------+     +---+------+--------+     +------------------+
                             |      |
                    +--------+      +--------+
                    |                        |
              +-----v------+         +-------v-------+
              |            |         |               |
              |  LLM API   |         |  Image Gen    |
              |  (story)   |         |  (fal/DALL-E) |
              |            |         |               |
              +-----+------+         +---------------+
                    |
              +-----v------+
              |            |
              |  TTS API   |
              | (ElevenLabs|
              |  /OpenAI)  |
              +------------+
```

**Suggested stack (for evaluation):**
- **Framework:** Next.js (App Router) -- mobile-first PWA
- **Styling:** Tailwind CSS with custom design tokens
- **AI orchestration:** Vercel AI SDK -- handles streaming, structured output, provider switching
- **Hosting:** Vercel (serverless, edge functions for API routes)
- **Storage:** Evaluate based on scope (localStorage for MVP, database for production)

---

## 14. MVP Scope vs. Future Features

### MVP (v1)
- [x] Screen 1-4 flow (scan -> radar -> contact -> story)
- [x] Real flight data from one API
- [x] AI-generated story with structured output
- [x] Voice narration (one voice)
- [x] Basic flight log (Screen 5, local storage)

### v2 Enhancements
- [ ] Multiple captain voices (vary per flight)
- [ ] Pre-cached images for common aircraft and destinations
- [ ] Milestone badges and rewards
- [ ] Parent dashboard (see what your child explored)
- [ ] Offline mode (pre-download stories for plane rides)
- [ ] AR camera overlay (point camera at sky, overlay plane info)
- [ ] Multi-language support
- [ ] Accessibility: switch input for children with motor disabilities

---

## 15. Open Questions for the Team

1. **Flight API choice:** Which API offers the best balance of coverage, cost, and rate limits for our expected usage?
2. **Voice generation latency:** Can we achieve < 3 second time-to-first-audio? If not, what loading experience bridges the gap?
3. **Image pre-caching strategy:** Should we pre-generate images for the top 50 aircraft types and top 100 airports, or generate everything on the fly?
4. **Offline/fallback:** When there are no flights nearby (rural area, bad connection), what's the fallback experience? Pre-seeded "famous flights"?
5. **Monetization:** Free with limits? Subscription? One-time purchase? This affects the storage and API cost architecture.
6. **Platform:** PWA (web) first? Or native (React Native) for better access to gyroscope/haptics?

---

## 16. Reference

- **Wireframes:** See the interactive wireframe in this repo (`/app/page.tsx`) -- run `npm run dev` to view the lo-fi user flow with all 5 screens and annotations.
- **Character reference:** See the SVG illustrations in each screen component under `/components/wireframe/screens/`.
