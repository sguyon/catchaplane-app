"use client";

import { useState } from "react";

export interface GenerateAvatarResponse {
  avatarUrl: string;
  mock?: boolean;
}

export function useAvatarGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAvatar = async (
    name: string,
    gender: "boy" | "girl" | "neutral"
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, gender }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate avatar");
      }

      const data = (await response.json()) as GenerateAvatarResponse;
      return data.avatarUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[useAvatarGenerator] Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateAvatar, loading, error };
}
