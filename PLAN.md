# Catch-A-Plane: Implementation Plan

## Overview

Greenfield mobile-first Next.js PWA for kids aged 3-5. Child plays as a "Little Air Traffic Controller" -- scans sky, finds real planes, hears AI-generated stories narrated by fictional captains.

**Current state:** Only PROJECT_BRIEF.md, concept.png, wireframes.png exist. Zero code.

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js App Router + TypeScript | PWA-ready, SSR for API routes, specified in brief |
| **Styling** | Tailwind CSS + custom design tokens | Fast iteration, responsive, specified in brief |
| **Navigation** | Single-page state machine (no routing) | Kids don't use URLs/back button; smoother transitions; avoids navigation edge cases |
| **State** | React Context + localStorage | Simple, sufficient for linear 5-screen flow |
| **Flight API** | OpenSky Network (free) | No API key needed, good coverage, swap-ready abstraction |
| **LLM** | Claude Haiku 3.5 via Vercel AI SDK | Fast inference, great structured output, content safety |
| **TTS** | OpenAI TTS (MVP) | Good quality, simple API; ElevenLabs upgrade path for v2 |
| **Images** | AI-generated illustrations (fal.ai or DALL-E) | Higher quality, unique per flight; cache aggressively to manage latency/cost |
| **PWA** | @ducanh2912/next-pwa | Standard solution, handles service worker + manifest |

---

## File Structure

```
catch-a-plane/
├── CLAUDE.md                         # Project dev instructions
├── PLAN.md                           # This plan (copied to project root)
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata, viewport
│   ├── page.tsx                      # Single-page app: all 5 screens
│   └── api/
│       ├── flights/route.ts          # Proxy to OpenSky Network
│       ├── story/route.ts            # LLM story generation
│       ├── tts/route.ts              # Text-to-speech generation
│       └── image/route.ts            # AI image generation (DALL-E / fal.ai)
├── components/
│   ├── screens/
│   │   ├── ControlTower.tsx          # Screen 1: Home/welcome
│   │   ├── RadarRoom.tsx             # Screen 2: Scanning radar
│   │   ├── RadioContact.tsx          # Screen 3: Lock-on + flight card
│   │   ├── CaptainStory.tsx          # Screen 4: Story + audio playback
│   │   └── FlightLog.tsx             # Screen 5: Collection/logbook
│   ├── characters/
│   │   ├── ATCAvatar.tsx             # ATC character SVG (multiple sizes)
│   │   └── CaptainAvatar.tsx         # Captain character SVG (multiple sizes)
│   ├── ui/
│   │   ├── BigButton.tsx             # Giant CTA (one per screen)
│   │   ├── SpeechBubble.tsx          # Character dialogue bubble
│   │   ├── FlightInfoCard.tsx        # Callsign, aircraft, route display
│   │   ├── AudioPlayer.tsx           # Play/pause, waveform, captain indicator
│   │   └── StoryCard.tsx             # Colored fun-fact card (dinner, passenger, destination)
│   ├── radar/
│   │   ├── RadarDisplay.tsx          # Circular radar with rings + sweep
│   │   └── RadarBlip.tsx             # Individual plane dot
│   └── shared/
│       ├── ScreenTransition.tsx      # Animated screen transitions
│       └── LoadingRadio.tsx          # "Calling the captain..." loading state
├── contexts/
│   └── AppContext.tsx                # Global state: screen, flight, story, audio
├── hooks/
│   ├── useGeolocation.ts             # GPS permission + coordinates
│   ├── useGyroscope.ts              # Device orientation for radar tilt
│   ├── useFlights.ts                 # Fetch nearby flights from API
│   ├── useStoryGenerator.ts          # Generate story via LLM
│   ├── useAudioPlayer.ts             # Audio playback controls
│   └── useFlightLog.ts              # localStorage CRUD for flight log
├── lib/
│   ├── types.ts                      # Flight, CaptainStory, FlightLogEntry
│   ├── constants.ts                  # Colors, sizes, config
│   ├── mock-data.ts                  # Sample flights + stories for Phase 1
│   ├── flight-api.ts                 # OpenSky client + caching + fallbacks
│   ├── story-prompt.ts               # LLM prompt template
│   ├── story-formatter.ts            # Convert story JSON to narration text
│   ├── image-prompts.ts              # Build image gen prompts from flight data
│   ├── landmark-mapping.ts           # Airport code -> landmark name for prompts
│   ├── image-cache.ts               # Cache generated images (localStorage)
│   ├── haptics.ts                    # Vibration API wrapper
│   └── storage.ts                    # localStorage helpers for flight log
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # App icons (192, 512)
└── tailwind.config.ts                # Custom theme (colors, radius, fonts)
```

---

## Phased Implementation

### Phase 0: Project Scaffolding + CLAUDE.md (30 min)
**Goal:** Initialize project, install deps, create CLAUDE.md and PLAN.md

**Tasks:**
1. `npx create-next-app@latest . --typescript --tailwind --app`
2. Install deps: `ai @ai-sdk/anthropic openai framer-motion @ducanh2912/next-pwa zod`
3. Configure Tailwind theme (colors, border-radius, fonts -- Nunito)
4. Create `CLAUDE.md` with project-specific dev instructions
5. Create `PLAN.md` (this document)
6. Create `.env.example` with required API keys (user needs to set up accounts)
7. Set up `lib/types.ts` with core interfaces

**API Account Setup (user action before Phase 3):**
- [ ] Anthropic API key: https://console.anthropic.com/ (for story generation)
- [ ] OpenAI API key: https://platform.openai.com/ (for TTS + optionally DALL-E images)
- [ ] Optional: fal.ai account for faster image generation

**Files created:** `CLAUDE.md`, `PLAN.md`, `tailwind.config.ts`, `lib/types.ts`, `lib/constants.ts`, `.env.example`

**Testable:** `npm run dev` starts without errors, Tailwind theme loads

**Note:** Phases 1-2 work entirely with mock data and free APIs (OpenSky). No paid API keys needed until Phase 3.

---

### Phase 1: Static UI Shell -- All 5 Screens (est. 3-5 days)
**Goal:** Complete visual flow with mock data. Every screen styled, navigable, responsive.

**What's testable:** Click through all 5 screens on mobile. See characters, speech bubbles, radar, story cards, flight log. Everything styled per design spec.

#### 1.1 App Context + Screen State Machine
- `contexts/AppContext.tsx`: manages `currentScreen` (1-5), `currentFlight`, `currentStory`
- `app/page.tsx`: renders correct screen component based on state
- Screen transitions: fade + slide using Framer Motion

#### 1.2 Character Avatars (SVG Components)
- `components/characters/ATCAvatar.tsx`:
  - Round face, amber/golden skin, navy ATC cap with gold badge, headset with boom mic, navy uniform with gold epaulettes
  - Props: `size` ('sm' | 'md' | 'lg'), `className`
  - Matches concept.png art style: chunky, rounded, friendly
- `components/characters/CaptainAvatar.tsx`:
  - Round face, amber skin, pilot cap, aviator sunglasses, wings badge
  - Props: `size`, `captainName`, `className`
  - Key differentiators from ATC: sunglasses + wings badge

#### 1.3 Core UI Components
- `BigButton.tsx`: Full-width, 56-64px tall, 28px radius, 4px border, icon + text, loading state
- `SpeechBubble.tsx`: Rounded bubble with tail, two variants (sky-blue for ATC, amber for Captain)
- `FlightInfoCard.tsx`: Glass-morphism card showing aircraft type, callsign badge, route
- `AudioPlayer.tsx`: Large play/pause (56px), waveform CSS animation, captain mini-avatar with green "speaking" dot
- `StoryCard.tsx`: Colored card with icon, title, body text. Variants: dinner (emerald), destination (indigo), passenger (rose)

#### 1.4 Screen 1: Control Tower (Home)
- Sky gradient background (light blue -> white)
- Control tower silhouette at top, small clouds, tiny plane animation
- ATC avatar (large) + speech bubble: "Hey controller! Ready to find some planes?"
- App title: "Catch-A-Plane" in large bold white text
- One CTA: "START SCANNING" with plane icon
- Runway dashes at bottom as decorative element

#### 1.5 Screen 2: Radar Room (Scanning)
- Dark navy background (radar room feel)
- Large circular radar with concentric rings + rotating sweep line (CSS animation)
- 3-4 mock radar blips with callsign labels (monospace font)
- ATC mini-avatar in corner: "I see incoming flights!"
- Bottom instruction: "Move your phone to scan the sky!" with tilt icon
- Auto-select after 2s (mock) -> transition to Screen 3

#### 1.6 Screen 3: Radio Contact (Lock On)
- Sky gradient background
- ATC mini-avatar: "Tower to Flight [CALLSIGN], do you copy, Captain?"
- Center: crosshair/viewfinder with corner brackets, plane icon inside
- FlightInfoCard below crosshair with mock flight data
- One CTA: "Talk to the Captain!" with microphone icon

#### 1.7 Screen 4: Captain's Story (Narration)
- Hero image area (gradient placeholder for now)
- Captain avatar + name + speech bubble (amber tone)
- 3 StoryCards: dinner (green), destination (indigo), passenger (rose)
- AudioPlayer at bottom (non-functional, shows layout)
- Cards bounce-in on appear (Framer Motion)

#### 1.8 Screen 5: Flight Log (Collection)
- Warm amber/cream gradient background
- Header: logbook icon + "Flight Log" + count
- 2-3 mock flight entries (stamp-like cards with replay button)
- 3-4 empty slots (dashed border, "?" icon, "Scan to discover!")
- One CTA: "Scan More Planes!" -> back to Screen 2

#### 1.9 Mock Data
- `lib/mock-data.ts`: 5-10 sample flights, 3-5 pre-written stories
- Used throughout Phase 1 so every screen has realistic content

**Success criteria:**
- All 5 screens render, styled per brief design language
- Can tap through complete flow: 1 -> 2 -> 3 -> 4 -> 5 -> 2
- Looks good on iPhone SE (375px), iPhone 14 Pro (393px), iPad
- Characters are distinct and recognizable
- One oversized CTA per screen, all tap targets 48px+

---

### Phase 2: Real Flight Data (est. 2-3 days)
**Goal:** Replace mock data with real flights from OpenSky Network API.

**What's testable:** Open the app outdoors, see real planes flying overhead on the radar. Flight cards show actual aircraft types and routes.

#### 2.1 Flight API Service Layer
- `lib/flight-api.ts`: OpenSky provider with bounding box query
- In-memory cache (2-3 min TTL) to handle rate limits (10 req/min)
- Transform OpenSky response -> `Flight[]` format
- Fallback dataset for when no flights found (pre-seeded famous flights)

#### 2.2 API Route
- `app/api/flights/route.ts`: GET endpoint, accepts lat/lng params
- Server-side caching, input validation
- Returns `{ flights: Flight[], fromCache: boolean }`

#### 2.3 Geolocation Hook
- `hooks/useGeolocation.ts`: request permission, get coords, handle denial
- Kid-friendly error message if denied (no scary error text)

#### 2.4 Flights Hook
- `hooks/useFlights.ts`: fetch from `/api/flights`, manage loading/error state

#### 2.5 Integration
- Screen 1: "START SCANNING" requests GPS, stores in context
- Screen 2: fetches real flights, renders as radar blips
- Screen 3: displays selected flight's real data
- If no flights: "No planes nearby! Let's try a famous flight!" fallback

**Success criteria:**
- Real flights appear on radar (verify against FlightRadar24)
- Works in NYC, London, Paris (high-traffic areas)
- Fallback works when testing from rural area
- No excessive API calls (check Network tab)
- Graceful handling of API errors

---

### Phase 3: AI Story Generation (est. 3-4 days)
**Goal:** Tapping "Talk to the Captain!" generates a unique story using Claude Haiku.

**What's testable:** Each flight gets a different captain with silly dinner menu, passenger story, and destination fun fact. Content is always kid-appropriate.

#### 3.1 Dependencies
- `ai` + `@ai-sdk/anthropic` (already installed)
- `zod` for structured output schema

#### 3.2 Story Prompt
- `lib/story-prompt.ts`: prompt template taking Flight data as input
- Produces: captainName, personality, dinnerMenu, passengerStory, destinationFact
- Explicit safety rules: no scary content, simple words, happy/silly tone

#### 3.3 API Route
- `app/api/story/route.ts`: POST endpoint
- Uses `generateObject()` from Vercel AI SDK with Zod schema
- Model: `claude-3-5-haiku-20241022`

#### 3.4 Story Generator Hook
- `hooks/useStoryGenerator.ts`: call API, manage loading/error/story state

#### 3.5 Integration
- Screen 3: "Talk to Captain" -> loading state ("Calling the captain...") -> generate story -> store in context -> transition to Screen 4
- Screen 4: render story fields in respective StoryCards
- Loading state: radio static animation + ATC speaking bubble

#### 3.6 Error Handling
- Retry once on failure
- Fallback to pre-written story if retry fails
- Never block the user

**Success criteria:**
- Stories generate in < 5 seconds
- Content is always appropriate for 3-5 year olds
- Captain names are diverse and international
- Dinner menus are consistently silly
- Structured JSON renders correctly in cards
- Run 20+ generations, review all for quality

---

### Phase 4: Voice Narration (est. 2-3 days)
**Goal:** Captain speaks the story aloud using OpenAI TTS. Auto-plays, with play/pause control.

**What's testable:** Story screen auto-plays audio narration. Voice is warm and clear. Play/pause works. Works on iOS Safari.

#### 4.1 Story Text Formatter
- `lib/story-formatter.ts`: convert CaptainStory JSON -> narration script
- Conversational tone, natural pauses, captain introduces themselves

#### 4.2 TTS API Route
- `app/api/tts/route.ts`: POST endpoint, accepts text
- Uses OpenAI TTS API (model: "tts-1", voice: "nova", speed: 0.9)
- Returns audio/mpeg buffer
- Response caching (24hr)

#### 4.3 Audio Player Hook
- `hooks/useAudioPlayer.ts`: play/pause/toggle, currentTime, duration, isPlaying
- Manages HTMLAudioElement lifecycle
- Handles blob URLs (create + revoke)

#### 4.4 Integration
- Screen 3: after story generation, also generate audio (parallel or sequential)
- Screen 4: auto-play audio on mount, AudioPlayer component functional
- iOS Safari: audio triggered by user gesture (tap carries forward from "Talk to Captain")
- When narration ends: show "See Your Flights" prompt

#### 4.5 Fallback
- If OpenAI TTS fails: fall back to Web Speech API (browser native)
- Lower quality but functional

**Success criteria:**
- Audio auto-plays on story screen
- Voice is clear, warm, kid-friendly
- Play/pause toggle works
- Works on iPhone Safari (critical -- autoplay restrictions)
- Total generation time (story + audio) < 8 seconds

---

### Phase 5: AI Image Generation (est. 3-4 days)
**Goal:** Generate unique aircraft and destination illustrations per flight using AI.

**What's testable:** Hero image shows a children's book style aircraft. Destination card shows matching landmark illustration. Images are cached so repeat views are instant.

#### 5.1 Image Generation API Route
- `app/api/image/route.ts`: POST endpoint accepting prompt + style instructions
- Provider: OpenAI DALL-E 3 (or fal.ai for speed) -- evaluate during account setup
- Style prompt suffix: "children's book illustration style, bright colors, rounded shapes, friendly, white background, simple"
- Two generation calls per flight: aircraft + destination landmark

#### 5.2 Image Prompt Builder
- `lib/image-prompts.ts`: build prompts from flight data
- Aircraft: `"A cute cartoon {aircraftType} airplane flying through sunny clouds, children's book illustration"`
- Landmark: `"The {landmark} on a sunny day, children's book illustration, bright and colorful"`
- `lib/landmark-mapping.ts`: airport code -> landmark name (CDG -> "Eiffel Tower", JFK -> "Statue of Liberty")

#### 5.3 Image Caching Strategy
- Cache generated images by key (aircraft type + destination)
- First load: generate + store URL/blob
- Subsequent loads: serve from cache instantly
- Storage: localStorage base64 for MVP, cloud storage (Vercel Blob) for production
- Pre-generate top 20 aircraft + top 30 landmarks on first deploy (optional batch job)

#### 5.4 Loading UX
- Image generation takes 5-15 seconds
- Generate images in parallel with story + TTS (not sequential)
- Show shimmer placeholder while images load
- Fallback: gradient placeholder if generation fails

#### 5.5 Integration
- Screen 3 ("Talk to Captain"): kick off image gen in parallel with story gen
- Screen 4: hero area shows generated images, with shimmer until ready
- Images should not block story/audio -- show them when ready

**Success criteria:**
- Images generate for any aircraft type + destination combo
- Style is consistent (children's book illustration)
- Cached images load instantly on repeat views
- Image gen doesn't block story/audio playback
- Graceful fallback (gradient) if generation fails

---

### Phase 6: Device APIs -- Gyroscope + Haptics (est. 1-2 days)
**Goal:** Tilting phone shifts radar blips. Haptic buzz on lock-on.

**What's testable:** On a real phone, tilting shifts the radar view. Lock-on produces a vibration. Everything degrades gracefully on desktop.

#### 6.1 Gyroscope Hook
- `hooks/useGyroscope.ts`: device orientation, iOS permission request
- Map gamma/beta to X/Y offset (10-30px range)

#### 6.2 Radar Integration
- RadarDisplay applies transform based on orientation
- Smooth CSS transitions on blip positions
- Fallback: blips animate with random drift

#### 6.3 Haptics
- `lib/haptics.ts`: triggerHaptic() and triggerLockOnHaptic() wrappers
- Lock-on: double buzz pattern [50, 50, 50]
- Button tap: light 10ms buzz
- Fallback: visual scale animation only

**Success criteria:**
- Phone tilt shifts radar blips on iPhone and Android
- Haptic buzz on plane lock-on
- No errors on desktop/devices without sensors

---

### Phase 7: Flight Log Persistence + Polish (est. 2-3 days)
**Goal:** Flights persist between sessions. Replay works. PWA installable. Final polish.

**What's testable:** Close and reopen app -- flight log preserved. Replay any past story with audio. Install as PWA on home screen. All animations smooth at 60fps.

#### 7.1 Storage
- `lib/storage.ts`: save/load/clear flight log in localStorage
- `hooks/useFlightLog.ts`: React hook wrapping storage
- Store: flight data, story, timestamp (re-generate audio on replay)

#### 7.2 Flight Log Screen
- Load persisted entries on mount
- Replay button: re-generate audio for stored story, play inline
- Empty slots with progress motivation

#### 7.3 Milestone Celebrations
- Toasts/modals at 1, 5, 10, 20 flights
- "First flight logged!", "Junior Controller!", "Master of the Skies!"

#### 7.4 PWA Configuration
- `next.config.js`: configure @ducanh2912/next-pwa
- `public/manifest.json`: app name, icons, theme color, standalone display
- App icons (192x192, 512x512)

#### 7.5 Animation Polish
- Framer Motion: screen transitions (fade + slide), card bounce-in, button tap scale
- Radar sweep: smooth CSS keyframe animation
- Waveform: audio visualizer CSS animation

#### 7.6 Accessibility
- ARIA labels on all interactive elements
- 48px+ tap targets throughout
- High contrast on CTAs
- VoiceOver/TalkBack testing

#### 7.7 Error Boundary
- `app/error.tsx`: kid-friendly error screen with retry

**Success criteria:**
- Flight log persists across browser sessions
- Can replay any past story
- PWA installs on iOS and Android home screen
- Lighthouse: 90+ performance, accessibility, PWA
- All animations smooth on mid-range devices

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...       # Claude Haiku for story generation
OPENAI_API_KEY=sk-...              # OpenAI TTS + DALL-E for voice + images
FLIGHT_API_PROVIDER=opensky        # Flight data provider (opensky default)
IMAGE_PROVIDER=openai              # Image gen provider (openai or fal)
FAL_KEY=...                        # Optional: fal.ai key (faster image gen)
```

---

## Verification Strategy

| Phase | How to Test |
|-------|------------|
| 0 | `npm run dev` starts clean |
| 1 | Tap through all 5 screens on mobile viewport in Chrome DevTools |
| 2 | Open app with GPS enabled, verify flights match FlightRadar24 |
| 3 | Generate 20 stories, review all for quality + safety |
| 4 | Play audio on iPhone Safari + Android Chrome |
| 5 | Generate images for 5 flights, verify style consistency + caching |
| 6 | Test on physical iPhone + Android device |
| 7 | Kill app, reopen, verify log persists. Run Lighthouse audit. |

---

## First Implementation Step

After plan approval, start with Phase 0 + Phase 1:
1. Initialize Next.js project
2. Create CLAUDE.md with dev instructions
3. Create PLAN.md (this document)
4. Build all 5 screens with mock data
5. Deliver a fully navigable, styled prototype
