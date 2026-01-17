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
      console.log('\n' + chalk.cyan.bold('👤 User'))
      console.log(chalk.cyan(content))
      break

    case 'assistant':
      console.log('\n' + chalk.green.bold('🤖 ResolutionGuard'))
      if (toolCalls && toolCalls.length > 0) {
        toolCalls.forEach((toolCall: any) => {
          console.log(
            chalk.yellow(`⚙️  Calling tool: ${toolCall.function.name}`)
          )
          console.log(
            chalk.gray(`   Arguments: ${toolCall.function.arguments}`)
          )
        })
      } else if (content) {
        console.log(chalk.green(content))
      }
      break

    case 'tool':
      console.log(chalk.yellow.bold('⚙️  Tool Response'))
      // Pretty print JSON if possible
      try {
        const parsed = JSON.parse(content)
        console.log(chalk.gray(JSON.stringify(parsed, null, 2)))
      } catch {
        console.log(chalk.gray(content))
      }
      break

    case 'system':
      console.log(chalk.magenta.bold('⚙️  System'))
      console.log(chalk.magenta(content))
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
  console.log(color(`${icon} ${toolName} completed in ${duration}ms`))
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
  console.log('\n' + chalk.cyan.bold('🧠 Agent Reasoning Chain'))
  console.log(chalk.gray('─'.repeat(50)))
  console.log(chalk.cyan('THOUGHT'))
  console.log(chalk.white(decision.thought))
  console.log(chalk.cyan('\nACTION'))
  console.log(chalk.yellow(decision.action))
  console.log(chalk.cyan('\nOBSERVATION'))
  console.log(chalk.white(decision.observation))
  console.log(chalk.cyan('\nDECISION'))
  console.log(chalk.green(decision.decision))
  console.log(chalk.gray('─'.repeat(50)))
}

// Display welcome banner
export const showWelcomeBanner = (): void => {
  console.log(chalk.bold.cyan('\n' + '='.repeat(60)))
  console.log(
    chalk.bold.cyan('  Resolution Autopilot - AI Behavioral Coach')
  )
  console.log(chalk.bold.cyan('='.repeat(60)))
  console.log(
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
