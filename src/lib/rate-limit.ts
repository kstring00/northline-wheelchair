/*
 * Fixed-window rate limit, in memory.
 *
 * The Map lives in the module, so the count resets whenever a serverless
 * instance is recycled and is not shared between instances. That is fine for
 * launch (it stops a runaway form or a naive bot from flooding Jay's inbox).
 * The upgrade, when it matters, is a shared store: Vercel KV or Upstash Redis
 * with the same `rateLimit(key, opts)` signature.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
let lastPrune = 0;

export type RateLimitOptions = { limit: number; windowMs: number };
export type RateLimitResult = { ok: boolean; retryAfterSeconds: number; remaining: number };

function prune(now: number) {
  // Sweep expired windows at most every 30 seconds so the Map stays small.
  if (now - lastPrune < 30_000) return;
  lastPrune = now;
  for (const [key, w] of windows) if (w.resetAt <= now) windows.delete(key);
}

export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions, now = Date.now()): RateLimitResult {
  prune(now);
  let w = windows.get(key);
  if (!w || w.resetAt <= now) {
    w = { count: 0, resetAt: now + windowMs };
    windows.set(key, w);
  }
  w.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((w.resetAt - now) / 1000));
  return { ok: w.count <= limit, retryAfterSeconds, remaining: Math.max(0, limit - w.count) };
}

/** Test hook: forget every window. */
export function resetRateLimits() {
  windows.clear();
}
