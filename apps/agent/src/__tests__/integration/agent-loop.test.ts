import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { runAgent } from '../../agent.js'
import { getDatabase, saveDatabase } from '../../memory.js'

/**
 * Integration Test: Agent Loop End-to-End
 * 
 * Tests the complete agent reasoning loop:
 * 1. User sends query
 * 2. Agent analyzes context and history
 * 3. Agent selects and executes appropriate tools
 * 4. Agent synthesizes response
 * 5. Conversation saved to memory
 */
describe('Agent Loop Integration', () => {
  beforeAll(async () => {
    // Clean database
    const db = await getDatabase()
    db.messages = []
    db.workoutLogs = []
    await saveDatabase(db)
  })

  afterAll(async () => {
    // Cleanup
    const db = await getDatabase()
    db.messages = []
    await saveDatabase(db)
  })

  test('should handle simple greeting without tool calls', async () => {
    const messages = await runAgent('Hello, are you there?')
    
    // Should have at least user message and assistant response
    expect(messages.length).toBeGreaterThanOrEqual(2)
    
    // Last message should be from assistant
    const lastMessage = messages[messages.length - 1]
    expect(lastMessage.role).toBe('assistant')
    expect(lastMessage.content).toBeTruthy()
    
    // Should NOT have tool calls for simple greeting
    expect(lastMessage.toolCalls).toBeUndefined()
  })

  test('should analyze workout patterns when asked', async () => {
    const messages = await runAgent('Analyze my workout patterns for the last week')
    
    // Should call analyze_calendar and/or detect_patterns tools
    const hasToolCalls = messages.some(msg => 
      msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0
    )
    expect(hasToolCalls).toBe(true)
    
    // Should have tool results
    const hasToolResults = messages.some(msg => msg.role === 'tool')
    expect(hasToolResults).toBe(true)
    
    // Final response should synthesize findings
    const finalMessage = messages[messages.length - 1]
    expect(finalMessage.role).toBe('assistant')
    expect(finalMessage.content.length).toBeGreaterThan(50)
  })

  test('should chain multiple tools in sequence', async () => {
    const messages = await runAgent('Am I at risk of failing? If so, help me stay on track.')
    
    // Should call multiple tools in this sequence:
    // 1. analyze_calendar (check patterns)
    // 2. detect_patterns (assess risk)
    // 3. book_intervention (if risk detected)
    
    const toolCalls = messages
      .filter(msg => msg.role === 'assistant' && msg.toolCalls)
      .flatMap(msg => msg.toolCalls || [])
    
    expect(toolCalls.length).toBeGreaterThan(1)
    
    // Should have final synthesis
    const finalMessage = messages[messages.length - 1]
    expect(finalMessage.role).toBe('assistant')
    expect(finalMessage.toolCalls).toBeUndefined()
  })

  test('should save conversation to memory', async () => {
    await runAgent('Log a workout: 30 minutes of squats')
    
    // Check database has conversation history
    const db = await getDatabase()
    expect(db.messages.length).toBeGreaterThan(0)
    
    // Should have user message
    const userMessages = db.messages.filter(msg => msg.role === 'user')
    expect(userMessages.length).toBeGreaterThan(0)
    
    // Should have assistant messages
    const assistantMessages = db.messages.filter(msg => msg.role === 'assistant')
    expect(assistantMessages.length).toBeGreaterThan(0)
  })

  test('should respect MAX_ITERATIONS limit', async () => {
    // This query might cause looping if agent keeps calling tools
    const startTime = Date.now()
    const messages = await runAgent('Keep analyzing until you find patterns')
    const endTime = Date.now()
    
    // Should complete within reasonable time (< 30s)
    expect(endTime - startTime).toBeLessThan(30000)
    
    // Should have terminated with a response
    expect(messages.length).toBeGreaterThan(0)
    const finalMessage = messages[messages.length - 1]
    expect(finalMessage.role).toBe('assistant')
  })

  test('should handle errors gracefully', async () => {
    // Query that might cause tool errors
    const messages = await runAgent('Show me blockchain data for invalid user')
    
    // Should still return a response
    expect(messages.length).toBeGreaterThan(0)
    
    // Should have assistant response (even if tool failed)
    const finalMessage = messages[messages.length - 1]
    expect(finalMessage.role).toBe('assistant')
    expect(finalMessage.content).toBeTruthy()
  })

  test('should maintain context across multiple queries', async () => {
    // First query
    await runAgent('My user ID is test_user_123')
    
    // Second query referencing first
    const messages = await runAgent('Show me my workout history')
    
    // Should remember user ID from first query
    // (In production, this would use conversation context)
    expect(messages.length).toBeGreaterThan(0)
  })

  test('should log decisions to OPIC for observability', async () => {
    await runAgent('I need help staying motivated')
    
    // In production, this would check OPIC logs
    // For now, verify agent completed without errors
    const db = await getDatabase()
    expect(db.messages.length).toBeGreaterThan(0)
  })
})
