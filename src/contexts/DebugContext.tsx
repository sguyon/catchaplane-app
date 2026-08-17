"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export interface DebugLogEntry {
  id: string;
  method: string;
  url: string;
  path: string;
  requestBody: string | null;
  responseBody: string | null;
  status: number | null;
  duration: number | null;
  timestamp: number;
  pending: boolean;
  error: string | null;
}

interface DebugContextValue {
  entries: DebugLogEntry[];
  clear: () => void;
}

const DebugContext = createContext<DebugContextValue>({
  entries: [],
  clear: () => {},
});

export function useDebug() {
  return useContext(DebugContext);
}

const MAX_ENTRIES = 20;
const MAX_BODY_LENGTH = 500;

function truncate(str: string | null | undefined, max: number): string | null {
  if (!str) return null;
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

let entryCounter = 0;

export function DebugProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DebugLogEntry[]>([]);
  const originalFetch = useRef<typeof window.fetch | null>(null);

  const clear = useCallback(() => setEntries([]), []);

  const addEntry = useCallback((entry: DebugLogEntry) => {
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<DebugLogEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (originalFetch.current) return; // already patched

    originalFetch.current = window.fetch;
    const nativeFetch = originalFetch.current;

    window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : String(input);

      // Only intercept /api/* calls
      if (!url.includes("/api/")) {
        return nativeFetch(input, init);
      }

      const method = init?.method?.toUpperCase() || "GET";
      const path = url.replace(/^https?:\/\/[^/]+/, "");
      const id = `debug-${++entryCounter}`;
      const start = performance.now();

      // Capture request body
      let requestBody: string | null = null;
      if (init?.body) {
        try {
          requestBody = truncate(
            typeof init.body === "string"
              ? init.body
              : JSON.stringify(JSON.parse(String(init.body)), null, 2),
            MAX_BODY_LENGTH
          );
        } catch {
          requestBody = truncate(String(init.body), MAX_BODY_LENGTH);
        }
      }

      const entry: DebugLogEntry = {
        id,
        method,
        url,
        path,
        requestBody,
        responseBody: null,
        status: null,
        duration: null,
        timestamp: Date.now(),
        pending: true,
        error: null,
      };

      addEntry(entry);

      try {
        const response = await nativeFetch(input, init);
        const duration = Math.round(performance.now() - start);

        // Clone response to read body without consuming it
        const clone = response.clone();
        let responseBody: string | null = null;

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try {
            const json = await clone.json();
            responseBody = truncate(
              JSON.stringify(json, null, 2),
              MAX_BODY_LENGTH
            );
          } catch {
            responseBody = "[Could not parse JSON]";
          }
        } else if (contentType.includes("audio/")) {
          const bytes = (await clone.arrayBuffer()).byteLength;
          responseBody = `[Audio: ${(bytes / 1024).toFixed(1)} KB]`;
        } else {
          try {
            responseBody = truncate(await clone.text(), MAX_BODY_LENGTH);
          } catch {
            responseBody = "[Could not read body]";
          }
        }

        updateEntry(id, {
          status: response.status,
          duration,
          responseBody,
          pending: false,
        });

        return response;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        updateEntry(id, {
          duration,
          pending: false,
          error: err instanceof Error ? err.message : "Network error",
        });
        throw err;
      }
    };

    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
        originalFetch.current = null;
      }
    };
  }, [addEntry, updateEntry]);

  // Don't render context in production
  if (process.env.NODE_ENV !== "development") {
    return <>{children}</>;
  }

  return (
    <DebugContext.Provider value={{ entries, clear }}>
      {children}
    </DebugContext.Provider>
  );
}
