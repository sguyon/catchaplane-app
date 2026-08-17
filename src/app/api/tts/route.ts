import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const start = performance.now();

  // Rate limit (per IP): TTS is the dominant cost. Limits are generous because
  // one story is streamed as ~10-14 sentence chunks (each its own request).
  const limited = enforceRateLimit(request, "tts", 45, 350);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { text } = body;

    console.log(`[API] POST /api/tts -- text length=${text?.length || 0}`);

    if (!text || typeof text !== "string") {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/tts -- 400 -- ${ms}ms -- missing text`);
      return NextResponse.json(
        { error: "Missing or invalid text" },
        { status: 400 }
      );
    }

    // Cap request size. The app only ever sends short sentence chunks (~200
    // chars); this bounds per-request TTS cost so a bot can't max out OpenAI's
    // 4096-char limit on every call.
    const MAX_TTS_CHARS = 500;
    if (text.length > MAX_TTS_CHARS) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/tts -- 400 -- ${ms}ms -- text too long (${text.length})`);
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TTS_CHARS} characters)` },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/tts -- 503 -- ${ms}ms -- no API key`);
      return NextResponse.json(
        { error: "TTS not configured", noKey: true },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // tts-1 (not tts-1-hd): ~2-3x faster generation, fidelity difference is
    // inaudible for short kid-narration chunks. The client sends one sentence
    // or two at a time and streams them, so each call must return quickly.
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "fable",
      input: text,
      speed: 0.95,
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    const ms = Math.round(performance.now() - start);
    console.log(`[API] POST /api/tts -- 200 -- ${ms}ms -- ${(audioBuffer.length / 1024).toFixed(1)} KB audio`);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=86400", // 24hr cache
      },
    });
  } catch (error) {
    const ms = Math.round(performance.now() - start);
    const status = (error as { status?: number })?.status;
    const code = (error as { code?: string })?.code;

    if (status === 429 || code === "insufficient_quota") {
      console.warn(`[API] POST /api/tts -- 503 -- ${ms}ms -- quota exceeded`);
      return NextResponse.json(
        { error: "TTS quota exceeded", quotaExceeded: true },
        { status: 503 }
      );
    }

    console.error(`[API] POST /api/tts -- 500 -- ${ms}ms -- error:`, error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
