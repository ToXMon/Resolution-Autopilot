import type { ToolDefinition, ToolFn } from '../types.js'
import { v4 as uuidv4 } from 'uuid'
import twilio from 'twilio'

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

export interface SendNudgeInput {
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
  error?: string
}

/**
 * Send SMS using Twilio
 */
async function sendSMS(userId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const toNumber = process.env.TWILIO_TEST_TO_NUMBER // User's phone number (mock for now)

    if (!accountSid || !authToken || !fromNumber) {
      console.log('[Nudge] Twilio not configured, simulating SMS')
      return { success: true, messageId: `sim-${uuidv4()}` }
    }

    const client = twilio(accountSid, authToken)

    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber || '+10000000000', // Placeholder - will fail if not configured
    })

    return { success: true, messageId: twilioMessage.sid }
  } catch (error: any) {
    console.error('[Nudge] Twilio error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send push notification (placeholder for now)
 */
async function sendPushNotification(userId: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
  console.log('[Nudge] Push notifications not implemented yet, simulating')
  return { success: true, messageId: `push-${uuidv4()}` }
}

/**
 * Send email (placeholder for now)
 */
async function sendEmail(userId: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
  console.log('[Nudge] Email not implemented yet, simulating')
  return { success: true, messageId: `email-${uuidv4()}` }
}

export const sendNudge: ToolFn<SendNudgeInput, string> = async (input) => {
  const { user_id, message, channel, urgency = 'medium' } = input

  const sent_at = new Date().toISOString()

  console.log(`\n📱 [NUDGE - ${channel.toUpperCase()}] ${urgency.toUpperCase()} priority`)
  console.log(`To: User ${user_id}`)
  console.log(`Message: ${message}`)
  console.log(`Sent at: ${sent_at}\n`)

  let sendResult: { success: boolean; messageId?: string; error?: string }

  // Route to appropriate channel
  switch (channel) {
    case 'sms':
      sendResult = await sendSMS(user_id, message)
      break
    case 'push':
      sendResult = await sendPushNotification(user_id, message)
      break
    case 'email':
      sendResult = await sendEmail(user_id, message)
      break
    default:
      sendResult = { success: false, error: 'Unknown channel' }
  }

  const result: NudgeResult = {
    success: sendResult.success,
    message_id: sendResult.messageId || uuidv4(),
    channel,
    delivery_status: sendResult.success ? 'sent' : 'failed',
    sent_at,
    message_preview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
    error: sendResult.error,
  }

  return JSON.stringify(result, null, 2)
}
