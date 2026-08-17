import { NextResponse } from "next/server";

/**
 * Simple in-memory, per-IP rate limiter for the paid API routes.
 *
 * Kept intentionally dependency-free: a module-level Map of fixed-window
 * counters. It resets on redeploy and is per-instance (fine for a single
 * Railway service). It won't stop a determined attacker rotating IPs, but it
 * caps the realistic runaway/bot case so a public URL can't quietly burn the
 * Anthropic/OpenAI/fal budget.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

// Drop expired buckets occasionally so the Map doesn't grow unbounded.
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

interface WindowResult {
  allowed: boolean;
  retryAfterSec: number;
}

function hitWindow(key: string, limit: number, windowMs: number): WindowResult {
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Best-effort client IP, from the proxy headers Railway/Vercel set. */
function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Enforce a per-minute and per-hour limit for one named route, keyed by IP.
 * Returns a 429 NextResponse if the caller is over either limit, or null to
 * proceed. Call it at the very top of the route handler.
 */
export function enforceRateLimit(
  request: Request,
  name: string,
  perMinute: number,
  perHour: number
): NextResponse | null {
  const id = getClientId(request);
  const minute = hitWindow(`${id}:${name}:m`, perMinute, 60_000);
  const hour = hitWindow(`${id}:${name}:h`, perHour, 3_600_000);

  if (minute.allowed && hour.allowed) return null;

  const retryAfter = Math.max(
    minute.allowed ? 0 : minute.retryAfterSec,
    hour.allowed ? 0 : hour.retryAfterSec
  );
  console.warn(`[RATE-LIMIT] ${name} blocked for ${id} -- retry in ${retryAfter}s`);
  return NextResponse.json(
    { error: "Too many requests -- please slow down a bit!", rateLimited: true },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
