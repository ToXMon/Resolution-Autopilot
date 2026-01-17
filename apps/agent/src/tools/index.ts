import type { ToolDefinition } from '../types.js'
import { analyzeCalendar, analyzeCalendarToolDefinition } from './calendar.js'
import { detectPatterns, detectPatternsToolDefinition } from './patterns.js'
import { bookIntervention, bookInterventionToolDefinition } from './intervention.js'
import { sendNudge, sendNudgeToolDefinition } from './nudge.js'
import { fetchSmartContract, fetchSmartContractToolDefinition } from './blockchain.js'
import { logToOPIC, logToOPICToolDefinition } from './opic.js'
import { logWorkout, logWorkoutToolDefinition, getWorkoutHistory, getWorkoutHistoryToolDefinition } from './workout.js'

// Export all tool definitions
export const toolDefinitions: ToolDefinition[] = [
  analyzeCalendarToolDefinition,
  detectPatternsToolDefinition,
  bookInterventionToolDefinition,
  sendNudgeToolDefinition,
  fetchSmartContractToolDefinition,
  logToOPICToolDefinition,
  logWorkoutToolDefinition,
  getWorkoutHistoryToolDefinition,
]

// Export all tool functions
export const tools = {
  analyze_calendar: analyzeCalendar,
  detect_patterns: detectPatterns,
  book_intervention: bookIntervention,
  send_nudge: sendNudge,
  fetch_smart_contract: fetchSmartContract,
  log_to_opic: logToOPIC,
  log_workout: logWorkout,
  get_workout_history: getWorkoutHistory,
}

export {
  analyzeCalendar,
  detectPatterns,
  bookIntervention,
  sendNudge,
  fetchSmartContract,
  logToOPIC,
  logWorkout,
  getWorkoutHistory,
}
