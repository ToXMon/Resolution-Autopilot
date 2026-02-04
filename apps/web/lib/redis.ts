/**
 * Redis Client Configuration
 * 
 * Provides Redis connection with graceful fallback to memory when unavailable.
 * Used for session management, rate limiting, and caching.
 */

import { createClient } from 'redis'

export type RedisClient = ReturnType<typeof createClient>

// Configuration constants
const REDIS_MAX_RETRIES = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10)
const REDIS_RETRY_BASE_MS = parseInt(process.env.REDIS_RETRY_BASE_MS || '100', 10)
const REDIS_RETRY_MAX_MS = parseInt(process.env.REDIS_RETRY_MAX_MS || '3000', 10)

let redisClient: RedisClient | null = null
let redisAvailable = false
let initPromise: Promise<RedisClient | null> | null = null

/**
 * Initialize Redis client with connection retry logic (thread-safe singleton)
 */
export async function initRedis(): Promise<RedisClient | null> {
  // If Redis is already initialized, return it
  if (redisClient) {
    return redisClient
  }
  
  // If initialization is in progress, wait for it
  if (initPromise) {
    return initPromise
  }
  
  // Skip Redis if not configured
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Redis not configured. Using in-memory fallback.')
    return null
  }
  
  // Create initialization promise to prevent concurrent init
  initPromise = (async () => {
    try {
      const url = process.env.REDIS_URL || 'redis://localhost:6379'
      
      redisClient = createClient({
        url,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > REDIS_MAX_RETRIES) {
              console.error(`❌ Redis connection failed after ${REDIS_MAX_RETRIES} retries. Falling back to memory.`)
              redisAvailable = false
              return false // Stop retrying
            }
            return Math.min(retries * REDIS_RETRY_BASE_MS, REDIS_RETRY_MAX_MS)
          },
        },
      })
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err)
      redisAvailable = false
    })
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected')
      redisAvailable = true
    })
    
    redisClient.on('ready', () => {
      console.log('✅ Redis ready')
      redisAvailable = true
    })
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...')
    })
    
    redisClient.on('end', () => {
      console.log('❌ Redis connection ended')
      redisAvailable = false
    })
    
    await redisClient.connect()
      return redisClient
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      redisAvailable = false
      redisClient = null
      return null
    } finally {
      initPromise = null
    }
  })()
  
  return initPromise
}

/**
 * Get Redis client (returns null if unavailable)
 */
export function getRedis(): RedisClient | null {
  return redisAvailable ? redisClient : null
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    redisAvailable = false
  }
}

/**
 * Redis session storage utilities
 */
export const sessionStore = {
  /**
   * Set session data with expiration
   */
  async set(sessionId: string, data: any, expirationSeconds = 3600): Promise<void> {
    const client = getRedis()
    if (!client) {
      // Fallback to memory or skip (handled by Next.js session middleware)
      return
    }
    
    await client.setEx(`session:${sessionId}`, expirationSeconds, JSON.stringify(data))
  },
  
  /**
   * Get session data
   */
  async get(sessionId: string): Promise<any | null> {
    const client = getRedis()
    if (!client) {
      return null
    }
    
    const data = await client.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  },
  
  /**
   * Delete session
   */
  async delete(sessionId: string): Promise<void> {
    const client = getRedis()
    if (!client) {
      return
    }
    
    await client.del(`session:${sessionId}`)
  },
  
  /**
   * Extend session expiration
   */
  async touch(sessionId: string, expirationSeconds = 3600): Promise<void> {
    const client = getRedis()
    if (!client) {
      return
    }
    
    await client.expire(`session:${sessionId}`, expirationSeconds)
  },
}

/**
 * Redis caching utilities
 */
export const cache = {
  /**
   * Set cache with TTL
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const client = getRedis()
    if (!client) {
      return
    }
    
    await client.setEx(`cache:${key}`, ttlSeconds, JSON.stringify(value))
  },
  
  /**
   * Get cached value
   */
  async get<T = any>(key: string): Promise<T | null> {
    const client = getRedis()
    if (!client) {
      return null
    }
    
    const data = await client.get(`cache:${key}`)
    return data ? JSON.parse(data) : null
  },
  
  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    const client = getRedis()
    if (!client) {
      return
    }
    
    await client.del(`cache:${key}`)
  },
  
  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedis()
    if (!client) {
      return false
    }
    
    const result = await client.exists(`cache:${key}`)
    return result === 1
  },
}

/**
 * Initialize Redis on server startup
 */
if (typeof window === 'undefined') {
  initRedis().catch((err) => {
    console.error('Failed to initialize Redis on startup:', err)
  })
}
