import type { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../../lib/cache.js';

// Distributed rate limit using Redis INCR + PX TTL
// Falls back to in-memory buckets when Redis unreachable.
const memoryBuckets: Record<string, { count: number; reset: number }> = {};

interface RateOptions { limit: number; windowMs: number; }

export function rateLimit(options: RateOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // In test environment we bypass rate limiting entirely to avoid Redis dependency
    // and eliminate timing variability for integration tests.
    if (process.env.NODE_ENV === 'test') {
      return; // always allow
    }
    const ip = request.ip || 'unknown';
    const route = request.routerPath || request.url;
    const key = `rl:${route}:${ip}`;
    const windowMs = options.windowMs;

    try {
      // Use a single key per window; when first increment set expiry
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      if (count > options.limit) {
        const ttl = await redis.pttl(key);
        const wait = Math.ceil(ttl / 1000);
        return reply.code(429).send({ ok: false, error: { code: 'RATE_LIMIT', message: `Tente novamente em ~${wait}s` } });
      }
      return; // allowed
    } catch {
      // Fallback in-memory (same semantics as original)
      const now = Date.now();
      let bucket = memoryBuckets[key];
      if (!bucket || bucket.reset < now) {
        bucket = { count: 0, reset: now + windowMs };
        memoryBuckets[key] = bucket;
      }
      bucket.count++;
      if (bucket.count > options.limit) {
        const wait = Math.ceil((bucket.reset - now) / 1000);
        return reply.code(429).send({ ok: false, error: { code: 'RATE_LIMIT', message: `Tente novamente em ~${wait}s (fallback)` } });
      }
    }
  };
}