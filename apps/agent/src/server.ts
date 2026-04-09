/**
 * HTTP Server for Resolution Autopilot Agent
 * 
 * Production-ready Express server with:
 * - Rate limiting
 * - Session management
 * - Caching
 * - Performance monitoring
 * - Graceful shutdown
 */

import express, { type Request, type Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { runAgent } from './agent.js'
import { initRedis, closeRedis } from './utils/redis.js'
import { closeDatabase, getPoolStatus } from './db/pool.js'
import { performanceMonitor } from './utils/performance.js'
import {
  apiRateLimiter,
  agentRateLimiter,
  workoutRateLimiter,
  healthCheckLimiter,
} from './middleware/rateLimit.js'
import { basicSession, optionalSession } from './middleware/session.js'
import { workoutCache, patternCache } from './middleware/cache.js'
import { logWorkout, getWorkoutHistory } from './tools/workout.js'
import { detectPatterns } from './tools/patterns.js'
import { showWelcomeBanner } from './ui.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001')
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

/**
 * Initialize server
 */
async function initializeServer() {
  try {
    // Initialize Redis
    console.log('🔄 Initializing Redis...')
    initRedis()

    // Show welcome banner
    showWelcomeBanner()

    console.log('✅ Server initialization complete')
  } catch (error: any) {
    console.error('❌ Server initialization failed:', error.message)
    throw error
  }
}

/**
 * Middleware Setup
 */
app.use(helmet()) // Security headers
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * Request logging middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  
  next()
})

/**
 * Health Check Endpoint
 */
app.get('/health', healthCheckLimiter, async (req: Request, res: Response) => {
  try {
    const dbStatus = getPoolStatus()
    const perfTargets = performanceMonitor.checkTargets()

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        activeConnections: dbStatus.activeConnections,
        waitingQueue: dbStatus.waitingQueue,
        maxConnections: dbStatus.maxConnections,
      },
      performance: {
        agentResponseTime: {
          target: perfTargets.agentResponseTime.target,
          actual: perfTargets.agentResponseTime.actual,
          passing: perfTargets.agentResponseTime.passing,
        },
        llmCallTime: {
          target: perfTargets.llmCallTime.target,
          actual: perfTargets.llmCallTime.actual,
          passing: perfTargets.llmCallTime.passing,
        },
      },
    })
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    })
  }
})

/**
 * Agent Endpoint - Main AI agent interaction
 */
app.post(
  '/api/agent',
  apiRateLimiter,
  agentRateLimiter,
  basicSession,
  async (req: Request, res: Response) => {
    try {
      performanceMonitor.start('agent_response')

      const { message, userId } = req.body

      if (!message) {
        return res.status(400).json({
          error: 'Message required',
          message: 'Please provide a message',
        })
      }

      // Run agent with performance tracking
      performanceMonitor.start('llm_call')
      const conversation = await runAgent(message)
      performanceMonitor.end('llm_call')

      const duration = performanceMonitor.end('agent_response')

      // Get last assistant message
      const lastMessage = conversation
        .filter((msg) => msg.role === 'assistant')
        .pop()

      res.json({
        success: true,
        response: lastMessage?.content || 'No response generated',
        sessionId: req.sessionId,
        performance: {
          duration: Math.round(duration),
          target: 2000,
          passing: duration < 2000,
        },
      })
    } catch (error: any) {
      performanceMonitor.end('agent_response', { error: true })
      console.error('❌ Agent error:', error.message)
      res.status(500).json({
        error: 'Agent error',
        message: error.message,
      })
    }
  }
)

/**
 * Workout Logging Endpoint
 */
app.post(
  '/api/workout/log',
  apiRateLimiter,
  workoutRateLimiter,
  optionalSession,
  async (req: Request, res: Response) => {
    try {
      const result = await logWorkout(req.body)
      const parsed = JSON.parse(result)

      res.json(parsed)
    } catch (error: any) {
      console.error('❌ Workout logging error:', error.message)
      res.status(500).json({
        error: 'Workout logging failed',
        message: error.message,
      })
    }
  }
)

/**
 * Workout History Endpoint
 */
app.get(
  '/api/workout/history',
  apiRateLimiter,
  workoutCache,
  async (req: Request, res: Response) => {
    try {
      const { user_id, days_back } = req.query

      if (!user_id) {
        return res.status(400).json({
          error: 'User ID required',
          message: 'Please provide user_id parameter',
        })
      }

      const result = await getWorkoutHistory({
        user_id: user_id as string,
        days_back: days_back ? parseInt(days_back as string) : 7,
      })

      const parsed = JSON.parse(result)
      res.json(parsed)
    } catch (error: any) {
      console.error('❌ Workout history error:', error.message)
      res.status(500).json({
        error: 'Failed to fetch workout history',
        message: error.message,
      })
    }
  }
)

/**
 * Pattern Detection Endpoint
 */
app.get(
  '/api/patterns',
  apiRateLimiter,
  patternCache,
  async (req: Request, res: Response) => {
    try {
      const { user_id } = req.query

      if (!user_id) {
        return res.status(400).json({
          error: 'User ID required',
          message: 'Please provide user_id parameter',
        })
      }

      performanceMonitor.start('pattern_analysis')
      const result = await detectPatterns({ user_id: user_id as string })
      performanceMonitor.end('pattern_analysis')

      const parsed = JSON.parse(result)
      res.json(parsed)
    } catch (error: any) {
      performanceMonitor.end('pattern_analysis', { error: true })
      console.error('❌ Pattern detection error:', error.message)
      res.status(500).json({
        error: 'Pattern detection failed',
        message: error.message,
      })
    }
  }
)

/**
 * Performance Stats Endpoint
 */
app.get(
  '/api/performance',
  apiRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const stats = performanceMonitor.getAllStats()
      const targets = performanceMonitor.checkTargets()

      res.json({
        stats,
        targets,
        passing: targets.agentResponseTime.passing && targets.llmCallTime.passing,
      })
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch performance stats',
        message: error.message,
      })
    }
  }
)

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  })
})

/**
 * Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  })
})

/**
 * Graceful Shutdown
 */
let shutdownTimeout: NodeJS.Timeout | null = null

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`)

  // Stop accepting new requests
  server.close(async () => {
    console.log('✅ HTTP server closed')

    try {
      // Close Redis connections
      await closeRedis()

      // Close database connections
      await closeDatabase()

      // Print performance report
      performanceMonitor.printReport()

      // Clear shutdown timeout if successful
      if (shutdownTimeout) {
        clearTimeout(shutdownTimeout)
        shutdownTimeout = null
      }

      console.log('✅ Graceful shutdown complete')
      process.exit(0)
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message)
      process.exit(1)
    }
  })

  // Force shutdown after 30 seconds
  shutdownTimeout = setTimeout(() => {
    console.error('❌ Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

/**
 * Start Server
 */
const server = app.listen(PORT, async () => {
  await initializeServer()
  console.log(`\n🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🤖 Agent endpoint: http://localhost:${PORT}/api/agent`)
  console.log('\nPress Ctrl+C to stop\n')
})

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection:', reason)
  gracefulShutdown('UNHANDLED_REJECTION')
})

export default app
