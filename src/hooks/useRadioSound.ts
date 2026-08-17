"use client";

import { useRef, useCallback, useEffect } from "react";

/**
 * Synthesizes a radio scanning sound using Web Audio API.
 * Creates ~6 seconds of radio static with periodic beep tones
 * to simulate a radio frequency search.
 */
export function useRadioSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stop = useCallback(() => {
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];

    for (const node of nodesRef.current) {
      try {
        if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch {
        // already stopped
      }
    }
    nodesRef.current = [];

    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    stop();

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const nodes: AudioNode[] = [];
    const now = ctx.currentTime;
    const duration = 6;

    // Master gain (keep volume kid-friendly)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, now);
    masterGain.connect(ctx.destination);
    nodes.push(masterGain);

    // --- White noise (radio static) ---
    const noiseLength = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Bandpass filter to make it sound like radio static
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2000, now);
    bandpass.Q.setValueAtTime(0.5, now);
    // Sweep the frequency for a "tuning" effect
    bandpass.frequency.linearRampToValueAtTime(800, now + 1.5);
    bandpass.frequency.linearRampToValueAtTime(3000, now + 3);
    bandpass.frequency.linearRampToValueAtTime(1200, now + 4.5);
    bandpass.frequency.linearRampToValueAtTime(2500, now + 6);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    // Fade out static as we "lock on"
    noiseGain.gain.linearRampToValueAtTime(0.6, now + 4);
    noiseGain.gain.linearRampToValueAtTime(0.1, now + 5.5);
    noiseGain.gain.linearRampToValueAtTime(0, now + 6);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    nodes.push(noiseSource, bandpass, noiseGain);

    // --- Periodic radar beeps ---
    const beepTimes = [0.5, 1.5, 2.5, 3.2, 3.8, 4.2, 4.5, 4.7, 4.9, 5.1, 5.2, 5.3];
    for (const t of beepTimes) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now + t);

      const beepGain = ctx.createGain();
      beepGain.gain.setValueAtTime(0, now + t);
      beepGain.gain.linearRampToValueAtTime(0.8, now + t + 0.02);
      beepGain.gain.linearRampToValueAtTime(0, now + t + 0.12);

      osc.connect(beepGain);
      beepGain.connect(masterGain);
      osc.start(now + t);
      osc.stop(now + t + 0.15);
      nodes.push(osc, beepGain);
    }

    // --- "Lock on" confirmation tone at the end ---
    const lockOsc = ctx.createOscillator();
    lockOsc.type = "sine";
    lockOsc.frequency.setValueAtTime(880, now + 5.4);
    lockOsc.frequency.setValueAtTime(1100, now + 5.6);

    const lockGain = ctx.createGain();
    lockGain.gain.setValueAtTime(0, now + 5.4);
    lockGain.gain.linearRampToValueAtTime(1, now + 5.5);
    lockGain.gain.linearRampToValueAtTime(0, now + 5.9);

    lockOsc.connect(lockGain);
    lockGain.connect(masterGain);
    lockOsc.start(now + 5.4);
    lockOsc.stop(now + 6);
    nodes.push(lockOsc, lockGain);

    nodesRef.current = nodes;

    // Auto-cleanup after duration
    const cleanup = setTimeout(() => stop(), duration * 1000 + 200);
    timeoutsRef.current.push(cleanup);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { play, stop };
}
