import OpenAI from 'openai'
import type { AIMessage, ToolDefinition } from './types.js'
import { systemPrompt } from './systemPrompt.js'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

export const runLLM = async (
  messages: AIMessage[],
  tools: ToolDefinition[]
): Promise<any> => {
  try {
    // Build messages array with system prompt
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((msg) => {
        if (msg.role === 'tool') {
          return {
            role: 'tool' as const,
            content: msg.content,
            tool_call_id: msg.toolCallId!,
          }
        }
        return {
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          ...(msg.toolCalls ? { tool_calls: msg.toolCalls } : {}),
        }
      }),
    ]

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      tools: tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      })),
      tool_choice: 'auto',
      temperature: 0.1, // Deterministic reasoning
      max_tokens: 2000,
    })

    const choice = response.choices[0]
    const message = choice.message

    // Return the assistant's message
    return {
      role: 'assistant',
      content: message.content || '',
      toolCalls: message.tool_calls || [],
    }
  } catch (error: any) {
    console.error('LLM Error:', error.message)
    throw new Error(`Failed to call LLM: ${error.message}`)
  }
}
