
import { LRUCache } from 'lru-cache'

type RateLimitContext = {
       remaining: number
       reset: number
}

const rateLimitCache = new LRUCache<string, number[]>({
       max: 500, // Track up to 500 IPs
       ttl: 60 * 1000, // 1 minute window
})

export const rateLimiter = {
       /**
        * Check if a request is within limits.
        * @param ip - User IP address
        * @param limit - Max requests per window (default 50)
        * @returns { success: boolean, headers: HeadersInit }
        */
       check: (ip: string, limit: number = 50) => {
              const now = Date.now()
              const windowStart = now - 60 * 1000

              const requestTimestamps = rateLimitCache.get(ip) || []

              // Filter timestamps within the current window
              const recentRequests = requestTimestamps.filter(t => t > windowStart)

              // Add current request
              recentRequests.push(now)

              // Update cache
              rateLimitCache.set(ip, recentRequests)

              const currentUsage = recentRequests.length
              const remaining = Math.max(0, limit - currentUsage)
              const reset = Math.ceil((windowStart + 60 * 1000) / 1000)

              const headers = {
                     'X-RateLimit-Limit': limit.toString(),
                     'X-RateLimit-Remaining': remaining.toString(),
                     'X-RateLimit-Reset': reset.toString()
              }

              return {
                     success: currentUsage <= limit,
                     headers
              }
       }
}
