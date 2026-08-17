# Catch-A-Plane

**Work in progress.**

<div align="center">

![Catch-A-Plane preview: app icon, start screen, radar, and radio contact](/preview.png)

</div>

Mobile-first Next.js PWA for kids aged 3–5. The child plays as a little air traffic controller: scan the sky for real planes, radio the captain, and hear a short AI-narrated story.

This repo is a sanitized snapshot of a personal project. It has no family history and no personal kid profiles.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Works without API keys (mock stories, no voice/images). Add keys to `.env.local` only if you want live generation:

```
ANTHROPIC_API_KEY=   # stories
OPENAI_API_KEY=      # TTS
FAL_KEY=             # avatars (optional)
```

Do not commit `.env.local`.

## Notes

- Default demo pilot is a fictional kid named Sam. Add other pilots in the app; they live in the browser’s localStorage.
- Paid routes (`/api/story`, `/api/tts`, `/api/avatar`) are unauthenticated. Do not deploy this with live keys on a public URL unless you add auth.
- No license file yet — all rights reserved until one is added.
