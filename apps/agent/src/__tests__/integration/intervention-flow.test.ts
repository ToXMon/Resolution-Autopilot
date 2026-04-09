import { describe, test, expect, beforeEach } from 'bun:test'
import { detectPatterns } from '../../tools/patterns.js'
import { bookIntervention } from '../../tools/intervention.js'
import { sendNudge } from '../../tools/nudge.js'
import { getDatabase, saveDatabase } from '../../memory.js'
import { saveUserProfile, updateInterventionOutcome, getInterventions } from '../../memory.js'
import type { UserProfile } from '../../types.js'

/**
 * Integration Test: Complete Intervention Flow
 * 
 * This test suite verifies the autonomous intervention system:
 * 1. Pattern Detection: Agent detects drift signals from user behavior
 * 2. Intervention Deployment: Agent books appropriate intervention (calendar/social/financial)
 * 3. Nudge Delivery: Agent sends timely nudges to user
 * 4. Outcome Tracking: System records user response and escalates if needed
 * 
 * Production Flow:
 * - Agent runs detectPatterns() daily to analyze calendar/workout data
 * - On drift detection → agent calls bookIntervention() with recommended type
 * - Intervention triggers sendNudge() to user via SMS/push/email
 * - User response updates intervention outcome → informs future ML recommendations
 * - Failed interventions → escalate to higher-stakes intervention type
 */
describe('Intervention Flow Integration', () => {
  const TEST_USER = 'intervention_test_user_001'

  beforeEach(async () => {
    // Clean database before each test
    const db = await getDatabase()
    db.workoutLogs = []
    db.messages = []
    db.interventions = []
    db.userProfiles = []
    await saveDatabase(db)
  })

  /**
   * Scenario 1: User misses 2 consecutive workouts
   * Expected: Detect drift → Deploy calendar intervention → Send reminder nudge
   */
  test('should detect drift after 2 missed workouts and book calendar intervention', async () => {
    // Step 1: Setup user profile
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      stake_amount: 100,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: true,
      },
      past_interventions: [
        {
          type: 'calendar',
          effectiveness: 0.85, // Calendar worked well in the past
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }
    await saveUserProfile(userProfile)

    // Step 2: Simulate calendar data showing 2 consecutive misses
    const calendarData = {
      completion_rate: 0.5, // 50% completion
      total_missed: 2,
      drift_signals: [
        {
          signal: '2 consecutive workouts missed (Mon, Wed)',
          severity: 'medium',
        },
        {
          signal: 'Weekly completion rate dropped from 75% to 50%',
          severity: 'medium',
        },
      ],
    }

    // Step 3: Agent detects patterns (runs daily in production)
    const patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(calendarData),
    })

    const pattern = JSON.parse(patternResult)
    
    // Verify drift detection
    expect(pattern.drift_detected).toBe(true)
    expect(pattern.failure_risk).toBe('medium')
    expect(pattern.recommended_intervention).toBe('calendar')
    expect(pattern.signals.length).toBeGreaterThan(0)

    // Step 4: Agent deploys recommended intervention
    const interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: pattern.recommended_intervention,
      details: {
        event_title: 'Recovery Workout - Get Back On Track',
        time: '6:00 AM',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        book_uber: true,
      },
    })

    const intervention = JSON.parse(interventionResult)
    
    expect(intervention.success).toBe(true)
    expect(intervention.type).toBe('calendar')
    expect(intervention.intervention_id).toBeDefined()
    expect(intervention.details.event_title).toBe('Recovery Workout - Get Back On Track')
    expect(intervention.details.uber_booking).toContain('Uber booked')

    // Step 5: Agent sends nudge to user
    const nudgeResult = await sendNudge({
      user_id: TEST_USER,
      message: "I noticed you missed Monday and Wednesday. I've booked a recovery workout for tomorrow at 6 AM and arranged an Uber for 5:45 AM. Let's get back on track! 💪",
      channel: 'sms',
      urgency: 'medium',
    })

    const nudge = JSON.parse(nudgeResult)
    
    expect(nudge.success).toBe(true)
    expect(nudge.channel).toBe('sms')
    expect(nudge.delivery_status).toBe('sent')
    expect(nudge.message_id).toBeDefined()

    // Step 6: Verify intervention was logged
    const interventions = await getInterventions(TEST_USER)
    expect(interventions.length).toBe(1)
    expect(interventions[0].type).toBe('calendar')
    expect(interventions[0].outcome).toBe('pending')
  })

  /**
   * Scenario 2: High-risk user
   * Expected: Detect high risk → Deploy social accountability intervention
   */
  test('should deploy social accountability for high-risk user', async () => {
    // Step 1: Setup user profile with social accountability preference
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
      stake_amount: 200,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: false, // User opted out of calendar
      },
      past_interventions: [
        {
          type: 'social',
          effectiveness: 0.92, // Social works best
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: 'calendar',
          effectiveness: 0.45, // Calendar didn't work
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }
    await saveUserProfile(userProfile)

    // Step 2: Simulate high-risk calendar data (many consecutive misses)
    const calendarData = {
      completion_rate: 0.33, // 33% completion - very low
      total_missed: 4,
      drift_signals: [
        {
          signal: '4 consecutive workouts missed',
          severity: 'high',
        },
        {
          signal: 'Completion rate dropped below 50%',
          severity: 'high',
        },
        {
          signal: 'User has missed 4 out of last 6 scheduled workouts',
          severity: 'high',
        },
      ],
    }

    // Step 3: Agent detects high-risk pattern
    const patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(calendarData),
    })

    const pattern = JSON.parse(patternResult)
    
    expect(pattern.drift_detected).toBe(true)
    expect(pattern.failure_risk).toBe('high')
    expect(pattern.confidence).toBeGreaterThan(0.8)
    expect(pattern.recommended_intervention).toBe('social') // Should recommend social based on past effectiveness

    // Step 4: Agent deploys social accountability intervention
    const interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'social',
      details: {
        buddy_name: 'Sarah (accountability partner)',
        message: 'Your workout buddy Sarah has been notified about your recent struggles. She wants to help!',
      },
    })

    const intervention = JSON.parse(interventionResult)
    
    expect(intervention.success).toBe(true)
    expect(intervention.type).toBe('social')
    expect(intervention.details.accountability_buddy).toBe('Sarah (accountability partner)')
    expect(intervention.details.notification_sent).toBe(true)

    // Step 5: Send urgent nudge
    const nudgeResult = await sendNudge({
      user_id: TEST_USER,
      message: "Hey! I can see you've been struggling lately. I've reached out to Sarah - she's ready to join you for tomorrow's workout. You're not alone in this! 🤝",
      channel: 'sms',
      urgency: 'high',
    })

    const nudge = JSON.parse(nudgeResult)
    
    expect(nudge.success).toBe(true)
    expect(nudge.channel).toBe('sms')
    expect(nudge.delivery_status).toBe('sent')
  })

  /**
   * Scenario 3: User responds positively to intervention
   * Expected: Intervention marked as successful → informs future recommendations
   */
  test('should mark intervention as successful when user responds', async () => {
    // Step 1: Setup and deploy intervention
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      stake_amount: 150,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: true,
      },
      past_interventions: [],
    }
    await saveUserProfile(userProfile)

    const calendarData = {
      completion_rate: 0.6,
      total_missed: 2,
      drift_signals: [
        {
          signal: '2 missed workouts this week',
          severity: 'medium',
        },
      ],
    }

    // Step 2: Deploy intervention
    const patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(calendarData),
    })

    const pattern = JSON.parse(patternResult)
    expect(pattern.drift_detected).toBe(true)

    const interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'message',
      details: {
        message_content: "You're close to your goal! Just 2 more workouts this week. You've got this!",
        channel: 'push',
      },
    })

    const intervention = JSON.parse(interventionResult)
    const interventionId = intervention.intervention_id

    // Step 3: Send nudge
    await sendNudge({
      user_id: TEST_USER,
      message: "You're close to your goal! Just 2 more workouts this week. You've got this!",
      channel: 'push',
      urgency: 'low',
    })

    // Step 4: Simulate user responding positively (completes next workout)
    // In production: workout logging triggers intervention outcome update
    await updateInterventionOutcome(
      interventionId,
      'success',
      'User completed workout within 24 hours of nudge'
    )

    // Step 5: Verify intervention marked as successful
    const interventions = await getInterventions(TEST_USER)
    expect(interventions.length).toBe(1)
    expect(interventions[0].outcome).toBe('success')
    expect(interventions[0].user_feedback).toBe('User completed workout within 24 hours of nudge')

    // In production: This success data feeds into ML model for future recommendations
    // Next time agent detects drift for this user, it knows 'message' interventions work well
  })

  /**
   * Scenario 4: Escalation - User ignores intervention
   * Expected: Initial nudge ignored → Escalate to financial intervention
   */
  test('should escalate to financial intervention when user ignores nudge', async () => {
    // Step 1: Setup user profile
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 4 weeks ago
      stake_amount: 250,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: true,
      },
      past_interventions: [
        {
          type: 'message',
          effectiveness: 0.3, // Messages not working
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          type: 'calendar',
          effectiveness: 0.2, // Calendar not working
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    }
    await saveUserProfile(userProfile)

    // Step 2: First attempt - message intervention
    const firstCalendarData = {
      completion_rate: 0.4,
      total_missed: 3,
      drift_signals: [
        {
          signal: '3 consecutive misses',
          severity: 'high',
        },
      ],
    }

    const firstPatternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(firstCalendarData),
    })

    const firstPattern = JSON.parse(firstPatternResult)
    expect(firstPattern.drift_detected).toBe(true)

    const firstInterventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'message',
      details: {
        message_content: 'Quick reminder: 3 workouts to go this week!',
      },
    })

    const firstIntervention = JSON.parse(firstInterventionResult)
    
    await sendNudge({
      user_id: TEST_USER,
      message: 'Quick reminder: 3 workouts to go this week!',
      channel: 'push',
      urgency: 'medium',
    })

    // Step 3: Simulate user ignoring the nudge (no workout completed)
    await updateInterventionOutcome(
      firstIntervention.intervention_id,
      'failed',
      'User did not respond within 48 hours'
    )

    // Step 4: Second attempt - escalate to financial intervention
    // In production: Agent detects continued drift + previous intervention failed
    const secondCalendarData = {
      completion_rate: 0.33, // Even worse
      total_missed: 5,
      drift_signals: [
        {
          signal: '5 consecutive misses - critical',
          severity: 'high',
        },
        {
          signal: 'Previous intervention failed',
          severity: 'high',
        },
      ],
    }

    const secondPatternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(secondCalendarData),
    })

    const secondPattern = JSON.parse(secondPatternResult)
    expect(secondPattern.drift_detected).toBe(true)
    expect(secondPattern.failure_risk).toBe('high')

    // Agent escalates to financial intervention (high-stakes)
    const financialInterventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'financial',
      details: {
        stake_amount: 250,
        at_risk_amount: 100, // $100 at immediate risk
        message: 'URGENT: Your $250 commitment is at serious risk. You have 5 missed workouts. Complete a workout in the next 24 hours to avoid losing $100.',
      },
    })

    const financialIntervention = JSON.parse(financialInterventionResult)
    
    expect(financialIntervention.success).toBe(true)
    expect(financialIntervention.type).toBe('financial')
    expect(financialIntervention.details.stake_amount).toBe(250)
    expect(financialIntervention.details.at_risk_amount).toBe(100)

    // Step 5: Send high-urgency financial nudge
    const urgentNudgeResult = await sendNudge({
      user_id: TEST_USER,
      message: '🚨 FINAL WARNING: Your $250 commitment is at risk. 5 consecutive missed workouts. Complete a workout TODAY to save $100. This is your last chance.',
      channel: 'sms',
      urgency: 'high',
    })

    const urgentNudge = JSON.parse(urgentNudgeResult)
    
    expect(urgentNudge.success).toBe(true)
    expect(urgentNudge.channel).toBe('sms')

    // Step 6: Verify escalation path
    const allInterventions = await getInterventions(TEST_USER)
    expect(allInterventions.length).toBe(2)
    
    // First intervention failed
    expect(allInterventions[0].type).toBe('message')
    expect(allInterventions[0].outcome).toBe('failed')
    
    // Second intervention is financial (escalated)
    expect(allInterventions[1].type).toBe('financial')
    expect(allInterventions[1].outcome).toBe('pending')

    // In production: If financial intervention also fails → call smart contract forfeitCommitment()
  })

  /**
   * Scenario 5: Complete flow with all intervention types
   * Tests the full escalation ladder: message → calendar → social → financial
   */
  test('should test complete escalation flow through all intervention types', async () => {
    // Setup user
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 5 weeks ago
      stake_amount: 300,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: true,
      },
      past_interventions: [],
    }
    await saveUserProfile(userProfile)

    // Escalation Level 1: Message (gentle reminder)
    const level1Data = {
      completion_rate: 0.7,
      total_missed: 1,
      drift_signals: [{ signal: '1 missed workout', severity: 'low' }],
    }

    let patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(level1Data),
    })
    let pattern = JSON.parse(patternResult)
    
    let interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'message',
      details: { message_content: 'Gentle reminder!' },
    })
    let intervention = JSON.parse(interventionResult)
    
    await updateInterventionOutcome(intervention.intervention_id, 'failed', 'No response')

    // Escalation Level 2: Calendar (schedule specific time)
    const level2Data = {
      completion_rate: 0.5,
      total_missed: 2,
      drift_signals: [{ signal: '2 consecutive misses', severity: 'medium' }],
    }

    patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(level2Data),
    })
    pattern = JSON.parse(patternResult)
    
    interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'calendar',
      details: { event_title: 'Workout', time: '7:00 AM' },
    })
    intervention = JSON.parse(interventionResult)
    
    await updateInterventionOutcome(intervention.intervention_id, 'failed', 'Event ignored')

    // Escalation Level 3: Social (accountability partner)
    const level3Data = {
      completion_rate: 0.4,
      total_missed: 3,
      drift_signals: [{ signal: '3 consecutive misses', severity: 'high' }],
    }

    patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(level3Data),
    })
    pattern = JSON.parse(patternResult)
    
    interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'social',
      details: { buddy_name: 'Mike' },
    })
    intervention = JSON.parse(interventionResult)
    
    await updateInterventionOutcome(intervention.intervention_id, 'failed', 'No workout with buddy')

    // Escalation Level 4: Financial (final warning)
    const level4Data = {
      completion_rate: 0.25,
      total_missed: 5,
      drift_signals: [{ signal: '5 consecutive misses - critical', severity: 'high' }],
    }

    patternResult = await detectPatterns({
      user_id: TEST_USER,
      calendar_data: JSON.stringify(level4Data),
    })
    pattern = JSON.parse(patternResult)
    
    interventionResult = await bookIntervention({
      user_id: TEST_USER,
      type: 'financial',
      details: { stake_amount: 300, at_risk_amount: 150 },
    })
    intervention = JSON.parse(interventionResult)

    // Verify complete escalation path
    const allInterventions = await getInterventions(TEST_USER)
    expect(allInterventions.length).toBe(4)
    
    expect(allInterventions[0].type).toBe('message')
    expect(allInterventions[1].type).toBe('calendar')
    expect(allInterventions[2].type).toBe('social')
    expect(allInterventions[3].type).toBe('financial')
    
    // First 3 failed, last one pending
    expect(allInterventions[0].outcome).toBe('failed')
    expect(allInterventions[1].outcome).toBe('failed')
    expect(allInterventions[2].outcome).toBe('failed')
    expect(allInterventions[3].outcome).toBe('pending')

    // In production: This escalation data trains the ML model to predict
    // which intervention types work for which users at which stages
  })

  /**
   * Scenario 6: Multi-channel nudge delivery
   * Tests sending nudges across different channels (SMS, push, email)
   */
  test('should send nudges across multiple channels', async () => {
    const userProfile: UserProfile = {
      user_id: TEST_USER,
      resolution: 'Gym 4x/week for 8 weeks',
      start_date: new Date().toISOString(),
      stake_amount: 100,
      intervention_preferences: {
        social: true,
        financial: true,
        calendar: true,
      },
      past_interventions: [],
    }
    await saveUserProfile(userProfile)

    // Test SMS nudge
    const smsResult = await sendNudge({
      user_id: TEST_USER,
      message: 'SMS reminder: Workout scheduled for 6 AM tomorrow!',
      channel: 'sms',
      urgency: 'medium',
    })
    const smsNudge = JSON.parse(smsResult)
    expect(smsNudge.success).toBe(true)
    expect(smsNudge.channel).toBe('sms')

    // Test push notification
    const pushResult = await sendNudge({
      user_id: TEST_USER,
      message: 'Push notification: Great progress this week! Keep it up!',
      channel: 'push',
      urgency: 'low',
    })
    const pushNudge = JSON.parse(pushResult)
    expect(pushNudge.success).toBe(true)
    expect(pushNudge.channel).toBe('push')

    // Test email
    const emailResult = await sendNudge({
      user_id: TEST_USER,
      message: 'Weekly summary: You completed 3 out of 4 workouts. One more to go!',
      channel: 'email',
      urgency: 'low',
    })
    const emailNudge = JSON.parse(emailResult)
    expect(emailNudge.success).toBe(true)
    expect(emailNudge.channel).toBe('email')

    // All nudges should have unique message IDs
    expect(smsNudge.message_id).not.toBe(pushNudge.message_id)
    expect(pushNudge.message_id).not.toBe(emailNudge.message_id)
  })
})
