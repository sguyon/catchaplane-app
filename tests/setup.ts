import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Nunito: () => ({
    className: "nunito",
  }),
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_APP_NAME = "Catch-A-Plane";
