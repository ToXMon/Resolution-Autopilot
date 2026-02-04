/**
 * Rate Limiting Library
 * 
 * Provides rate limiting functionality with Redis backend and in-memory fallback.
 * Implements token bucket algorithm for smooth rate limiting.
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number
  
  /**
   * Time window in milliseconds
   */
  windowMs: number
  
  /**
   * Optional: Custom key generator function
   */
  keyGenerator?: (identifier: string) => string
  
  /**
   * Optional: Skip rate limiting for certain conditions
   */
  skip?: (identifier: string) => boolean
}

interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean
  
  /**
   * Remaining requests in current window
   */
  remaining: number
  
  /**
   * Time in ms until rate limit resets
   */
  resetMs: number
  
  /**
   * Total limit
   */
  limit: number
}

/**
 * In-memory rate limit store (fallback when Redis unavailable)
 */
class MemoryRateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const existing = this.store.get(key)
    
    // Clean up expired entries
    if (existing && existing.resetTime < now) {
      this.store.delete(key)
    }
    
    const entry = this.store.get(key)
    if (!entry) {
      const resetTime = now + windowMs
      this.store.set(key, { count: 1, resetTime })
      return { count: 1, resetTime }
    }
    
    entry.count++
    return { count: entry.count, resetTime: entry.resetTime }
  }
  
  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
  
  // Cleanup old entries periodically
  startCleanup(): void {
    if (this.cleanupInterval) {
      return // Already started
    }
    
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key)
        }
      }
    }, 60000) // Clean up every minute
  }
  
  // Stop cleanup and clear store
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Import Redis client type
import type { RedisClient } from './redis'

/**
 * Redis-based rate limit store (production)
 */
class RedisRateLimitStore {
  private redis: RedisClient
  
  constructor(redis: RedisClient) {
    this.redis = redis
  }
  
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now()
    const resetTime = now + windowMs
    
    try {
      // Use multi/exec for atomic operations (safer than pipeline)
      const multi = this.redis.multi()
      multi.incr(key)
      multi.pExpire(key, windowMs)
      multi.pTtl(key)
      
      const results = await multi.exec()
      
      // Validate results array
      if (!results || results.length !== 3) {
        throw new Error('Redis multi command failed or returned invalid results')
      }
      
      const count = results[0] as number
      const ttl = results[2] as number
      
      return {
        count,
        resetTime: now + Math.max(0, ttl),
      }
    } catch (error) {
      console.error('Redis increment error:', error)
      // Fallback to simple increment (not atomic, but better than failing)
      const count = await this.redis.incr(key)
      await this.redis.pExpire(key, windowMs)
      return {
        count,
        resetTime,
      }
    }
  }
  
  async reset(key: string): Promise<void> {
    await this.redis.del(key)
  }
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>
  private store: MemoryRateLimitStore | RedisRateLimitStore
  
  constructor(config: RateLimitConfig, redisClient?: RedisClient) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      keyGenerator: config.keyGenerator || ((id) => `ratelimit:${id}`),
      skip: config.skip || (() => false),
    }
    
    if (redisClient) {
      this.store = new RedisRateLimitStore(redisClient)
    } else {
      const memoryStore = new MemoryRateLimitStore()
      memoryStore.startCleanup()
      this.store = memoryStore
    }
  }
  
  /**
   * Check if request is allowed and update counter
   */
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    // Check if we should skip rate limiting
    if (this.config.skip(identifier)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetMs: this.config.windowMs,
        limit: this.config.maxRequests,
      }
    }
    
    const key = this.config.keyGenerator(identifier)
    const { count, resetTime } = await this.store.increment(key, this.config.windowMs)
    
    const allowed = count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - count)
    const resetMs = Math.max(0, resetTime - Date.now())
    
    return {
      allowed,
      remaining,
      resetMs,
      limit: this.config.maxRequests,
    }
  }
  
  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = this.config.keyGenerator(identifier)
    await this.store.reset(key)
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Rate limiter for agent API (100 requests per minute per user)
 */
export const agentRateLimiter = (redisClient?: RedisClient) =>
  new RateLimiter(
    {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      keyGenerator: (userId) => `ratelimit:agent:${userId}`,
    },
    redisClient
  )

/**
 * Rate limiter for external APIs (1000 requests per hour total)
 */
export const externalApiRateLimiter = (redisClient?: RedisClient) =>
  new RateLimiter(
    {
      maxRequests: 1000,
      windowMs: 60 * 60 * 1000, // 1 hour
      keyGenerator: (apiName) => `ratelimit:external:${apiName}`,
    },
    redisClient
  )

/**
 * Rate limiter for authentication attempts (5 per minute per IP)
 */
export const authRateLimiter = (redisClient?: RedisClient) =>
  new RateLimiter(
    {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      keyGenerator: (ip) => `ratelimit:auth:${ip}`,
    },
    redisClient
  )

/**
 * Rate limiter for general API endpoints (300 per minute per user)
 */
export const apiRateLimiter = (redisClient?: RedisClient) =>
  new RateLimiter(
    {
      maxRequests: 300,
      windowMs: 60 * 1000, // 1 minute
      keyGenerator: (userId) => `ratelimit:api:${userId}`,
    },
    redisClient
  )
