import Redis from 'ioredis';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;
const host = process.env.REDIS_HOST || 'localhost';
const port = parseInt(process.env.REDIS_PORT || '6379');
const disabled = String(process.env.REDIS_DISABLED || '').toLowerCase() === 'true';

export const redis = (isTest || disabled)
  ? ({
      get: async () => null,
      set: async () => {},
      del: async () => {},
      incrby: async () => {},
    } as any)
  : new Redis({ host, port, lazyConnect: true }).on('error', () => {/* swallow error events in dev */});

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    return null; // Fail-soft
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300) {
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    /* ignore */
  }
}

export async function cacheDel(key: string) {
  try {
    await redis.del(key);
  } catch {
    /* ignore */
  }
}

export const CACHE_KEYS = {
  ED01_CARDS: 'cards:ed01:all'
};