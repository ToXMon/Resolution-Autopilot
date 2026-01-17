import type { ToolDefinition, ToolFn } from '../types.js'
import { v4 as uuidv4 } from 'uuid'
import { logIntervention } from '../memory.js'

export const bookInterventionToolDefinition: ToolDefinition = {
  name: 'book_intervention',
  description: 'Deploy an intervention to prevent resolution failure. Can book calendar events, send reminders, or trigger financial nudges.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to deploy intervention for',
      },
      type: {
        type: 'string',
        enum: ['calendar', 'message', 'financial', 'social'],
        description: 'Type of intervention to deploy',
      },
      details: {
        type: 'object',
        description: 'Intervention-specific details (e.g., time for calendar booking, message content, etc.)',
      },
    },
    required: ['user_id', 'type', 'details'],
  },
}

export interface BookInterventionInput {
  user_id: string
  type: 'calendar' | 'message' | 'financial' | 'social'
  details: Record<string, any>
}

interface InterventionResult {
  success: boolean
  intervention_id: string
  type: string
  deployed_at: string
  details: Record<string, any>
  message: string
}

export const bookIntervention: ToolFn<BookInterventionInput, string> = async (input) => {
  const { user_id, type, details } = input

  const intervention_id = uuidv4()
  const deployed_at = new Date().toISOString()

  // Log intervention to database
  await logIntervention({
    intervention_id,
    user_id,
    type,
    triggered_by: 'pattern_detection',
    deployed_at,
    outcome: 'pending',
  })

  let result: InterventionResult

  switch (type) {
    case 'calendar':
      // For MVP: Simulate calendar booking
      // TODO: Later integrate with Google Calendar API
      result = {
        success: true,
        intervention_id,
        type: 'calendar',
        deployed_at,
        details: {
          event_title: details.event_title || 'Gym Workout',
          time: details.time || '6:00 AM',
          date: details.date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          uber_booking: details.book_uber ? 'Uber booked for 5:45 AM' : null,
        },
        message: `Calendar intervention deployed: ${details.event_title || 'Workout'} scheduled for ${details.time || '6:00 AM'}`,
      }
      break

    case 'message':
      // Simple message intervention
      result = {
        success: true,
        intervention_id,
        type: 'message',
        deployed_at,
        details: {
          message_content: details.message_content || 'Time to get back on track! Your goals are waiting.',
          delivery_channel: details.channel || 'push',
        },
        message: 'Message intervention deployed',
      }
      break

    case 'financial':
      // Financial stake reminder
      result = {
        success: true,
        intervention_id,
        type: 'financial',
        deployed_at,
        details: {
          stake_amount: details.stake_amount || 100,
          at_risk_amount: details.at_risk_amount || 20,
          message: `Your $${details.stake_amount || 100} commitment is at risk. Complete today's workout to stay on track.`,
        },
        message: 'Financial accountability intervention deployed',
      }
      break

    case 'social':
      // Social accountability
      result = {
        success: true,
        intervention_id,
        type: 'social',
        deployed_at,
        details: {
          accountability_buddy: details.buddy_name || 'accountability buddy',
          message: details.message || 'Your accountability buddy has been notified. They\'re counting on you!',
          notification_sent: true,
        },
        message: 'Social accountability intervention deployed',
      }
      break

    default:
      result = {
        success: false,
        intervention_id,
        type: 'unknown',
        deployed_at,
        details: {},
        message: `Unknown intervention type: ${type}`,
      }
  }

  return JSON.stringify(result, null, 2)
}
