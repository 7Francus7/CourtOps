
import { Redis } from 'ioredis'
import { LRUCache } from 'lru-cache'

// 1. In-Memory Cache (Fallback & Local Dev)
const memoryCache = new LRUCache({
       max: 100, // Max 100 keys
       ttl: 1000 * 60 * 5, // 5 minutes standard TTL
})

// 2. Redis Client (Production)
// Only initialize if process.env.REDIS_URL is present
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null

export async function getCache<T>(key: string): Promise<T | null> {
       // Try Memory First
       if (memoryCache.has(key)) {
              return memoryCache.get(key) as T
       }

       // Try Redis
       if (redis) {
              try {
                     const data = await redis.get(key)
                     if (data) {
                            const parsed = JSON.parse(data)
                            // Populate memory for faster subsequent access (short TTL)
                            memoryCache.set(key, parsed, { ttl: 1000 * 10 })
                            return parsed
                     }
              } catch (error) {
                     console.warn('Redis error on get:', error)
              }
       }

       return null
}

export async function setCache(key: string, value: unknown, ttlSeconds: number = 300) {
       // Set Memory
       memoryCache.set(key, value as object, { ttl: ttlSeconds * 1000 })

       // Set Redis
       if (redis) {
              try {
                     await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
              } catch (error) {
                     console.warn('Redis error on set:', error)
              }
       }
}

/**
 * Rate limiting distribuido usando Redis.
 * Funciona en Node.js runtime (server actions, route handlers).
 * Usa in-memory fallback si Redis no está configurado.
 */
const localRateMap = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimitRedis(
       key: string,
       limit: number,
       windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
       const now = Date.now()
       const windowMs = windowSeconds * 1000

       if (redis) {
              try {
                     const redisKey = `rl:${key}`
                     const count = await redis.incr(redisKey)
                     if (count === 1) await redis.expire(redisKey, windowSeconds)
                     const allowed = count <= limit
                     return { allowed, remaining: Math.max(0, limit - count) }
              } catch (error) {
                     console.warn('Redis rate limit error, falling back to memory:', error)
              }
       }

       // In-memory fallback
       const entry = localRateMap.get(key)
       if (!entry || now > entry.resetAt) {
              localRateMap.set(key, { count: 1, resetAt: now + windowMs })
              return { allowed: true, remaining: limit - 1 }
       }
       entry.count++
       return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) }
}

export async function invalidateCachePattern(pattern: string) {
       // Memory: Clear all because LRU doesn't support pattern matching easily
       // Or filter keys if needed. For now, simple clear is safer for correctness.
       memoryCache.clear()

       // Redis
       if (redis) {
              try {
                     const keys = await redis.keys(pattern)
                     if (keys.length > 0) {
                            await redis.del(keys)
                     }
              } catch (error) {
                     console.warn('Redis error on invalidate:', error)
              }
       }
}
