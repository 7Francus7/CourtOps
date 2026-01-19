
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

export async function setCache(key: string, value: any, ttlSeconds: number = 300) {
       // Set Memory
       memoryCache.set(key, value, { ttl: ttlSeconds * 1000 })

       // Set Redis
       if (redis) {
              try {
                     await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
              } catch (error) {
                     console.warn('Redis error on set:', error)
              }
       }
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
