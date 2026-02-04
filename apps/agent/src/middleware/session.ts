/**
 * Session Management Middleware
 * 
 * Redis-backed session management for concurrent users
 */

import type { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { sessionManager } from '../utils/redis.js'

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: SessionData
      sessionId?: string
    }
  }
}

export interface SessionData {
  sessionId: string
  userId?: string
  createdAt: number
  lastActivity: number
  data: Record<string, any>
}

interface SessionMiddlewareOptions {
  sessionIdHeader?: string
  requireSession?: boolean
  autoCreate?: boolean
}

/**
 * Create session middleware
 */
export function createSessionMiddleware(options: SessionMiddlewareOptions = {}) {
  const {
    sessionIdHeader = 'x-session-id',
    requireSession = false,
    autoCreate = true,
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get session ID from header only (cookies not supported without cookie-parser)
      let sessionId = req.headers[sessionIdHeader] as string

      // Check if session exists
      let session: SessionData | null = null

      if (sessionId) {
        session = await sessionManager.getSession(sessionId)

        if (session) {
          // Session found - update last activity
          session.lastActivity = Date.now()
          await sessionManager.setSession(sessionId, session)
          await sessionManager.extendSession(sessionId)
        } else if (requireSession) {
          // Session not found but required
          return res.status(401).json({
            error: 'Invalid session',
            message: 'Session has expired or is invalid',
          })
        }
      }

      // Create new session if needed
      if (!session && autoCreate) {
        sessionId = uuidv4()
        session = {
          sessionId,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          data: {},
        }
        await sessionManager.setSession(sessionId, session)
      }

      // Require session check
      if (requireSession && !session) {
        return res.status(401).json({
          error: 'Session required',
          message: 'Please create a session first',
        })
      }

      // Attach session to request
      if (session) {
        req.session = session
        req.sessionId = sessionId

        // Set session ID in response header
        res.setHeader(sessionIdHeader, sessionId!)
      }

      next()
    } catch (error: any) {
      console.error('❌ Session middleware error:', error.message)
      next(error)
    }
  }
}

/**
 * Middleware to require authenticated session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource',
    })
  }
  next()
}

/**
 * Middleware to attach user ID to session
 */
export async function attachUserId(
  req: Request,
  userId: string
): Promise<void> {
  if (req.session) {
    req.session.userId = userId
    await sessionManager.setSession(req.sessionId!, req.session)
  }
}

/**
 * Middleware to destroy session
 */
export async function destroySession(req: Request): Promise<void> {
  if (req.sessionId) {
    await sessionManager.deleteSession(req.sessionId)
    req.session = undefined
    req.sessionId = undefined
  }
}

/**
 * Middleware to get/set session data
 */
export async function getSessionData(
  req: Request,
  key: string
): Promise<any> {
  return req.session?.data[key]
}

export async function setSessionData(
  req: Request,
  key: string,
  value: any
): Promise<void> {
  if (req.session) {
    req.session.data[key] = value
    await sessionManager.setSession(req.sessionId!, req.session)
  }
}

/**
 * Predefined session middleware configurations
 */

// Basic session - auto-create for all requests
export const basicSession = createSessionMiddleware({
  autoCreate: true,
  requireSession: false,
})

// Authenticated session - require valid session
export const authSession = createSessionMiddleware({
  autoCreate: false,
  requireSession: true,
})

// Optional session - don't auto-create
export const optionalSession = createSessionMiddleware({
  autoCreate: false,
  requireSession: false,
})

export default {
  createSessionMiddleware,
  requireAuth,
  attachUserId,
  destroySession,
  getSessionData,
  setSessionData,
  basicSession,
  authSession,
  optionalSession,
}
