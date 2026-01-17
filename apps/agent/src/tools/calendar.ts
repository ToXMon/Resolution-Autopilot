import type { ToolDefinition, ToolFn } from '../types.js'
import { google } from 'googleapis'

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

/**
 * Fetch real calendar events from Google Calendar API
 * Requires OAuth2 credentials or API key
 */
async function fetchGoogleCalendarEvents(userId: string, daysBack: number): Promise<any[]> {
  try {
    // Check if Google Calendar API credentials are available
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
    
    if (!apiKey && !clientId) {
      console.log('[Calendar] Google Calendar API not configured, using mock data')
      return []
    }

    // Initialize Google Calendar API
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error) {
    console.error('[Calendar] Error fetching Google Calendar:', error)
    return []
  }
}

export const analyzeCalendar: ToolFn<AnalyzeCalendarInput, string> = async (input) => {
  const { days_back = 7, user_id } = input

  // Try to fetch real calendar events
  const googleEvents = await fetchGoogleCalendarEvents(user_id, days_back)
  
  const today = new Date()
  const events = []

  // If Google Calendar is available, use real data
  if (googleEvents.length > 0) {
    for (const event of googleEvents) {
      // Filter for workout-related events
      const title = event.summary || ''
      const isWorkoutRelated = /gym|workout|exercise|fitness|training|run|yoga|crossfit/i.test(title)
      
      if (isWorkoutRelated) {
        const startDate = event.start?.dateTime || event.start?.date
        if (startDate) {
          const eventDate = new Date(startDate)
          const isPast = eventDate < today
          const isCancelled = event.status === 'cancelled'
          
          events.push({
            date: eventDate.toISOString().split('T')[0],
            time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            title: title,
            completed: isPast && !isCancelled && event.status === 'confirmed',
            skipped_reason: isCancelled ? 'Cancelled' : undefined,
          })
        }
      }
    }
  }

  // If no real events or API not configured, use mock data
  if (events.length === 0) {
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
