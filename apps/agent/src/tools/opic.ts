import type { ToolDefinition, ToolFn } from '../types.js'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises'
import path from 'path'

export const logToOPICToolDefinition: ToolDefinition = {
  name: 'log_to_opic',
  description: 'Log agent decisions and metrics to OPIC for evaluation and transparency. Use this to track intervention decisions, reasoning chains, and outcomes.',
  parameters: {
    type: 'object',
    properties: {
      event_name: {
        type: 'string',
        description: 'Name of the event being logged (e.g., "drift_detected", "intervention_deployed")',
      },
      metrics: {
        type: 'object',
        description: 'Metrics and data associated with this event',
      },
      reasoning_chain: {
        type: 'string',
        description: 'Optional: The agent\'s reasoning process for this decision',
      },
    },
    required: ['event_name', 'metrics'],
  },
}

interface LogToOPICInput {
  event_name: string
  metrics: Record<string, any>
  reasoning_chain?: string
}

interface OPICLogEntry {
  log_id: string
  timestamp: string
  event_name: string
  metrics: Record<string, any>
  reasoning_chain?: string
}

const OPIC_LOG_FILE = './logs/opic.json'

export const logToOPIC: ToolFn<LogToOPICInput, string> = async (input) => {
  const { event_name, metrics, reasoning_chain } = input

  const log_entry: OPICLogEntry = {
    log_id: uuidv4(),
    timestamp: new Date().toISOString(),
    event_name,
    metrics,
    reasoning_chain,
  }

  // Ensure logs directory exists
  try {
    await fs.mkdir('./logs', { recursive: true })
  } catch (e) {
    // Directory might already exist
  }

  // Append to OPIC log file
  try {
    let logs: OPICLogEntry[] = []
    
    // Read existing logs
    try {
      const existingData = await fs.readFile(OPIC_LOG_FILE, 'utf-8')
      logs = JSON.parse(existingData)
    } catch (e) {
      // File doesn't exist yet, start with empty array
    }

    // Append new log
    logs.push(log_entry)

    // Write back to file
    await fs.writeFile(OPIC_LOG_FILE, JSON.stringify(logs, null, 2))

    console.log(`\n📊 [OPIC] Logged event: ${event_name}`)
    console.log(`   Metrics: ${JSON.stringify(metrics)}`)
    if (reasoning_chain) {
      console.log(`   Reasoning: ${reasoning_chain.substring(0, 100)}...`)
    }

  } catch (error) {
    console.error('Error writing to OPIC log:', error)
    return JSON.stringify({
      success: false,
      error: 'Failed to write to OPIC log',
      log_id: log_entry.log_id,
    })
  }

  return JSON.stringify({
    success: true,
    log_id: log_entry.log_id,
    timestamp: log_entry.timestamp,
    message: `Event "${event_name}" logged successfully`,
  })
}
