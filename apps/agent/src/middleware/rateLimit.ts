/**
 * Rate Limiting Middleware
 * 
 * Redis-backed rate limiting to protect API endpoints
 * Prevents abuse and ensures fair usage
 */

import type { Request, Response, NextFunction } from 'express'
import { rateLimitStore } from '../utils/redis.js'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  keyGenerator?: (req: Request) => string // Custom key generator
  skip?: (req: Request) => boolean // Skip rate limiting for certain requests
}

/**
 * Create rate limiting middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || 'unknown',
    skip = () => false,
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting if specified
      if (skip(req)) {
        return next()
      }

      // Generate rate limit key
      const key = keyGenerator(req)

      // Increment counter
      const { count, ttl } = await rateLimitStore.increment(key, windowMs)

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString())
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString())

      // Check if rate limit exceeded
      if (count > maxRequests) {
        const retryAfter = Math.ceil(ttl / 1000)
        res.setHeader('Retry-After', retryAfter.toString())

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message,
          retryAfter: retryAfter,
          resetAt: new Date(Date.now() + ttl).toISOString(),
        })
      }

      next()
    } catch (error: any) {
      console.error('❌ Rate limiting error:', error.message)
      // On Redis error, allow request to proceed (fail open)
      next()
    }
  }
}

/**
 * Predefined rate limiters for different endpoints
 */

// General API rate limit: 100 requests per 15 minutes
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many API requests. Please try again in 15 minutes.',
})

// Agent endpoint rate limit: 20 requests per minute (more restrictive due to LLM costs)
export const agentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Too many agent requests. Please try again in a minute.',
  keyGenerator: (req) => {
    // Use session ID if available, otherwise IP
    const sessionId = req.headers['x-session-id'] as string
    return sessionId || req.ip || 'unknown'
  },
})

// Workout logging rate limit: 50 requests per hour
export const workoutRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
  message: 'Too many workout logs. Please try again later.',
})

// Health check - no rate limit
export const healthCheckLimiter = createRateLimiter({
  windowMs: 1000,
  maxRequests: 1000,
  skip: () => true, // Never rate limit health checks
})

/**
 * Rate limiter for specific user sessions
 */
export function createSessionRateLimiter(
  maxRequests: number,
  windowMs: number
) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => {
      const sessionId = req.headers['x-session-id'] as string
      if (!sessionId) {
        throw new Error('Session ID required')
      }
      return `session:${sessionId}`
    },
  })
}

/**
 * Rate limiter for IP-based limiting
 */
export function createIPRateLimiter(
  maxRequests: number,
  windowMs: number
) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => {
      const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown'
      return `ip:${ip}`
    },
  })
}

/**
 * Utility to reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  await rateLimitStore.reset(key)
}

export default {
  createRateLimiter,
  apiRateLimiter,
  agentRateLimiter,
  workoutRateLimiter,
  healthCheckLimiter,
  createSessionRateLimiter,
  createIPRateLimiter,
  resetRateLimit,
}
