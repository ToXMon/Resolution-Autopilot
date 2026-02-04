/**
 * Caching Middleware
 * 
 * Redis-backed caching for expensive operations
 * Improves performance and reduces LLM API calls
 */

import type { Request, Response, NextFunction } from 'express'
import { cacheManager } from '../utils/redis.js'
import crypto from 'crypto'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  keyPrefix?: string // Prefix for cache keys
  keyGenerator?: (req: Request) => string // Custom key generator
  skip?: (req: Request) => boolean // Skip caching for certain requests
  varyBy?: string[] // Headers/params to vary cache by
}

/**
 * Create caching middleware for HTTP responses
 */
export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyPrefix = 'http',
    keyGenerator = generateDefaultKey,
    skip = () => false,
    varyBy = [],
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip caching if specified
      if (skip(req)) {
        return next()
      }

      // Generate cache key
      const cacheKey = `${keyPrefix}:${keyGenerator(req)}`

      // Try to get cached response
      const cached = await cacheManager.get(cacheKey)

      if (cached) {
        // Cache hit
        console.log(`✅ Cache hit: ${cacheKey}`)
        res.setHeader('X-Cache', 'HIT')
        return res.status(cached.status || 200).json(cached.body)
      }

      // Cache miss - intercept response
      res.setHeader('X-Cache', 'MISS')

      // Store original json method
      const originalJson = res.json.bind(res)

      // Override json method to cache response
      res.json = function (body: any) {
        // Cache the response
        const status = res.statusCode
        cacheManager.set(cacheKey, { status, body }, ttl).catch((err) => {
          console.error('❌ Failed to cache response:', err.message)
        })

        // Send response
        return originalJson(body)
      }

      next()
    } catch (error: any) {
      console.error('❌ Caching middleware error:', error.message)
      // On error, proceed without caching
      next()
    }
  }
}

/**
 * Generate default cache key from request
 */
function generateDefaultKey(req: Request): string {
  const parts = [
    req.method,
    req.path,
    JSON.stringify(req.query),
    JSON.stringify(req.body),
  ]

  return crypto
    .createHash('sha256')
    .update(parts.join(':'))
    .digest('hex')
    .substring(0, 16)
}

/**
 * Generate cache key with specific parameters
 */
export function generateCacheKey(
  ...parts: (string | number | object)[]
): string {
  const serialized = parts.map((part) =>
    typeof part === 'object' ? JSON.stringify(part) : String(part)
  )

  return crypto
    .createHash('sha256')
    .update(serialized.join(':'))
    .digest('hex')
    .substring(0, 16)
}

/**
 * Predefined caching configurations
 */

// Short cache for frequently changing data (1 minute)
export const shortCache = createCacheMiddleware({
  ttl: 60,
  keyPrefix: 'short',
})

// Medium cache for moderately stable data (5 minutes)
export const mediumCache = createCacheMiddleware({
  ttl: 300,
  keyPrefix: 'medium',
})

// Long cache for stable data (1 hour)
export const longCache = createCacheMiddleware({
  ttl: 3600,
  keyPrefix: 'long',
})

// Workout history cache (5 minutes)
export const workoutCache = createCacheMiddleware({
  ttl: 300,
  keyPrefix: 'workout',
  keyGenerator: (req) => {
    const userId = req.query.user_id || req.body?.user_id || 'unknown'
    const daysBack = req.query.days_back || req.body?.days_back || 7
    return `${userId}:${daysBack}`
  },
  skip: (req) => req.method !== 'GET', // Only cache GET requests
})

// Pattern analysis cache (10 minutes - expensive LLM operation)
export const patternCache = createCacheMiddleware({
  ttl: 600,
  keyPrefix: 'pattern',
  keyGenerator: (req) => {
    const userId = req.query.user_id || req.body?.user_id || 'unknown'
    return `${userId}`
  },
})

/**
 * Utility function to cache expensive operations
 */
export async function cacheOperation<T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  return cacheManager.getOrSet(key, operation, ttl)
}

/**
 * Invalidate cache for a specific pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  await cacheManager.clearPattern(pattern)
  console.log(`✅ Cache invalidated: ${pattern}`)
}

/**
 * Decorator for caching function results
 */
export function cached(keyPrefix: string, ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from arguments
      const cacheKey = `${keyPrefix}:${generateCacheKey(...args)}`

      // Try cache first
      const cached = await cacheManager.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Cache result
      await cacheManager.set(cacheKey, result, ttl)

      return result
    }

    return descriptor
  }
}

export default {
  createCacheMiddleware,
  generateCacheKey,
  shortCache,
  mediumCache,
  longCache,
  workoutCache,
  patternCache,
  cacheOperation,
  invalidateCache,
  cached,
}
