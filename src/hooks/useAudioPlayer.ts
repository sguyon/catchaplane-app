"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface AudioPlayerState {
  isPlaying: boolean;
  loading: boolean;
  error: string | null;
  hasAudio: boolean;
}

// How many chunks ahead to fetch while the current one plays. 2 keeps the
// next clip ready before the current ends, so playback stays near-seamless.
const PREFETCH_AHEAD = 2;

/**
 * Split narration into small chunks so the first sound plays fast.
 * The first chunk is a single sentence (fastest to generate); the rest are
 * merged into ~140-char groups to keep the number of TTS requests sane.
 */
function splitIntoChunks(text: string): string[] {
  const sentences =
    text
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [];

  const first = sentences[0];
  if (!first) return text.trim() ? [text.trim()] : [];

  const chunks: string[] = [first.trim()];
  let buf = "";
  for (let i = 1; i < sentences.length; i++) {
    buf += sentences[i];
    if (buf.trim().length >= 140) {
      chunks.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    loading: false,
    error: null,
    hasAudio: false,
  });

  // A single reusable audio element. Reused (rather than one Audio per chunk)
  // so that once iOS unlocks it on first play, subsequent chunks keep playing
  // without tripping the autoplay policy.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0); // index of the chunk currently playing
  const wantPlayingRef = useRef(false); // user intends playback right now
  // Dedupes in-flight fetches and caches blob URLs by chunk index.
  const chunkUrlsRef = useRef<Map<number, Promise<string | null>>>(new Map());

  const cleanupChunks = useCallback(() => {
    for (const p of chunkUrlsRef.current.values()) {
      p.then((url) => url && URL.revokeObjectURL(url)).catch(() => {});
    }
    chunkUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cleanupChunks();
    };
  }, [cleanupChunks]);

  // Fetch one chunk's audio, returning a blob URL. Returns null when TTS is
  // unavailable (no key / quota) so callers can silently degrade. Throws on
  // real network/server errors. Dedupes concurrent calls for the same index.
  const fetchChunk = useCallback((i: number): Promise<string | null> => {
    if (i < 0 || i >= chunksRef.current.length) return Promise.resolve(null);

    const existing = chunkUrlsRef.current.get(i);
    if (existing) return existing;

    const promise = (async () => {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunksRef.current[i] }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.noKey || data.quotaExceeded) return null;
        throw new Error(data.error || "Failed to generate audio");
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    })();

    // Drop the cache entry on failure so a later attempt can retry.
    promise.catch(() => chunkUrlsRef.current.delete(i));
    chunkUrlsRef.current.set(i, promise);
    return promise;
  }, []);

  const prefetchAhead = useCallback(
    (from: number) => {
      for (let j = from; j < from + PREFETCH_AHEAD; j++) {
        if (j < chunksRef.current.length) fetchChunk(j).catch(() => {});
      }
    },
    [fetchChunk]
  );

  // Play chunk `i`, then chain to the next when it ends.
  const playIndex = useCallback(
    async (i: number) => {
      if (i >= chunksRef.current.length) {
        wantPlayingRef.current = false;
        setState((s) => ({ ...s, isPlaying: false, loading: false }));
        return;
      }

      indexRef.current = i;
      prefetchAhead(i + 1);
      setState((s) => ({ ...s, loading: true }));

      let url: string | null;
      try {
        url = await fetchChunk(i);
      } catch {
        setState((s) => ({ ...s, loading: false, isPlaying: false, error: "Audio failed" }));
        return;
      }

      // TTS unavailable: degrade silently.
      if (url === null) {
        setState({ isPlaying: false, loading: false, error: null, hasAudio: false });
        return;
      }

      // User paused while this chunk was buffering.
      if (!wantPlayingRef.current) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener("ended", () => {
          playIndex(indexRef.current + 1);
        });
      }

      const audio = audioRef.current;
      audio.src = url;
      // Clear loading as soon as the clip is READY. Do NOT gate loading on
      // audio.play(): its promise can stay pending indefinitely (blocked
      // autoplay after an async gap, or a stalled media element), which would
      // otherwise leave the UI stuck on "loading" forever.
      setState((s) => ({ ...s, loading: false, hasAudio: true }));
      audio
        .play()
        .then(() => setState((s) => ({ ...s, isPlaying: true })))
        .catch(() => {
          // Autoplay blocked - user needs to tap the play button.
          setState((s) => ({ ...s, isPlaying: false }));
        });
    },
    [fetchChunk, prefetchAhead]
  );

  // Prepare narration and resolve as soon as the FIRST chunk is ready, so the
  // caller can start playback within a couple of seconds instead of waiting
  // for the entire story to generate.
  const generateAudio = useCallback(
    async (text: string): Promise<boolean> => {
      // Reset any prior narration.
      if (audioRef.current) audioRef.current.pause();
      cleanupChunks();
      wantPlayingRef.current = false;
      indexRef.current = 0;
      chunksRef.current = splitIntoChunks(text);

      if (chunksRef.current.length === 0) {
        setState({ isPlaying: false, loading: false, error: null, hasAudio: false });
        return false;
      }

      setState({ isPlaying: false, loading: true, error: null, hasAudio: false });

      try {
        const first = await fetchChunk(0);
        if (first === null) {
          setState({ isPlaying: false, loading: false, error: null, hasAudio: false });
          return false;
        }
        prefetchAhead(1);
        setState({ isPlaying: false, loading: false, error: null, hasAudio: true });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Audio generation failed";
        setState({ isPlaying: false, loading: false, error: message, hasAudio: false });
        return false;
      }
    },
    [cleanupChunks, fetchChunk, prefetchAhead]
  );

  const play = useCallback(() => {
    wantPlayingRef.current = true;
    const audio = audioRef.current;
    // Resume mid-chunk if we paused; otherwise start the current chunk.
    if (audio && audio.src && !audio.ended && audio.currentTime > 0) {
      audio
        .play()
        .then(() => setState((s) => ({ ...s, isPlaying: true })))
        .catch(() => setState((s) => ({ ...s, isPlaying: false })));
    } else {
      playIndex(indexRef.current);
    }
  }, [playIndex]);

  const pause = useCallback(() => {
    wantPlayingRef.current = false;
    if (audioRef.current) audioRef.current.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  return {
    ...state,
    generateAudio,
    play,
    pause,
    toggle,
  };
}
