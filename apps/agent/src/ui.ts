import ora, { Ora } from 'ora'
import chalk from 'chalk'
import type { AIMessage } from './types.js'

// Loading spinner utilities
export const showLoader = (text: string): Ora => {
  return ora({
    text,
    color: 'cyan',
  }).start()
}

// Log messages with color coding
export const logMessage = (message: AIMessage): void => {
  const { role, content, toolCalls } = message

  switch (role) {
    case 'user':
      break

    case 'assistant':
      if (toolCalls && toolCalls.length > 0) {
        toolCalls.forEach((toolCall: any) => {
            chalk.yellow(`⚙️  Calling tool: ${toolCall.function.name}`)
          )
            chalk.gray(`   Arguments: ${toolCall.function.arguments}`)
          )
        })
      } else if (content) {
      }
      break

    case 'tool':
      // Pretty print JSON if possible
      try {
        const parsed = JSON.parse(content)
      } catch {
      }
      break

    case 'system':
      break
  }
}

// Log tool execution
export const logToolExecution = (
  toolName: string,
  duration: number,
  success: boolean
): void => {
  const icon = success ? '✓' : '✗'
  const color = success ? chalk.green : chalk.red
}

// Log agent decisions for OPIC
export interface AgentDecision {
  timestamp: string
  thought: string
  action: string
  observation: string
  decision: string
}

export const logAgentDecision = (decision: AgentDecision): void => {
}

// Display welcome banner
export const showWelcomeBanner = (): void => {
    chalk.bold.cyan('  Resolution Autopilot - AI Behavioral Coach')
  )
    chalk.gray(
      '  Preventing resolution failure through AI-powered intervention\n'
    )
  )
}

// Display error
export const logError = (error: Error): void => {
  console.error(chalk.red.bold('\n❌ Error:'))
  console.error(chalk.red(error.message))
  if (error.stack) {
    console.error(chalk.gray(error.stack))
  }
}
