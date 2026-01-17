import type { ToolDefinition, ToolFn } from '../types.js'

export const analyzeCalendarToolDefinition: ToolDefinition = {
  name: 'analyze_calendar',
  description: 'Read user\'s calendar events to detect patterns, gaps, and drift signals. Returns workout history with completion status.',
  parameters: {
    type: 'object',
    properties: {
      days_back: {
        type: 'number',
        description: 'How many days back to analyze (default: 7)',
      },
      user_id: {
        type: 'string',
        description: 'User ID to analyze calendar for',
      },
    },
    required: ['user_id'],
  },
}

interface AnalyzeCalendarInput {
  days_back?: number
  user_id: string
}

interface CalendarAnalysisResult {
  events: Array<{
    date: string
    time: string
    title: string
    completed: boolean
    skipped_reason?: string
  }>
  drift_signals: Array<{
    signal: string
    severity: 'low' | 'medium' | 'high'
  }>
  completion_rate: number
  total_scheduled: number
  total_completed: number
  total_missed: number
  next_scheduled: string | null
}

export const analyzeCalendar: ToolFn<AnalyzeCalendarInput, string> = async (input) => {
  const { days_back = 7, user_id } = input

  // For hackathon MVP: Return mock data
  // TODO: Later integrate with Google Calendar API

  const today = new Date()
  const events = []

  // Generate realistic calendar data for the past week
  for (let i = days_back - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Assume gym scheduled Mon, Wed, Fri, Sat (4x/week)
    const dayOfWeek = date.getDay()
    const isScheduledDay = [1, 3, 5, 6].includes(dayOfWeek) // Mon, Wed, Fri, Sat

    if (isScheduledDay) {
      // Simulate realistic completion pattern with recent drift
      const completed = i > 2 ? Math.random() > 0.3 : Math.random() > 0.6

      events.push({
        date: date.toISOString().split('T')[0],
        time: '06:00 AM',
        title: `Gym - ${['Legs', 'Chest', 'Arms', 'Back'][Math.floor(Math.random() * 4)]}`,
        completed,
        skipped_reason: !completed ? (Math.random() > 0.5 ? 'Too tired' : 'Work conflict') : undefined,
      })
    }
  }

  const total_scheduled = events.length
  const total_completed = events.filter(e => e.completed).length
  const total_missed = total_scheduled - total_completed
  const completion_rate = total_scheduled > 0 ? total_completed / total_scheduled : 0

  // Detect drift signals
  const drift_signals = []

  // Check for consecutive missed workouts
  let consecutiveMissed = 0
  for (let i = events.length - 1; i >= 0; i--) {
    if (!events[i].completed) {
      consecutiveMissed++
    } else {
      break
    }
  }

  if (consecutiveMissed >= 2) {
    drift_signals.push({
      signal: `Missed ${consecutiveMissed} consecutive workouts`,
      severity: consecutiveMissed >= 3 ? 'high' : 'medium' as 'high' | 'medium',
    })
  }

  // Check for declining completion rate
  if (completion_rate < 0.5) {
    drift_signals.push({
      signal: `Low completion rate: ${Math.round(completion_rate * 100)}%`,
      severity: completion_rate < 0.3 ? 'high' : 'medium' as 'high' | 'medium',
    })
  }

  // Check for no future bookings (mock - assume no future bookings if user is drifting)
  if (completion_rate < 0.6) {
    drift_signals.push({
      signal: 'No workout scheduled for tomorrow',
      severity: 'medium' as 'medium',
    })
  }

  // Determine next scheduled workout
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDayOfWeek = tomorrow.getDay()
  const next_scheduled = [1, 3, 5, 6].includes(tomorrowDayOfWeek)
    ? `${tomorrow.toISOString().split('T')[0]} at 06:00 AM`
    : null

  const result: CalendarAnalysisResult = {
    events,
    drift_signals,
    completion_rate: Math.round(completion_rate * 100) / 100,
    total_scheduled,
    total_completed,
    total_missed,
    next_scheduled,
  }

  return JSON.stringify(result, null, 2)
}
