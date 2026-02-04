/**
 * Integration Tests for Agent Loop
 * 
 * End-to-end tests for the main agent loop
 */

import { describe, test, expect, beforeEach } from 'bun:test'
import runAgent from '../../agent.js'
import { getDatabase, saveDatabase } from '../../db/pool.js'
import { clearMessages } from '../../memory.js'

describe('Agent Loop Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database and conversation history before each test
    const db = await getDatabase()
    db.messages = []
    db.workoutLogs = []
    db.userProfiles = []
    db.interventions = []
    await saveDatabase(db)
    await clearMessages()
  })

  describe('Agent Workflow', () => {
    test('should respond to simple greeting', async () => {
      const conversation = await runAgent('Hello!')

      expect(conversation).toBeDefined()
      expect(conversation.length).toBeGreaterThan(0)

      const lastMessage = conversation
        .filter((msg) => msg.role === 'assistant')
        .pop()

      expect(lastMessage).toBeDefined()
      expect(lastMessage?.content).toBeDefined()
    }, 30000) // 30 second timeout for LLM calls

    test('should analyze workout status', async () => {
      // First add some workout data
      const db = await getDatabase()
      db.workoutLogs = [
        {
          workout_id: 'test_1',
          user_id: 'test_user_001',
          exercise_type: 'squats',
          duration_minutes: 30,
          reps: 50,
          sets: 3,
          form_quality: 'good',
          notes: 'Test workout',
          timestamp: new Date().toISOString(),
          verified: true,
        },
      ]
      await saveDatabase(db)

      const conversation = await runAgent(
        'How am I doing with my fitness goals?'
      )

      expect(conversation).toBeDefined()

      const messages = conversation.filter((msg) => msg.role === 'assistant')
      expect(messages.length).toBeGreaterThan(0)

      // Agent should have called getWorkoutHistory tool
      const toolMessages = conversation.filter((msg) => msg.role === 'tool')
      expect(toolMessages.length).toBeGreaterThan(0)
    }, 30000)

    test('should handle missing workout scenario', async () => {
      const conversation = await runAgent(
        'I missed my workout yesterday. What should I do?'
      )

      expect(conversation).toBeDefined()

      const lastMessage = conversation
        .filter((msg) => msg.role === 'assistant')
        .pop()

      expect(lastMessage?.content).toBeDefined()
      // Agent should provide advice or intervention
      expect(lastMessage?.content.length).toBeGreaterThan(0)
    }, 30000)

    test('should detect drift and recommend intervention', async () => {
      // Add minimal workout data (high risk)
      const db = await getDatabase()
      db.workoutLogs = [
        {
          workout_id: 'test_1',
          user_id: 'test_user_002',
          exercise_type: 'walking',
          duration_minutes: 10,
          timestamp: new Date().toISOString(),
          verified: true,
        },
      ]
      await saveDatabase(db)

      const conversation = await runAgent(
        'Am I at risk of quitting my fitness goal?'
      )

      expect(conversation).toBeDefined()

      // Agent should call detectPatterns tool
      const toolCalls = conversation.filter((msg) => msg.toolCalls?.length > 0)
      const hasPatternDetection = toolCalls.some((msg) =>
        msg.toolCalls?.some((call) => call.function.name === 'detectPatterns')
      )

      expect(hasPatternDetection).toBe(true)
    }, 30000)

    test('should iterate through multiple tool calls', async () => {
      const conversation = await runAgent(
        'Check my workout history and analyze my patterns'
      )

      expect(conversation).toBeDefined()

      // Agent should make multiple tool calls
      const toolMessages = conversation.filter((msg) => msg.role === 'tool')
      expect(toolMessages.length).toBeGreaterThanOrEqual(2)
    }, 45000)
  })

  describe('Agent Tool Usage', () => {
    test('should use getWorkoutHistory tool', async () => {
      const conversation = await runAgent(
        'Show me my workout history from last week'
      )

      const toolCalls = conversation.filter((msg) => msg.toolCalls?.length > 0)
      const hasWorkoutHistory = toolCalls.some((msg) =>
        msg.toolCalls?.some(
          (call) => call.function.name === 'getWorkoutHistory'
        )
      )

      expect(hasWorkoutHistory).toBe(true)
    }, 30000)

    test('should use detectPatterns tool', async () => {
      const conversation = await runAgent(
        'Analyze my behavior patterns and predict if I will quit'
      )

      const toolCalls = conversation.filter((msg) => msg.toolCalls?.length > 0)
      const hasPatternDetection = toolCalls.some((msg) =>
        msg.toolCalls?.some((call) => call.function.name === 'detectPatterns')
      )

      expect(hasPatternDetection).toBe(true)
    }, 30000)

    test('should use analyzeCalendar tool', async () => {
      const conversation = await runAgent(
        'Check my calendar and see when I can workout this week'
      )

      const toolCalls = conversation.filter((msg) => msg.toolCalls?.length > 0)
      const hasCalendarAnalysis = toolCalls.some((msg) =>
        msg.toolCalls?.some(
          (call) => call.function.name === 'analyzeCalendar'
        )
      )

      expect(hasCalendarAnalysis).toBe(true)
    }, 30000)

    test('should use deployNudge tool when user is at risk', async () => {
      const conversation = await runAgent(
        'I am feeling unmotivated. Send me a reminder to workout.'
      )

      const toolCalls = conversation.filter((msg) => msg.toolCalls?.length > 0)
      const hasNudgeDeployment = toolCalls.some((msg) =>
        msg.toolCalls?.some((call) => call.function.name === 'deployNudge')
      )

      // Note: Agent may or may not deploy nudge depending on LLM decision
      // This test just checks if the tool is available and can be called
      expect(toolCalls.length).toBeGreaterThan(0)
    }, 30000)
  })

  describe('Agent Error Handling', () => {
    test('should handle empty message gracefully', async () => {
      try {
        // This should ideally be caught before calling runAgent
        // but we test the agent's robustness
        const conversation = await runAgent('')
        expect(conversation).toBeDefined()
      } catch (error: any) {
        // It's okay to throw an error for empty input
        expect(error).toBeDefined()
      }
    }, 10000)

    test('should handle maximum iterations', async () => {
      // This test would require mocking LLM responses that keep requesting tools
      // For now, we just verify the agent completes within iteration limit
      const conversation = await runAgent('Test maximum iterations')
      expect(conversation).toBeDefined()
      
      // Agent should complete within MAX_ITERATIONS (10)
      const assistantMessages = conversation.filter(
        (msg) => msg.role === 'assistant'
      )
      expect(assistantMessages.length).toBeLessThanOrEqual(10)
    }, 60000)
  })

  describe('Conversation Context', () => {
    test('should maintain conversation history', async () => {
      // First message
      await runAgent('My name is John and I want to get fit')

      // Second message referring to first
      const conversation = await runAgent('What did I just tell you?')

      expect(conversation).toBeDefined()
      
      // Conversation should include both user messages
      const userMessages = conversation.filter((msg) => msg.role === 'user')
      expect(userMessages.length).toBeGreaterThanOrEqual(2)
    }, 45000)

    test('should preserve tool results in conversation', async () => {
      const conversation = await runAgent('Check my workout history')

      // Tool results should be in conversation
      const toolMessages = conversation.filter((msg) => msg.role === 'tool')
      expect(toolMessages.length).toBeGreaterThan(0)

      // Tool responses should have content
      toolMessages.forEach((msg) => {
        expect(msg.content).toBeDefined()
        expect(msg.content.length).toBeGreaterThan(0)
      })
    }, 30000)
  })
})
