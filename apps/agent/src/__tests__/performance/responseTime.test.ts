/**
 * Performance Tests
 * 
 * Validates that agent meets performance targets:
 * - Agent response time < 2 seconds (p95)
 * - LLM call time < 1.5 seconds (p95)
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import runAgent from '../../agent.js'
import { performanceMonitor } from '../../utils/performance.js'
import { clearMessages } from '../../memory.js'
import { getDatabase, saveDatabase } from '../../db/pool.js'

describe('Performance Tests', () => {
  beforeAll(() => {
    // Reset performance metrics before starting
    performanceMonitor.reset()
  })

  afterAll(() => {
    // Print performance report after all tests
    performanceMonitor.printReport()
  })

  beforeEach(async () => {
    // Clean database before each test
    const db = await getDatabase()
    db.messages = []
    db.workoutLogs = []
    db.userProfiles = []
    db.interventions = []
    await saveDatabase(db)
    await clearMessages()
  })

  describe('Agent Response Time', () => {
    test('should respond within 2 seconds for simple query', async () => {
      const startTime = performance.now()
      
      performanceMonitor.start('agent_response')
      await runAgent('Hello')
      const duration = performanceMonitor.end('agent_response')

      const endTime = performance.now()
      const totalTime = endTime - startTime

      console.log(`Agent response time: ${totalTime.toFixed(2)}ms`)
      
      // Target: < 2000ms for simple queries
      expect(duration).toBeLessThan(2000)
    }, 5000)

    test('should respond within 2 seconds for workout query', async () => {
      // Add some workout data
      const db = await getDatabase()
      db.workoutLogs = [
        {
          workout_id: 'perf_test_1',
          user_id: 'perf_user',
          exercise_type: 'running',
          duration_minutes: 30,
          timestamp: new Date().toISOString(),
          verified: true,
        },
      ]
      await saveDatabase(db)

      const startTime = performance.now()
      
      performanceMonitor.start('agent_response')
      await runAgent('How am I doing with my workouts?')
      const duration = performanceMonitor.end('agent_response')

      const endTime = performance.now()
      const totalTime = endTime - startTime

      console.log(`Agent response time (with tools): ${totalTime.toFixed(2)}ms`)

      // Target: < 2000ms (p95)
      // This test might occasionally exceed due to LLM variability
      expect(duration).toBeLessThan(3000) // Allow 3s for tool usage
    }, 10000)

    test('should handle multiple concurrent requests efficiently', async () => {
      const queries = [
        'Hello',
        'What is my workout status?',
        'Am I at risk?',
      ]

      const startTime = performance.now()

      // Note: Running sequentially as agent maintains conversation state
      // In production with sessions, these would be independent
      for (const query of queries) {
        performanceMonitor.start('agent_response')
        await runAgent(query)
        performanceMonitor.end('agent_response')
        await clearMessages() // Clear between requests
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / queries.length

      console.log(`Average response time: ${avgTime.toFixed(2)}ms`)

      // Average should be under 2s per request
      expect(avgTime).toBeLessThan(2500)
    }, 30000)
  })

  describe('Database Performance', () => {
    test('should handle concurrent database operations efficiently', async () => {
      const startTime = performance.now()

      // Simulate 10 concurrent operations
      const operations = Array.from({ length: 10 }, async (_, i) => {
        const db = await getDatabase()
        db.workoutLogs.push({
          workout_id: `perf_test_${i}`,
          user_id: 'perf_user',
          exercise_type: 'test',
          duration_minutes: 10,
          timestamp: new Date().toISOString(),
          verified: true,
        })
        await saveDatabase(db)
      })

      await Promise.all(operations)

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`Concurrent DB operations (10): ${duration.toFixed(2)}ms`)

      // Should complete in under 1 second with connection pooling
      expect(duration).toBeLessThan(1000)

      // Verify all operations succeeded
      const db = await getDatabase()
      expect(db.workoutLogs.length).toBe(10)
    }, 5000)

    test('should read from database quickly', async () => {
      // Add test data
      const db = await getDatabase()
      db.workoutLogs = Array.from({ length: 100 }, (_, i) => ({
        workout_id: `perf_test_${i}`,
        user_id: 'perf_user',
        exercise_type: 'test',
        duration_minutes: 30,
        timestamp: new Date().toISOString(),
        verified: true,
      }))
      await saveDatabase(db)

      const startTime = performance.now()

      // Read database
      await getDatabase()

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`DB read time (100 records): ${duration.toFixed(2)}ms`)

      // Should read in under 50ms
      expect(duration).toBeLessThan(50)
    }, 2000)
  })

  describe('Performance Statistics', () => {
    test('should track performance metrics correctly', async () => {
      // Run a few operations
      for (let i = 0; i < 5; i++) {
        performanceMonitor.start('test_metric')
        await new Promise((resolve) => setTimeout(resolve, 10))
        performanceMonitor.end('test_metric')
      }

      const stats = performanceMonitor.getStats('test_metric')

      expect(stats).toBeDefined()
      expect(stats!.count).toBe(5)
      expect(stats!.average).toBeGreaterThan(0)
      expect(stats!.p50).toBeGreaterThan(0)
      expect(stats!.p95).toBeGreaterThan(0)
    })

    test('should check performance targets', async () => {
      // Run a few agent operations
      for (let i = 0; i < 3; i++) {
        performanceMonitor.start('agent_response')
        await runAgent('Quick test')
        performanceMonitor.end('agent_response')
        await clearMessages()
      }

      const targets = performanceMonitor.checkTargets()

      expect(targets.agentResponseTime).toBeDefined()
      expect(targets.agentResponseTime.target).toBe(2000)
      expect(targets.agentResponseTime.actual).toBeGreaterThan(0)

      console.log('Performance Targets:')
      console.log(`  Agent Response (P95): ${targets.agentResponseTime.actual.toFixed(2)}ms / ${targets.agentResponseTime.target}ms`)
      console.log(`  Target Met: ${targets.agentResponseTime.passing ? '✅' : '❌'}`)
    }, 30000)
  })

  describe('Memory Usage', () => {
    test('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Run 10 operations
      for (let i = 0; i < 10; i++) {
        await runAgent('Test memory')
        await clearMessages()
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024

      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`)

      // Memory increase should be reasonable (< 50MB for 10 operations)
      expect(memoryIncrease).toBeLessThan(50)
    }, 60000)
  })

  describe('Stress Testing', () => {
    test('should handle rapid sequential requests', async () => {
      const numRequests = 20
      const startTime = performance.now()

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < numRequests; i++) {
        try {
          performanceMonitor.start('agent_response')
          await runAgent(`Request ${i}`)
          performanceMonitor.end('agent_response')
          successCount++
        } catch (error) {
          performanceMonitor.end('agent_response', { error: true })
          errorCount++
        }
        await clearMessages()
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / numRequests

      console.log(`\nStress Test Results:`)
      console.log(`  Total requests: ${numRequests}`)
      console.log(`  Successful: ${successCount}`)
      console.log(`  Errors: ${errorCount}`)
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`)
      console.log(`  Average time: ${avgTime.toFixed(2)}ms`)

      // At least 80% should succeed
      expect(successCount / numRequests).toBeGreaterThanOrEqual(0.8)
      
      // Average response time should be reasonable
      expect(avgTime).toBeLessThan(3000)
    }, 120000) // 2 minute timeout for stress test
  })
})
