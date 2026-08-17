import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { buildStoryPrompt } from "@/lib/story-prompt";
import { selectTemplate, selectCompanionsDeterministic, selectFlavor } from "@/lib/story-templates";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { getCachedStory, cacheStory } from "@/lib/storage";
import { MOCK_STORIES } from "@/lib/mock-data";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { Flight, KidProfile } from "@/lib/types";

const storySchema = z.object({
  captainName: z.string().describe("A funny, memorable captain name, e.g. 'Captain Noodle', 'Captain Zigzag', 'Captain Bubbles'. Always include 'Captain' prefix. Be creative and silly!"),
  personality: z.string().describe("A hilarious, over-the-top personality trait in first person that would make a kid laugh, e.g. 'loves doing a little dance every time we fly over a mountain' or 'talks to the clouds and gives them silly names'. Max 20 words. Make it theatrical!"),
  dinnerMenu: z.string().describe("A wildly imaginative, silly airplane dinner menu that sounds magical and funny to a 3-5 year old. Include impossible food items, funny descriptions, and sound effects like 'yum!' or 'sizzle!'. 2-3 sentences."),
  passengerStory: z.string().describe("A hilarious, surprising story about the special passenger on board. Feature them by name. Maybe they discover something cool, do something silly, or have an amazing adventure. Make it funny and heartwarming. 2-3 sentences."),
  destinationFact: z.string().describe("A real, amazing fun fact about the destination city/country that would blow a 3-5 year old's mind. Use comparisons they'd understand ('taller than 100 giraffes!'). Add excitement and wonder. 2-3 sentences."),
});

export async function POST(request: NextRequest) {
  const start = performance.now();

  // Rate limit (per IP): protects the paid Claude call from bots / runaway loops.
  const limited = enforceRateLimit(request, "story", 12, 60);
  if (limited) return limited;

  try {
    const body = await request.json();
    const flight = body.flight as Flight;
    const kidName = body.kidName as string | undefined;
    let interests = body.interests as string[] | undefined;
    let languages = body.languages as string[] | undefined;
    const allProfiles = body.allProfiles as KidProfile[] | undefined;

    // Server-side fallback: if the request is for the default kid but carries
    // no interests -- e.g. an older/cached client bundle that doesn't send
    // them yet -- fill in the canonical interests so the story is still
    // personalized.
    if (kidName === DEFAULT_PROFILE.name) {
      if (!interests || interests.length === 0) interests = DEFAULT_PROFILE.interests;
      if (!languages || languages.length === 0) languages = DEFAULT_PROFILE.languages;
    }

    console.log(`[API] POST /api/story -- callsign=${flight?.callsign} dest=${flight?.destination} kidName=${kidName || "anonymous"} interests=${interests?.length || 0} profiles=${allProfiles?.length || 0}`);

    if (!flight || !flight.callsign) {
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/story -- 400 -- ${ms}ms -- missing flight data`);
      return NextResponse.json(
        { error: "Missing flight data" },
        { status: 400 }
      );
    }

    const name = kidName || "Little Controller";

    // Select template deterministically based on flight ID
    const template = selectTemplate(flight.id);

    // Fold the kid's name into the cache key so a personalized story for one
    // kid isn't served to a different kid on the same flight + template.
    const cacheKey = `${template.id}::${name}`;

    // Select companion profiles (max 2 others, deterministically)
    let companions: string[] = [];
    if (allProfiles && allProfiles.length > 1) {
      const companionProfiles = selectCompanionsDeterministic(
        allProfiles,
        name,
        flight.id
      );
      companions = companionProfiles;
    }

    // Check cache first
    const cachedStory = getCachedStory(flight.id, cacheKey);
    if (cachedStory) {
      const ms = Math.round(performance.now() - start);
      console.log(
        `[API] POST /api/story -- 200 -- ${ms}ms -- captain=${cachedStory.captainName} template=${template.id} companions=[${companions.join(", ")}] [CACHED]`
      );
      return NextResponse.json({
        story: cachedStory,
        mock: false,
        templateId: template.id,
        cached: true,
        companions,
      });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a random mock story as fallback
      const fallbackStory = MOCK_STORIES[Math.floor(Math.random() * MOCK_STORIES.length)];
      const ms = Math.round(performance.now() - start);
      console.log(`[API] POST /api/story -- 200 -- ${ms}ms -- no API key, using mock`);
      return NextResponse.json({ story: fallbackStory, mock: true });
    }

    const flavor = selectFlavor(flight.id);
    const prompt = buildStoryPrompt(
      flight,
      name,
      template,
      companions,
      flavor,
      interests,
      languages
    );

    const { object: story } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: storySchema,
      // High temperature for wild, varied, surprising stories across flights.
      temperature: 1.0,
      prompt,
    });

    // Cache the generated story
    cacheStory(flight.id, cacheKey, story);

    const ms = Math.round(performance.now() - start);
    console.log(
      `[API] POST /api/story -- 200 -- ${ms}ms -- captain=${story.captainName} template=${template.id} companions=[${companions.join(", ")}]`
    );
    return NextResponse.json({
      story,
      mock: false,
      templateId: template.id,
      cached: false,
      companions,
    });
  } catch (error) {
    const ms = Math.round(performance.now() - start);
    console.error(`[API] POST /api/story -- 500 -- ${ms}ms -- error:`, error);

    // Fallback to mock story on any error
    const fallbackStory = MOCK_STORIES[Math.floor(Math.random() * MOCK_STORIES.length)];
    return NextResponse.json({
      story: fallbackStory,
      mock: true,
      error: "Story generation failed, using a pre-written story!",
    });
  }
}
