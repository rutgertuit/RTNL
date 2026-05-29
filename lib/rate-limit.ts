/**
 * Dependency-free in-memory rate limiter (fixed window per key).
 *
 * Scope note: state lives in the process, so on Cloud Run each instance keeps
 * its own counters. A single attacker hitting one instance is throttled; a
 * determined attacker spreading load across autoscaled instances is only
 * partially bounded. This is a deliberate "good enough, zero-infra" guard for
 * cost-incurring routes — upgrade to a shared store (e.g. Upstash Redis) if the
 * exhibits ever take real traffic.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastPrune = 0;

function prune(now: number) {
  // Cheap periodic sweep so the Map doesn't grow unbounded across many IPs.
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets — use for the Retry-After header. */
  retryAfterSec: number;
}

/**
 * Returns `{ ok: false }` once `limit` calls for `key` happen within `windowMs`.
 * Counts the current call when it succeeds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from the proxy headers Cloud Run / Next set. */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
