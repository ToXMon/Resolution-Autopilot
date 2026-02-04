/**
 * Redis Client for Session Management and Caching
 * 
 * Production-ready Redis client with connection pooling and error handling
 */

import { Redis } from 'ioredis'

let redisClient: Redis | null = null

/**
 * Redis configuration
 */
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'resolution:'
const SESSION_TTL = parseInt(process.env.SESSION_TTL || '3600') // 1 hour default
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300') // 5 minutes default

/**
 * Initialize Redis client with connection pooling
 */
export const initRedis = (): Redis => {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Reconnect when Redis is in readonly mode
          return true
        }
        return false
      },
      lazyConnect: false,
      enableOfflineQueue: true,
      enableReadyCheck: true,
    })

    // Connection event handlers
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redisClient.on('error', (err: Error) => {
      console.error('❌ Redis connection error:', err.message)
    })

    redisClient.on('ready', () => {
      console.log('✅ Redis ready for commands')
    })

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })

    return redisClient
  } catch (error: any) {
    console.error('❌ Failed to initialize Redis:', error.message)
    throw error
  }
}

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    console.log('✅ Redis connection closed')
  }
}

/**
 * Session Management
 */
export class SessionManager {
  private redis: Redis
  private prefix: string

  constructor() {
    this.redis = getRedisClient()
    this.prefix = `${REDIS_PREFIX}session:`
  }

  /**
   * Create or update a session
   */
  async setSession(sessionId: string, data: any): Promise<void> {
    const key = `${this.prefix}${sessionId}`
    await this.redis.setex(key, SESSION_TTL, JSON.stringify(data))
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<any | null> {
    const key = `${this.prefix}${sessionId}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.prefix}${sessionId}`
    await this.redis.del(key)
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string): Promise<void> {
    const key = `${this.prefix}${sessionId}`
    await this.redis.expire(key, SESSION_TTL)
  }

  /**
   * Check if session exists
   */
  async hasSession(sessionId: string): Promise<boolean> {
    const key = `${this.prefix}${sessionId}`
    const exists = await this.redis.exists(key)
    return exists === 1
  }

  /**
   * Get all active session IDs
   */
  async getActiveSessions(): Promise<string[]> {
    const pattern = `${this.prefix}*`
    const keys = await this.redis.keys(pattern)
    return keys.map((key) => key.replace(this.prefix, ''))
  }
}

/**
 * Cache Management
 */
export class CacheManager {
  private redis: Redis
  private prefix: string

  constructor() {
    this.redis = getRedisClient()
    this.prefix = `${REDIS_PREFIX}cache:`
  }

  /**
   * Set cache value with TTL
   */
  async set(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
    const cacheKey = `${this.prefix}${key}`
    await this.redis.setex(cacheKey, ttl, JSON.stringify(value))
  }

  /**
   * Get cache value
   */
  async get(key: string): Promise<any | null> {
    const cacheKey = `${this.prefix}${key}`
    const data = await this.redis.get(cacheKey)
    return data ? JSON.parse(data) : null
  }

  /**
   * Delete cache value
   */
  async delete(key: string): Promise<void> {
    const cacheKey = `${this.prefix}${key}`
    await this.redis.del(cacheKey)
  }

  /**
   * Check if cache key exists
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = `${this.prefix}${key}`
    const exists = await this.redis.exists(cacheKey)
    return exists === 1
  }

  /**
   * Clear all cache with prefix pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    const cachePattern = `${this.prefix}${pattern}`
    const keys = await this.redis.keys(cachePattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  /**
   * Get or set cache (with factory function)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CACHE_TTL
  ): Promise<T> {
    const cached = await this.get(key)
    if (cached !== null) {
      return cached as T
    }

    const value = await factory()
    await this.set(key, value, ttl)
    return value
  }
}

/**
 * Rate Limiting Store (Redis-backed)
 */
export class RateLimitStore {
  private redis: Redis
  private prefix: string

  constructor() {
    this.redis = getRedisClient()
    this.prefix = `${REDIS_PREFIX}ratelimit:`
  }

  /**
   * Increment rate limit counter
   * Returns current count and TTL
   * Uses Lua script for atomic operations
   */
  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    const rateLimitKey = `${this.prefix}${key}`
    
    // Atomic increment with expiry using Lua script
    const luaScript = `
      local key = KEYS[1]
      local windowMs = tonumber(ARGV[1])
      local current = redis.call('incr', key)
      if current == 1 then
        redis.call('pexpire', key, windowMs)
      end
      local ttl = redis.call('pttl', key)
      return {current, ttl}
    `

    const result = await this.redis.eval(
      luaScript,
      1,
      rateLimitKey,
      windowMs
    ) as [number, number]

    return {
      count: result[0],
      ttl: result[1],
    }
  }

  /**
   * Reset rate limit counter
   */
  async reset(key: string): Promise<void> {
    const rateLimitKey = `${this.prefix}${key}`
    await this.redis.del(rateLimitKey)
  }
}

// Export singleton instances
export const sessionManager = new SessionManager()
export const cacheManager = new CacheManager()
export const rateLimitStore = new RateLimitStore()

export default {
  initRedis,
  getRedisClient,
  closeRedis,
  sessionManager,
  cacheManager,
  rateLimitStore,
}
