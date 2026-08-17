# Catch-A-Plane -- Progress Log

> This file tracks what has been built, what's working, and what's next.
> Updated after every development session.

---

## Current Status: All 7 Phases Complete

**Last updated:** 2026-02-06

---

## Phase 0: Project Scaffolding -- COMPLETE

**What was done:**
- Initialized Next.js 16 project with TypeScript + Tailwind CSS v4
- Installed dependencies: `ai`, `@ai-sdk/anthropic`, `openai`, `framer-motion`, `zod`
- Configured Tailwind v4 theme in `globals.css` with custom colors (sky, navy, amber, emerald, indigo, rose, cream), border radius tokens, and Nunito font
- Created `CLAUDE.md` (dev instructions), `PLAN.md` (phased implementation plan), `.env.example`
- Set up core type definitions (`lib/types.ts`), constants (`lib/constants.ts`), and mock data (`lib/mock-data.ts`)
- PWA manifest at `public/manifest.json`

**Key files:**
- `src/lib/types.ts` -- Screen, Flight, CaptainStory, FlightLogEntry, AppState
- `src/lib/constants.ts` -- COLORS, ATC_LINES, CONFIG
- `src/lib/mock-data.ts` -- 5 mock flights, 3 mock stories, 3 fallback flights

---

## Phase 1: Static UI Shell -- COMPLETE

**What was done:**
- Built single-page state machine with React Context (`src/contexts/AppContext.tsx`)
- All 5 screens navigable with animated transitions (Framer Motion fade + slide)
- Two character SVG avatars: ATC (headset, cap, mic) and Captain (sunglasses, wings badge)
- 6 reusable UI components: BigButton, SpeechBubble, FlightInfoCard, StoryCard, AudioPlayer, RadarDisplay/RadarBlip

**Screens built:**

| # | Screen | File | Key Features |
|---|--------|------|-------------|
| 1 | Control Tower | `screens/ControlTower.tsx` | Sky gradient, ATC avatar, speech bubble, "START SCANNING" CTA, flying plane animation, clouds, control tower silhouette |
| 2 | Radar Room | `screens/RadarRoom.tsx` | Dark navy bg, circular radar with sweep line + concentric rings, mock flight blips with callsigns, stars, auto-select after 2s |
| 3 | Radio Contact | `screens/RadioContact.tsx` | Crosshair viewfinder with corner brackets, flight info card (glass-morphism), "CONTACT!" badge, "Talk to the Captain!" CTA |
| 4 | Captain's Story | `screens/CaptainStory.tsx` | Hero image area, captain avatar + name, 3 story cards (dinner/destination/passenger), audio player bar, bounce-in animations |
| 5 | Flight Log | `screens/FlightLog.tsx` | Warm gradient bg, logbook header with count, flight entry cards with replay button, empty "?" slots, "Scan More Planes!" CTA |

**Components built:**

| Component | File | Description |
|-----------|------|-------------|
| BigButton | `ui/BigButton.tsx` | Full-width CTA, 60px min-height, 28px radius, tap scale animation, loading state |
| SpeechBubble | `ui/SpeechBubble.tsx` | Dialogue bubble with tail, ATC (sky-blue) and Captain (amber) variants |
| FlightInfoCard | `ui/FlightInfoCard.tsx` | Glass-morphism card: aircraft type, callsign badge, route with arrow |
| StoryCard | `ui/StoryCard.tsx` | Colored card with icon, title, body. Variants: dinner (emerald), destination (indigo), passenger (rose) |
| AudioPlayer | `ui/AudioPlayer.tsx` | Captain mini-avatar, waveform bars, play/pause button, speaking indicator |
| RadarDisplay | `radar/RadarDisplay.tsx` | Circular radar with rings, sweep line, glow trail, center dot |
| RadarBlip | `radar/RadarBlip.tsx` | Animated blip dot with callsign label, pulse animation |
| ATCAvatar | `characters/ATCAvatar.tsx` | Inline SVG: round face, navy cap, gold badge, headset, boom mic |
| CaptainAvatar | `characters/CaptainAvatar.tsx` | Inline SVG: round face, pilot cap, aviator sunglasses, wings badge |
| ScreenTransition | `shared/ScreenTransition.tsx` | AnimatePresence wrapper with fade + slide |
| LoadingRadio | `shared/LoadingRadio.tsx` | Radio waves animation, ATC avatar, "Calling the captain..." |

**CSS animations defined in `globals.css`:**
- `radar-sweep` -- rotating sweep line
- `blip-pulse` -- radar dot pulse
- `fly-by` -- plane flying across screen
- `waveform` -- audio bar animation
- `bounce-in` -- card entrance
- `speaking-pulse` -- green dot pulse

**How to test:**
```bash
npm run dev
# Open http://localhost:3000 in Chrome DevTools, mobile viewport (375px)
# Tap through: Control Tower -> Radar Room -> Radio Contact -> Captain's Story -> Flight Log -> Radar Room
```

---

## Phase 2: Real Flight Data -- COMPLETE

**What was done:**
- Built OpenSky Network API client with bounding box queries (`lib/flight-api.ts`)
- In-memory cache with TTL (3 min) and location-grid bucketing to minimize API calls
- Airline ICAO prefix heuristics for aircraft type and hub city guessing (OpenSky doesn't provide this)
- API route at `app/api/flights/route.ts` with input validation, clamping, and fallback on errors
- Geolocation hook (`hooks/useGeolocation.ts`) with kid-friendly error messages
- Flights hook (`hooks/useFlights.ts`) for client-side fetch + loading/error/fallback state
- Updated ControlTower to request GPS on "START SCANNING" and gracefully handle denial
- Updated RadarRoom to fetch real flights on mount, show loading spinner, fallback to mock data

**Key files:**

| File | Description |
|------|-------------|
| `src/lib/flight-api.ts` | OpenSky Network client: bounding box calc, in-memory cache, airline heuristics, 10s timeout, max 20 flights |
| `src/app/api/flights/route.ts` | GET endpoint: validates lat/lng, calls fetchNearbyFlights, returns fallback flights on empty/error |
| `src/hooks/useGeolocation.ts` | Promise-based requestLocation(), 10s timeout, accepts 1-min cached position, kid-friendly errors |
| `src/hooks/useFlights.ts` | fetchFlights(lat, lng) calling /api/flights, tracks loading/error/isFallback state |

**Screens updated:**

| Screen | Changes |
|--------|---------|
| ControlTower | Requests GPS on CTA tap, stores location in context, kid-friendly denial message, proceeds to radar after 1.5s on failure |
| RadarRoom | Fetches real flights on mount, loading spinner while fetching, falls back to MOCK_FLIGHTS if no location/results |

**How to test:**
```bash
npm run dev
# Open http://localhost:3000 on mobile or Chrome DevTools (375px)
# Allow GPS -> should see real flights on radar (if any nearby)
# Deny GPS -> shows "No worries!" message, proceeds with fallback flights
# Check Network tab: /api/flights?lat=...&lng=... should return flight data
```

---

## Phase 3: AI Story Generation -- COMPLETE

**What was done:**
- Built story prompt template with safety rules for kid-friendly content (`lib/story-prompt.ts`)
- API route at `app/api/story/route.ts` using Vercel AI SDK `generateObject()` with Zod v4 schema
- Uses Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) for fast, structured story generation
- Zod schema validates: captainName, personality, dinnerMenu, passengerStory, destinationFact
- Client-side hook `hooks/useStoryGenerator.ts` for fetch + loading/error state
- Updated RadioContact to generate real stories on "Talk to Captain!" tap
- Updated AppContext to no longer assign mock stories on flight select
- Graceful fallback: if no ANTHROPIC_API_KEY is set, returns random mock story
- Graceful fallback: on any error, returns random mock story (app never blocks)

**Key files:**

| File | Description |
|------|-------------|
| `src/lib/story-prompt.ts` | Prompt template with flight data interpolation and safety rules |
| `src/app/api/story/route.ts` | POST endpoint: validates flight, checks API key, calls generateObject(), falls back to mock |
| `src/hooks/useStoryGenerator.ts` | generateStory(flight) hook with loading/error/isMock state |

**Screens updated:**

| Screen | Changes |
|--------|---------|
| RadioContact | Now calls `generateStory()` on CTA tap, sets story in context before navigating |
| AppContext | `selectFlight()` no longer assigns mock story; story is generated in RadioContact |

**How to test:**
```bash
# Without API key (mock fallback):
npm run dev
# Tap through to RadioContact -> "Talk to Captain!" -> should show mock story

# With API key (real generation):
# Add ANTHROPIC_API_KEY=sk-ant-... to .env.local
npm run dev
# Tap through -> should generate unique AI story per flight
```

---

## Phase 4: Voice Narration -- COMPLETE

**What was done:**
- Story formatter converts CaptainStory JSON -> natural narration script (`lib/story-formatter.ts`)
- TTS API route at `app/api/tts/route.ts` using OpenAI TTS (model: tts-1, voice: nova, speed: 0.9)
- Audio player hook (`hooks/useAudioPlayer.ts`) with blob URL lifecycle, play/pause/toggle, auto-cleanup
- CaptainStory screen generates audio on mount and auto-plays (user gesture chain from "Talk to Captain!")
- AudioPlayer component updated with loading state, disabled state when no audio, spinner icon
- Graceful fallback: if no OPENAI_API_KEY, audio section silently degrades (no error shown)
- 24hr cache header on TTS responses

**Key files:**

| File | Description |
|------|-------------|
| `src/lib/story-formatter.ts` | Converts CaptainStory + Flight into conversational narration text |
| `src/app/api/tts/route.ts` | POST endpoint: validates text, calls OpenAI TTS, returns audio/mpeg |
| `src/hooks/useAudioPlayer.ts` | generateAudio(text), play/pause/toggle, blob URL management, auto-cleanup |

**Components updated:**

| Component | Changes |
|-----------|---------|
| AudioPlayer | Added `loading` and `hasAudio` props, spinner during generation, disabled state |
| CaptainStory | Generates + auto-plays narration on mount via useAudioPlayer |

**How to test:**
```bash
# Without OpenAI key (silent degradation):
npm run dev  # Audio player shows "Voice not available", no errors

# With OpenAI key:
# Add OPENAI_API_KEY=sk-... to .env.local
npm run dev  # Story screen auto-plays captain's narration
```

---

## Phase 5: AI Image Generation -- COMPLETE

**What was done:**
- Image prompt builder (`lib/image-prompts.ts`) with children's book illustration style
- Landmark mapping: 50+ destination names/airport codes -> iconic landmarks for prompts
- API route at `app/api/image/route.ts` using OpenAI DALL-E 3 (1024x1024, standard quality)
- Image generator hook (`hooks/useImageGenerator.ts`) generates aircraft + destination images in parallel
- CaptainStory generates images in parallel with audio on mount (doesn't block story display)
- Hero area shows AI-generated aircraft image with shimmer placeholder while loading
- Destination StoryCard shows AI-generated landmark image above the text
- StoryCard component updated with optional `imageUrl` prop
- Images included in flight log entry when available
- Graceful fallback: no images shown if no API key or on errors

**Key files:**

| File | Description |
|------|-------------|
| `src/lib/image-prompts.ts` | buildAircraftPrompt(), buildDestinationPrompt(), LANDMARK_MAP |
| `src/app/api/image/route.ts` | POST endpoint: validates prompt, calls DALL-E 3, returns URL |
| `src/hooks/useImageGenerator.ts` | generateImages(flight) generates both images in parallel |

**Components updated:**

| Component | Changes |
|-----------|---------|
| CaptainStory | Generates images in parallel with audio, shows in hero + destination card |
| StoryCard | Added `imageUrl` prop, shows image above card content when provided |

**How to test:**
```bash
# Without OpenAI key: gradient placeholder shown (no errors)
# With OPENAI_API_KEY in .env.local:
npm run dev
# Navigate to Captain's Story -> hero shows AI-generated aircraft
# Destination card shows generated landmark illustration
```

---

## Phase 6: Gyroscope + Haptics -- COMPLETE

**What was done:**
- Gyroscope hook (`hooks/useGyroscope.ts`) maps device orientation to X/Y offset (max 30px)
- iOS 13+ explicit `DeviceOrientationEvent.requestPermission()` support
- Maps gamma (left-right) and beta (front-back, normalized for held-phone angle) to offset
- Uses `requestAnimationFrame` for smooth updates, cleans up on unmount
- Haptics utility (`lib/haptics.ts`) with tap (10ms), lock-on (double-buzz), and success patterns
- RadarRoom requests gyroscope permission on mount, passes offsets to RadarDisplay
- Lock-on haptic fires when a flight is selected on the radar
- RadarDisplay blip positions now deterministic (no Math.random in render)
- All device API usage gracefully degrades on desktop/unsupported devices

**Key files:**

| File | Description |
|------|-------------|
| `src/hooks/useGyroscope.ts` | Device orientation -> offsetX/offsetY, iOS permission, RAF loop |
| `src/lib/haptics.ts` | triggerTapHaptic(), triggerLockOnHaptic(), triggerSuccessHaptic() |

**Components updated:**

| Component | Changes |
|-----------|---------|
| RadarRoom | Requests gyroscope permission, passes offsets to radar, haptic on flight select |
| RadarDisplay | Fixed deterministic blip positions (no hydration mismatch) |

**How to test:**
```bash
npm run dev
# On physical phone: tilt shifts radar blips, lock-on buzzes
# On desktop: no errors, offsets stay at 0, no vibration
```

---

## Phase 7: Persistence + PWA + Polish -- COMPLETE

**What was done:**
- localStorage persistence for flight log (`lib/storage.ts`) with load/save/clear helpers
- AppContext loads saved flight log on mount, saves on every addition
- Trimmed to max 50 entries to prevent unbounded storage growth
- Replay button in FlightLog navigates to CaptainStory with saved flight + story (re-generates audio)
- Milestone celebrations at 1, 5, 10, 20 flights with animated overlay + haptic buzz
- Kid-friendly error boundary (`app/error.tsx`) with "Oops! Turbulence!" message and retry button
- All interactive elements have ARIA labels

**Key files:**

| File | Description |
|------|-------------|
| `src/lib/storage.ts` | loadFlightLog(), saveFlightLog(), clearFlightLog() with localStorage |
| `src/app/error.tsx` | Kid-friendly error boundary with retry button |

**Components updated:**

| Component | Changes |
|-----------|---------|
| AppContext | Loads persisted flight log on mount, saves on addToFlightLog |
| FlightLog | Replay button navigates to story, milestone celebration overlay |

**How to test:**
```bash
npm run dev
# Contact a flight -> See Your Flights -> first milestone "First Flight!" should appear
# Close browser, reopen -> flight log should persist
# Tap replay button -> should replay the saved story
```

---

## What's Next

All core functionality is implemented. To use the AI features:

1. **Story generation:** Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local`
2. **Voice narration + images:** Add `OPENAI_API_KEY=sk-...` to `.env.local`
3. Without API keys, the app works fully with mock stories and no audio/images

**Remaining polish (optional):**
- PWA service worker setup (needs `@ducanh2912/next-pwa` configuration)
- App icons (192x192, 512x512) for PWA install
- Lighthouse audit and performance optimization
- VoiceOver/TalkBack testing on real devices
- Image caching with localStorage or Vercel Blob

---

## Git History

| Commit | Description |
|--------|-------------|
| `aae0174` | Phase 0+1: Initial scaffold with all 5 screens and mock data |
| `6b93d1e` | Phase 2: Real flight data from OpenSky Network |
| `121d2d2` | Phase 3: AI story generation with Claude Haiku |
| `36d9adb` | Phase 4: Voice narration with OpenAI TTS |
| `3322805` | Phase 5: AI image generation with DALL-E 3 |
| `4f072d4` | Phase 6: Gyroscope tilt and haptic feedback |
