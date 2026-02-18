/**
 * Rate limiter compatible with Vercel serverless.
 * 
 * Uses in-memory Map as a best-effort approach. On serverless,
 * each cold start resets the map, but within a warm instance
 * the rate limit is enforced. This provides reasonable protection
 * against rapid-fire abuse from a single IP within a single instance.
 * 
 * For stricter enforcement, replace with @upstash/ratelimit + Upstash Redis.
 */

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function checkRateLimit(key: string): { allowed: boolean } {
    const now = Date.now();
    const entry = rateLimit.get(key);

    // Clean up expired entries lazily (no setInterval in serverless)
    if (rateLimit.size > 1000) {
        for (const [k, v] of rateLimit) {
            if (now > v.resetTime) rateLimit.delete(k);
        }
    }

    if (!entry || now > entry.resetTime) {
        rateLimit.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return { allowed: true };
    }

    if (entry.count >= MAX_REQUESTS) {
        return { allowed: false };
    }

    entry.count++;
    return { allowed: true };
}
