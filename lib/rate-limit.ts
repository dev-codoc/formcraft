import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only enable rate limiting when Upstash is actually configured. In local dev
// (or any environment without these vars) we skip it entirely instead of
// crashing on every request.
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    })
  : null;

/**
 * Rate-limit a key, failing OPEN. Returns `true` when the request is allowed.
 *
 * If Upstash isn't configured, or the limiter backend is unreachable (e.g. the
 * Redis host can't be resolved), we allow the request and log the problem —
 * an infra hiccup should never turn into a 500 that blocks a form submission.
 */
export async function checkRateLimit(key: string): Promise<boolean> {
  if (!ratelimit) return true;
  try {
    const { success } = await ratelimit.limit(key);
    return success;
  } catch (err) {
    console.error('Rate limit check failed — allowing request:', err);
    return true;
  }
}
