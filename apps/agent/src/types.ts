import { z } from 'zod'

// Message types for agent conversation
export const AIMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'tool', 'system']),
  content: z.string(),
  toolCallId: z.string().optional(),
  toolCalls: z.array(z.any()).optional(),
})

export type AIMessage = z.infer<typeof AIMessageSchema>

export const MessageWithMetadataSchema = AIMessageSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
})

export type MessageWithMetadata = z.infer<typeof MessageWithMetadataSchema>

// User profile schema
export const InterventionPreferencesSchema = z.object({
  social: z.boolean().default(true),
  financial: z.boolean().default(true),
  calendar: z.boolean().default(true),
})

export const PastInterventionSchema = z.object({
  type: z.string(),
  effectiveness: z.number().min(0).max(1),
  timestamp: z.string().datetime(),
})

export const UserProfileSchema = z.object({
  user_id: z.string(),
  resolution: z.string(),
  start_date: z.string().datetime(),
  stake_amount: z.number().positive(),
  intervention_preferences: InterventionPreferencesSchema,
  past_interventions: z.array(PastInterventionSchema).default([]),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// Intervention schema
export const InterventionSchema = z.object({
  intervention_id: z.string().uuid(),
  user_id: z.string(),
  type: z.enum(['calendar', 'message', 'financial', 'social']),
  triggered_by: z.string(),
  deployed_at: z.string().datetime(),
  outcome: z.enum(['success', 'skipped', 'failed', 'pending']).default('pending'),
  user_feedback: z.string().optional(),
  effectiveness_score: z.number().min(0).max(1).optional(),
})

export type Intervention = z.infer<typeof InterventionSchema>

// Calendar event schema
export const CalendarEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string(),
  title: z.string(),
  completed: z.boolean(),
  skipped_reason: z.string().optional(),
})

export type CalendarEvent = z.infer<typeof CalendarEventSchema>

// Pattern detection results
export const DriftSignalSchema = z.object({
  signal: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
})

export const PatternAnalysisSchema = z.object({
  drift_detected: z.boolean(),
  confidence: z.number().min(0).max(1),
  signals: z.array(DriftSignalSchema),
  failure_risk: z.enum(['low', 'medium', 'high']),
  recommended_intervention: z.enum(['calendar', 'message', 'financial', 'social']).optional(),
  reasoning: z.string(),
})

export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>

// Database schema
export const DatabaseSchema = z.object({
  messages: z.array(MessageWithMetadataSchema).default([]),
  userProfiles: z.array(UserProfileSchema).default([]),
  interventions: z.array(InterventionSchema).default([]),
})

export type Database = z.infer<typeof DatabaseSchema>

// Tool function type
export type ToolFn<TInput, TOutput> = (input: TInput) => Promise<TOutput>

// Tool definition type
export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}
