import type { AIMessage } from './types.js'
import { addMessages, getMessages, saveToolResponse } from './memory.js'
import { runLLM } from './llm.js'
import { runTool } from './toolRunner.js'
import { showLoader, logMessage } from './ui.js'
import { toolDefinitions } from './tools/index.js'

/**
 * Main agent loop following Scott Morris pattern
 * 
 * The agent keeps looping until it returns a final text response (no more tool calls)
 */
export const runAgent = async (
  userMessage: string
): Promise<AIMessage[]> => {
  // 1. Add user message to conversation history
  await addMessages({ role: 'user', content: userMessage })
  logMessage({ role: 'user', content: userMessage })

  // 2. Main agent loop
  const loader = showLoader('Thinking...')
  let iterations = 0
  const MAX_ITERATIONS = 10 // Prevent infinite loops

  try {
    while (iterations < MAX_ITERATIONS) {
      iterations++

      // Get full conversation history
      const history = await getMessages()

      // Call LLM with tools
      loader.text = 'Analyzing patterns...'
      const response = await runLLM(history, toolDefinitions)

      // If LLM has final answer (no tool calls)
      if (response.content && (!response.toolCalls || response.toolCalls.length === 0)) {
        loader.succeed('Agent completed')
        logMessage(response)
        await addMessages(response)
        return history
      }

      // If LLM wants to use tools
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Log the assistant's decision to call tools
        await addMessages({
          role: 'assistant',
          content: response.content || '',
          toolCalls: response.toolCalls,
        })
        logMessage(response)

        // Execute each tool call
        for (const toolCall of response.toolCalls) {
          loader.text = `Executing: ${toolCall.function.name}...`
          
          const toolResult = await runTool(toolCall, userMessage)
          await saveToolResponse(toolCall.id, toolResult)
          
          logMessage({
            role: 'tool',
            content: toolResult,
            toolCallId: toolCall.id,
          })
        }

        // Loop back: LLM now has tool results, can decide next step
        continue
      }

      // If we get here, something unexpected happened
      loader.warn('Unexpected response format')
      break
    }

    if (iterations >= MAX_ITERATIONS) {
      loader.fail(`Agent reached maximum iterations (${MAX_ITERATIONS})`)
      return await getMessages()
    }

    loader.succeed('Agent completed')
    return await getMessages()

  } catch (error: any) {
    loader.fail('Agent error')
    console.error('Agent error:', error)
    throw error
  }
}

export default runAgent
