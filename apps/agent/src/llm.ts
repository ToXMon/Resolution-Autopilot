import type { AIMessage, ToolDefinition } from './types.js'
import { systemPrompt } from './systemPrompt.js'

// LLM Provider configuration
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'venice' // 'venice' or 'gemini'
const VENICE_API_KEY = process.env.VENICE_API_KEY
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1'
const VENICE_MODEL = process.env.VENICE_MODEL || 'llama-3.3-70b'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro'

/**
 * Unified LLM runner supporting Venice AI and Google Gemini
 */
export const runLLM = async (
  messages: AIMessage[],
  tools: ToolDefinition[]
): Promise<any> => {
  try {
    if (LLM_PROVIDER === 'venice') {
      return await runVeniceLLM(messages, tools)
    } else if (LLM_PROVIDER === 'gemini') {
      return await runGeminiLLM(messages, tools)
    } else {
      throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`)
    }
  } catch (error: any) {
    console.error('LLM Error:', error.message)
    throw new Error(`Failed to call LLM: ${error.message}`)
  }
}

/**
 * Venice AI implementation
 * Uses OpenAI-compatible API format
 */
async function runVeniceLLM(
  messages: AIMessage[],
  tools: ToolDefinition[]
): Promise<any> {
  if (!VENICE_API_KEY) {
    throw new Error('VENICE_API_KEY is required when using Venice AI provider')
  }

  // Build messages array with system prompt
  const chatMessages = [
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

  // Venice AI uses OpenAI-compatible format
  const response = await fetch(`${VENICE_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VENICE_API_KEY}`,
    },
    body: JSON.stringify({
      model: VENICE_MODEL,
      messages: chatMessages,
      tools: tools.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      })),
      tool_choice: 'auto',
      temperature: 0.1,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Venice AI API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const choice = data.choices[0]
  const message = choice.message

  return {
    role: 'assistant',
    content: message.content || '',
    toolCalls: message.tool_calls || [],
  }
}

/**
 * Google Gemini implementation
 */
async function runGeminiLLM(
  messages: AIMessage[],
  tools: ToolDefinition[]
): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required when using Gemini provider')
  }

  // Convert messages to Gemini format
  const contents = []
  
  // Add system prompt as first user message with model response
  contents.push({
    role: 'user',
    parts: [{ text: `System Instructions: ${systemPrompt}` }],
  })
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I will follow these instructions.' }],
  })

  // Add conversation history
  for (const msg of messages) {
    if (msg.role === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: msg.content }],
      })
    } else if (msg.role === 'assistant') {
      const parts: any[] = []
      
      if (msg.content) {
        parts.push({ text: msg.content })
      }
      
      // Handle tool calls
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        for (const toolCall of msg.toolCalls) {
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments),
            },
          })
        }
      }
      
      if (parts.length > 0) {
        contents.push({
          role: 'model',
          parts,
        })
      }
    } else if (msg.role === 'tool') {
      // Add tool response
      contents.push({
        role: 'function',
        parts: [{
          functionResponse: {
            name: msg.toolCallId,
            response: JSON.parse(msg.content),
          },
        }],
      })
    }
  }

  // Convert tools to Gemini format
  const geminiTools = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties: tool.parameters.properties,
      required: tool.parameters.required,
    },
  }))

  // Call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        tools: geminiTools.length > 0 ? [{ functionDeclarations: geminiTools }] : undefined,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const candidate = data.candidates[0]
  const content = candidate.content

  // Extract text and tool calls
  let textContent = ''
  const toolCalls: any[] = []

  for (const part of content.parts) {
    if (part.text) {
      textContent += part.text
    }
    if (part.functionCall) {
      toolCalls.push({
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'function',
        function: {
          name: part.functionCall.name,
          arguments: JSON.stringify(part.functionCall.args),
        },
      })
    }
  }

  return {
    role: 'assistant',
    content: textContent,
    toolCalls,
  }
}
