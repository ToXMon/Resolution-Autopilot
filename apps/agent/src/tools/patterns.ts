import type { ToolDefinition, ToolFn, PatternAnalysis } from '../types.js'
import { getUserProfile } from '../memory.js'

export const detectPatternsToolDefinition: ToolDefinition = {
  name: 'detect_patterns',
  description: 'Analyze user behavior patterns to detect drift signals and assess failure risk. Returns structured assessment with confidence scores.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to analyze patterns for',
      },
      calendar_data: {
        type: 'string',
        description: 'Optional: JSON string of calendar analysis results to inform pattern detection',
      },
    },
    required: ['user_id'],
  },
}

export interface DetectPatternsInput {
  user_id: string
  calendar_data?: string
}

export const detectPatterns: ToolFn<DetectPatternsInput, string> = async (input) => {
  const { user_id, calendar_data } = input

  // Get user profile
  const userProfile = await getUserProfile(user_id)

  if (!userProfile) {
    return JSON.stringify({
      error: 'User profile not found',
      user_id,
    })
  }

  // Parse calendar data if provided
  let calendarAnalysis: any = null
  if (calendar_data) {
    try {
      calendarAnalysis = JSON.parse(calendar_data)
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Analyze patterns and detect drift
  const signals = []
  let drift_detected = false
  let confidence = 0
  let failure_risk: 'low' | 'medium' | 'high' = 'low'

  // Analyze calendar data
  if (calendarAnalysis) {
    const { completion_rate, drift_signals, total_missed } = calendarAnalysis

    // Add drift signals from calendar
    drift_signals.forEach((signal: any) => {
      signals.push({
        signal: signal.signal,
        severity: signal.severity,
        confidence: signal.severity === 'high' ? 0.9 : signal.severity === 'medium' ? 0.7 : 0.5,
      })
    })

    // Assess overall drift
    if (completion_rate < 0.5) {
      drift_detected = true
      confidence = 0.85
      failure_risk = 'high'
      
      signals.push({
        signal: `Completion rate dropped to ${Math.round(completion_rate * 100)}%`,
        severity: 'high' as 'high',
        confidence: 0.9,
      })
    } else if (completion_rate < 0.75 || total_missed >= 2) {
      drift_detected = true
      confidence = 0.65
      failure_risk = 'medium'
    }

    // Check for consecutive misses
    if (drift_signals.some((s: any) => s.signal.includes('consecutive'))) {
      drift_detected = true
      confidence = Math.max(confidence, 0.87)
      failure_risk = 'high'
    }
  } else {
    // No calendar data provided - conservative assessment
    drift_detected = false
    confidence = 0.3
    failure_risk = 'low'
    
    signals.push({
      signal: 'Insufficient data for pattern analysis',
      severity: 'low' as 'low',
      confidence: 0.3,
    })
  }

  // Determine recommended intervention based on user profile
  let recommended_intervention: 'calendar' | 'message' | 'financial' | 'social' | undefined

  if (drift_detected && userProfile) {
    const { intervention_preferences, past_interventions } = userProfile

    // Analyze past intervention effectiveness
    const effectivenessMap = past_interventions.reduce((acc: any, pi) => {
      acc[pi.type] = pi.effectiveness
      return acc
    }, {})

    // Find most effective intervention type
    let bestType = 'message'
    let bestEffectiveness = 0

    if (intervention_preferences.social && effectivenessMap.social > bestEffectiveness) {
      bestType = 'social'
      bestEffectiveness = effectivenessMap.social
    }
    if (intervention_preferences.calendar && effectivenessMap.calendar > bestEffectiveness) {
      bestType = 'calendar'
      bestEffectiveness = effectivenessMap.calendar
    }
    if (intervention_preferences.financial) {
      bestType = 'financial'
    }

    recommended_intervention = bestType as any
  }

  // Generate reasoning
  const reasoning = drift_detected
    ? `User shows ${failure_risk} drift risk with ${Math.round(confidence * 100)}% confidence. ` +
      `Detected ${signals.length} warning signals. ` +
      (calendarAnalysis 
        ? `Calendar shows ${Math.round(calendarAnalysis.completion_rate * 100)}% completion rate with ${calendarAnalysis.total_missed} missed workouts. `
        : '') +
      (recommended_intervention
        ? `Recommend ${recommended_intervention} intervention based on past effectiveness (${userProfile.past_interventions.find(pi => pi.type === recommended_intervention)?.effectiveness || 0}).`
        : 'Need more data to recommend intervention.')
    : 'No significant drift detected. User appears to be on track.'

  const result: PatternAnalysis = {
    drift_detected,
    confidence: Math.round(confidence * 100) / 100,
    signals,
    failure_risk,
    recommended_intervention,
    reasoning,
  }

  return JSON.stringify(result, null, 2)
}
