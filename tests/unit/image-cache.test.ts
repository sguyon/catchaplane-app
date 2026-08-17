import { describe, it, expect } from "vitest";
import {
  getCachedAircraftImage,
  getCachedDestinationImage,
} from "@/lib/image-cache";

describe("Image Cache", () => {
  describe("getCachedAircraftImage", () => {
    it("should return cached image for known aircraft types", () => {
      const url = getCachedAircraftImage("Airbus A320");
      expect(url).toBeTruthy();
      expect(url).toContain("unsplash.com");
    });

    it("should handle whitespace in aircraft type", () => {
      const url1 = getCachedAircraftImage("Airbus A320");
      const url2 = getCachedAircraftImage("  Airbus A320  ");
      expect(url1).toBe(url2);
    });

    it("should return default image for unknown aircraft", () => {
      const url = getCachedAircraftImage("Unknown Aircraft Type");
      expect(url).toContain("unsplash.com");
    });

    it("should return correct images for diverse aircraft types", () => {
      const aircraftTypes = [
        "Airbus A320",
        "Boeing 737",
        "Boeing 777",
        "Boeing 787",
        "Airbus A380",
      ];

      for (const type of aircraftTypes) {
        const url = getCachedAircraftImage(type);
        expect(url).toBeTruthy();
        expect(url).toContain("unsplash.com");
      }
    });
  });

  describe("getCachedDestinationImage", () => {
    it("should return cached image for known destinations", () => {
      const url = getCachedDestinationImage("New York");
      expect(url).toBeTruthy();
      expect(url).toContain("unsplash.com");
    });

    it("should handle case-insensitive destination lookup", () => {
      const url1 = getCachedDestinationImage("Paris");
      const url2 = getCachedDestinationImage("paris");
      const url3 = getCachedDestinationImage("PARIS");
      expect(url1).toBe(url2);
      expect(url2).toBe(url3);
    });

    it("should handle whitespace in destination", () => {
      const url1 = getCachedDestinationImage("New York");
      const url2 = getCachedDestinationImage("  New York  ");
      expect(url1).toBe(url2);
    });

    it("should return default image for unknown destinations", () => {
      const url = getCachedDestinationImage("Unknown City");
      expect(url).toContain("unsplash.com");
    });

    it("should return correct images for common destinations", () => {
      const destinations = [
        "New York",
        "London",
        "Paris",
        "Tokyo",
        "Dubai",
        "Sydney",
        "Los Angeles",
        "Singapore",
      ];

      for (const dest of destinations) {
        const url = getCachedDestinationImage(dest);
        expect(url).toBeTruthy();
        expect(url).toContain("unsplash.com");
      }
    });
  });
});
