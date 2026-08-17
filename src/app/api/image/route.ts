import { NextResponse } from "next/server";

/**
 * Images are now precached from free stock photo services.
 * This route is deprecated but kept for backward compatibility.
 * All image requests go through the image cache in useImageGenerator.ts
 */
export async function POST() {
  const ms = Math.round(performance.now());
  console.log(`[API] POST /api/image -- 200 -- ${ms}ms -- using cached images (no generation)`);

  // Return a success response but note that image generation is disabled
  return NextResponse.json({
    url: "https://images.unsplash.com/photo-1506973404872-a4111814034e?w=1024&h=768&fit=crop&q=80",
    cached: true,
    note: "Image generation disabled. Using precached stock photos instead."
  });
}
