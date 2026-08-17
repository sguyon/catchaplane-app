# Catch-A-Plane -- Development Instructions

## Project Overview

Mobile-first Next.js PWA for kids aged 3-5. The child plays as a "Little Air Traffic Controller" -- scans the sky to find real planes, establishes radio contact with the captain, and hears an AI-generated story narrated aloud.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-based theme in `globals.css`)
- **State:** React Context (`src/contexts/AppContext.tsx`) + localStorage
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) for story generation
- **TTS:** OpenAI TTS API for voice narration
- **Images:** AI-generated via DALL-E / fal.ai
- **Flight Data:** OpenSky Network API (free, no key required)
- **Animations:** Framer Motion + CSS keyframes
- **Validation:** Zod for structured AI output

## Architecture

### Single-Page State Machine

The app is a single page (`app/page.tsx`) with 5 screens managed by React Context state:

```
ControlTower -> RadarRoom -> RadioContact -> CaptainStory -> FlightLog -> RadarRoom (loop)
```

No URL routing between screens. Transitions are animated via Framer Motion.

### API Routes

All external API calls go through Next.js API routes (server-side, keys never exposed to client):

- `app/api/flights/route.ts` -- Proxies OpenSky Network, caches results
- `app/api/story/route.ts` -- Generates story via Claude Haiku (structured output)
- `app/api/tts/route.ts` -- Generates audio via OpenAI TTS
- `app/api/image/route.ts` -- Generates illustrations via DALL-E / fal.ai

### Key Directories

```
src/
├── app/           # Next.js app router (layout, page, API routes)
├── components/
│   ├── screens/   # The 5 main screens
│   ├── characters/# ATC + Captain SVG avatars
│   ├── ui/        # Reusable UI components
│   ├── radar/     # Radar display components
│   └── shared/    # Transitions, loading states
├── contexts/      # AppContext (global state)
├── hooks/         # Custom React hooks
└── lib/           # Utilities, types, constants, API clients
```

## Design System

### Key Principles

- **One action per screen.** Every screen has a single oversized CTA.
- **Voice-first.** All content is spoken aloud. No reading required.
- **Two characters:** ATC (guide, sky-blue) and Captain (storyteller, amber).
- **Kid-friendly:** 48px+ tap targets, rounded everything, bright colors.

### Colors (defined in `globals.css` @theme)

| Token | Hex | Usage |
|-------|-----|-------|
| `sky` | `#38bdf8` | Primary, ATC speech bubbles |
| `navy` | `#1e293b` | Radar background, text |
| `amber` | `#f59e0b` | CTAs, Captain speech bubbles |
| `emerald` | `#10b981` | Dinner story card |
| `indigo` | `#6366f1` | Destination story card |
| `rose` | `#f43f5e` | Passenger story card |
| `cream` | `#fffbeb` | Flight log background |

### Typography

- **Font:** Nunito (loaded via `next/font/google`)
- **Weights:** 400 (body), 700 (headings), 800-900 (CTAs)

### Border Radius

- Buttons: `rounded-[28px]` (28px)
- Cards: `rounded-[20px]` (20px)
- Avatars: `rounded-full`

### Tap Targets

- Minimum: 48px
- CTAs: 56-64px tall, full-width

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```
ANTHROPIC_API_KEY=    # Required from Phase 3
OPENAI_API_KEY=       # Required from Phase 4
FLIGHT_API_PROVIDER=opensky
IMAGE_PROVIDER=openai
```

## Progress Tracking

**After every development session**, update `PROGRESS.md` with:
- What was built or changed
- New files created
- Current phase status
- New git commits (hash + description)

This file is the source of truth for what has been done. Always read it at the start of a session.

## Development Notes

- Test on mobile viewport (375px width) in Chrome DevTools
- The radar gyroscope interaction is theatrical, NOT real AR
- OpenSky API: 10 req/min rate limit, cache for 2-3 minutes
- iOS Safari has strict autoplay policies -- audio must follow user gesture
- Character avatars are inline SVG components (not image files)
- All animations use CSS keyframes or Framer Motion (no JS timers for visual effects)

## Cursor Cloud specific instructions

- Node 22 and npm are preinstalled; dependencies are refreshed by the startup update script (`npm ci`). No Docker, database, or other external services are required.
- The app runs fully without any API keys. All AI-backed routes (`/api/story`, `/api/tts`, `/api/image`) degrade gracefully to mock stories / no audio / no images when `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` are unset. Set them in `.env.local` only when testing real AI generation.
- The OpenSky flight API is typically unreachable from the cloud VM, so `/api/flights` returns its built-in fallback flights (e.g. `AIRFRC1` Boeing 747). This is expected — the core Control Tower → Radar → Radio Contact → Captain's Story → Flight Log flow still works end-to-end with fallback data.
- Standard commands live in `package.json` scripts / the Commands section above: `npm run dev` (dev server on port 3000), `npm run lint`, `npm test -- --run` (vitest is watch mode by default; pass `--run` for one-shot), `npm run build`.
- Pre-existing baseline (not caused by env setup): `npm run lint` reports errors/warnings and 2 of 27 vitest tests fail (`AudioPlayer` size class + `PlaneSprite` color) due to stale test expectations vs. current components. Do not treat these as environment breakage.
