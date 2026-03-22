
import { Redis } from 'ioredis'
import { LRUCache } from 'lru-cache'

// Node.js runtime only — not compatible with Edge runtime
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

// In-memory fallback (single-instance only — use Redis in production)
const memCache = new LRUCache<string, number[]>({ max: 500, ttl: 60_000 })

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // Unix timestamp (seconds)
  headers: HeadersInit
}

/**
 * Sliding window rate limiter. Multi-instance safe when Redis is configured.
 * Falls back to in-memory LRU when Redis is unavailable (e.g. local dev).
 *
 * @param key      - Unique key, e.g. "login:127.0.0.1" or "payment:userId"
 * @param limit    - Max requests per window (default: 50)
 * @param windowMs - Window size in milliseconds (default: 60s)
 */
export async function checkRateLimit(
  key: string,
  limit: number = 50,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs
  const reset = Math.ceil((now + windowMs) / 1000)

  let count: number

  if (redis) {
    try {
      const redisKey = `rl:${key}`
      const pipe = redis.pipeline()
      pipe.zremrangebyscore(redisKey, '-inf', windowStart)
      pipe.zadd(redisKey, now, `${now}-${Math.random().toString(36).slice(2)}`)
      pipe.zcard(redisKey)
      pipe.pexpire(redisKey, windowMs)
      const results = await pipe.exec()
      count = (results?.[2]?.[1] as number) ?? 1
    } catch {
      count = memFallback(key, windowStart)
    }
  } else {
    count = memFallback(key, windowStart)
  }

  const remaining = Math.max(0, limit - count)
  return {
    success: count <= limit,
    remaining,
    reset,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
    },
  }
}

function memFallback(key: string, windowStart: number): number {
  const now = Date.now()
  const timestamps = (memCache.get(key) ?? []).filter(t => t > windowStart)
  timestamps.push(now)
  memCache.set(key, timestamps)
  return timestamps.length
}
