import type { ToolDefinition, ToolFn } from '../types.js'
import { v4 as uuidv4 } from 'uuid'

export const sendNudgeToolDefinition: ToolDefinition = {
  name: 'send_nudge',
  description: 'Send a motivational or reminder message to the user through their preferred channel (SMS, push, or email).',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to send nudge to',
      },
      message: {
        type: 'string',
        description: 'The message content to send',
      },
      channel: {
        type: 'string',
        enum: ['sms', 'push', 'email'],
        description: 'Delivery channel for the nudge',
      },
      urgency: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Urgency level of the nudge',
      },
    },
    required: ['user_id', 'message', 'channel'],
  },
}

interface SendNudgeInput {
  user_id: string
  message: string
  channel: 'sms' | 'push' | 'email'
  urgency?: 'low' | 'medium' | 'high'
}

interface NudgeResult {
  success: boolean
  message_id: string
  channel: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed'
  sent_at: string
  message_preview: string
}

export const sendNudge: ToolFn<SendNudgeInput, string> = async (input) => {
  const { user_id, message, channel, urgency = 'medium' } = input

  // For MVP: Log to console and simulate sending
  // TODO: Later integrate with Twilio for SMS/push, SendGrid for email

  const message_id = uuidv4()
  const sent_at = new Date().toISOString()

  console.log(`\n📱 [NUDGE - ${channel.toUpperCase()}] ${urgency.toUpperCase()} priority`)
  console.log(`To: User ${user_id}`)
  console.log(`Message: ${message}`)
  console.log(`Sent at: ${sent_at}\n`)

  const result: NudgeResult = {
    success: true,
    message_id,
    channel,
    delivery_status: 'sent',
    sent_at,
    message_preview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
  }

  return JSON.stringify(result, null, 2)
}
