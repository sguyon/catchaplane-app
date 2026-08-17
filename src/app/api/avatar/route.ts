import { NextRequest, NextResponse } from "next/server";
import { buildAvatarPrompt } from "@/lib/image-prompts";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Generate a kid avatar using fal.ai Flux Schnell model.
 * Returns avatar as base64 data URL for local storage.
 */
export async function POST(request: NextRequest) {
  const start = performance.now();

  // Rate limit (per IP): protects the paid fal.ai avatar generation.
  const limited = enforceRateLimit(request, "avatar", 8, 30);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { name, gender } = body;

    if (!name || !gender) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/avatar -- 400 -- ${ms}ms -- missing name or gender`);
      return NextResponse.json(
        { error: "Missing name or gender" },
        { status: 400 }
      );
    }

    // Check if fal.ai key is configured
    if (!process.env.FAL_KEY) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/avatar -- 200 -- ${ms}ms -- no FAL_KEY, using placeholder`);
      // Return placeholder emoji avatar
      return NextResponse.json({
        avatarUrl: generatePlaceholderAvatar(gender),
        mock: true,
      });
    }

    const prompt = buildAvatarPrompt(name, gender);

    // Call fal.ai API
    const response = await fetch("https://api.falai.com/v1/fal/flux-schnell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: "square_hd",
        num_images: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`fal.ai API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.images || !result.images[0]) {
      throw new Error("No images returned from fal.ai");
    }

    const imageUrl = result.images[0].url;

    // Download image and convert to base64 data URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from fal.ai`);
    }

    const buffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    const ms = Math.round(performance.now() - start);
    console.log(`[API] POST /api/avatar -- 200 -- ${ms}ms -- name=${name} gender=${gender}`);

    return NextResponse.json({
      avatarUrl: dataUrl,
      mock: false,
    });
  } catch (error) {
    const ms = Math.round(performance.now() - start);
    console.error(`[API] POST /api/avatar -- error:`, error);

    // Fallback to placeholder avatar on any error
    return NextResponse.json({
      avatarUrl: generatePlaceholderAvatar("neutral"),
      mock: true,
      error: "Avatar generation failed, using placeholder",
    });
  }
}

/**
 * Generate a simple emoji-based placeholder avatar.
 * Used when fal.ai is not configured or fails.
 */
function generatePlaceholderAvatar(gender: string): string {
  const emoji = gender === "boy" ? "👦" : gender === "girl" ? "👧" : "🧒";
  const size = 200;

  // Create simple SVG with emoji
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#38bdf8"/>
    <text x="50%" y="50%" font-size="100" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  </svg>`;

  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
}
