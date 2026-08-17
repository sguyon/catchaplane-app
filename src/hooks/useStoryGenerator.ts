"use client";

import { useState, useCallback } from "react";
import type { Flight, CaptainStory, KidProfile } from "@/lib/types";

interface StoryState {
  story: CaptainStory | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
}

export function useStoryGenerator() {
  const [state, setState] = useState<StoryState>({
    story: null,
    loading: false,
    error: null,
    isMock: false,
  });

  const generateStory = useCallback(
    async (
      flight: Flight,
      profile?: KidProfile | null,
      allProfiles?: KidProfile[]
    ): Promise<CaptainStory | null> => {
      setState({ story: null, loading: true, error: null, isMock: false });

      try {
        const response = await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flight,
            kidName: profile?.name,
            interests: profile?.interests,
            languages: profile?.languages,
            allProfiles,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate story");
        }

        setState({
          story: data.story,
          loading: false,
          error: data.error || null,
          isMock: data.mock || false,
        });

        return data.story as CaptainStory;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not generate story";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
        return null;
      }
    },
    []
  );

  return {
    ...state,
    generateStory,
  };
}
