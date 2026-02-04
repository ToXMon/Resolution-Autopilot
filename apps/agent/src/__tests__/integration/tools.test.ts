/**
 * Integration Tests for Agent Tools
 * 
 * End-to-end tests for all agent tools
 */

import { describe, test, expect, beforeEach } from 'bun:test'
import { getDatabase, saveDatabase } from '../../db/pool.js'
import { logWorkout, getWorkoutHistory } from '../../tools/workout.js'
import { detectPatterns } from '../../tools/patterns.js'
import { analyzeCalendar } from '../../tools/calendar.js'
import { deployNudge } from '../../tools/nudge.js'

describe('Agent Tools Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    const db = await getDatabase()
    db.workoutLogs = []
    db.userProfiles = []
    db.interventions = []
    await saveDatabase(db)
  })

  describe('Workout Logging Integration', () => {
    test('should log workout and retrieve history', async () => {
      const userId = 'test_user_001'

      // Log a workout
      const logResult = await logWorkout({
        user_id: userId,
        exercise_type: 'squats',
        duration_minutes: 30,
        reps: 50,
        sets: 3,
        form_quality: 'excellent',
        notes: 'Felt strong today',
      })

      const logParsed = JSON.parse(logResult)
      expect(logParsed.success).toBe(true)

      // Retrieve workout history
      const historyResult = await getWorkoutHistory({
        user_id: userId,
        days_back: 7,
      })

      const historyParsed = JSON.parse(historyResult)
      expect(historyParsed.success).toBe(true)
      expect(historyParsed.workouts.length).toBe(1)
      expect(historyParsed.workouts[0].exercise).toBe('squats')
      expect(historyParsed.workouts[0].form_quality).toBe('excellent')
    })

    test('should track multiple workouts across days', async () => {
      const userId = 'test_user_002'

      // Log 4 workouts (meeting weekly goal)
      for (let i = 0; i < 4; i++) {
        await logWorkout({
          user_id: userId,
          exercise_type: 'running',
          duration_minutes: 30,
        })
      }

      const historyResult = await getWorkoutHistory({
        user_id: userId,
        days_back: 7,
      })

      const parsed = JSON.parse(historyResult)
      expect(parsed.stats.total_workouts).toBe(4)
      expect(parsed.stats.completion_rate).toBe(100)
      expect(parsed.commitment_analysis.on_track).toBe(true)
    })

    test('should calculate completion rate correctly', async () => {
      const userId = 'test_user_003'

      // Log 2 workouts (half of weekly goal)
      await logWorkout({
        user_id: userId,
        exercise_type: 'yoga',
        duration_minutes: 45,
      })

      await logWorkout({
        user_id: userId,
        exercise_type: 'cycling',
        duration_minutes: 60,
      })

      const historyResult = await getWorkoutHistory({
        user_id: userId,
        days_back: 7,
      })

      const parsed = JSON.parse(historyResult)
      expect(parsed.stats.total_workouts).toBe(2)
      expect(parsed.stats.completion_rate).toBe(50)
      expect(parsed.commitment_analysis.on_track).toBe(false)
      expect(parsed.commitment_analysis.risk_level).toContain('MEDIUM')
    })
  })

  describe('Pattern Detection Integration', () => {
    test('should detect drift patterns from workout history', async () => {
      const userId = 'test_user_004'

      // Log only 1 workout (high risk)
      await logWorkout({
        user_id: userId,
        exercise_type: 'walking',
        duration_minutes: 20,
      })

      const patternResult = await detectPatterns({
        user_id: userId,
      })

      const parsed = JSON.parse(patternResult)
      expect(parsed.success).toBe(true)
      expect(parsed.patterns.drift_detected).toBe(true)
      expect(parsed.risk_score).toBeGreaterThan(0)
    })

    test('should show low risk with consistent workouts', async () => {
      const userId = 'test_user_005'

      // Log 4 consistent workouts
      for (let i = 0; i < 4; i++) {
        await logWorkout({
          user_id: userId,
          exercise_type: 'gym',
          duration_minutes: 45,
        })
      }

      const patternResult = await detectPatterns({
        user_id: userId,
      })

      const parsed = JSON.parse(patternResult)
      expect(parsed.success).toBe(true)
      expect(parsed.patterns.drift_detected).toBe(false)
      expect(parsed.risk_score).toBeLessThan(50)
    })
  })

  describe('Calendar Analysis Integration', () => {
    test('should analyze calendar schedule', async () => {
      const userId = 'test_user_006'

      const calendarResult = await analyzeCalendar({
        user_id: userId,
        days_ahead: 7,
      })

      const parsed = JSON.parse(calendarResult)
      expect(parsed.success).toBe(true)
      expect(parsed.events).toBeDefined()
      expect(Array.isArray(parsed.events)).toBe(true)
    })
  })

  describe('Nudge Deployment Integration', () => {
    test('should deploy nudge for at-risk user', async () => {
      const userId = 'test_user_007'

      // Log only 1 workout (triggering intervention)
      await logWorkout({
        user_id: userId,
        exercise_type: 'jogging',
        duration_minutes: 15,
      })

      const nudgeResult = await deployNudge({
        user_id: userId,
        message: 'You missed your workout yesterday. Get back on track today!',
        urgency: 'high',
        channel: 'sms',
      })

      const parsed = JSON.parse(nudgeResult)
      expect(parsed.success).toBe(true)
      expect(parsed.message).toContain('deployed')
    })

    test('should track nudge effectiveness', async () => {
      const userId = 'test_user_008'

      // Deploy nudge
      await deployNudge({
        user_id: userId,
        message: 'Reminder: Gym session at 6 PM today!',
        urgency: 'medium',
        channel: 'push',
      })

      // Verify nudge was logged in interventions
      const db = await getDatabase()
      const interventions = db.interventions.filter(
        (i) => i.user_id === userId
      )

      expect(interventions.length).toBeGreaterThan(0)
      expect(interventions[0].type).toBe('nudge')
    })
  })

  describe('End-to-End User Journey', () => {
    test('complete user journey: signup -> workout -> drift -> intervention', async () => {
      const userId = 'test_user_journey'

      // 1. User logs first workout (success)
      const workout1 = await logWorkout({
        user_id: userId,
        exercise_type: 'strength_training',
        duration_minutes: 45,
        reps: 60,
        sets: 4,
        form_quality: 'good',
      })
      expect(JSON.parse(workout1).success).toBe(true)

      // 2. User logs second workout (maintaining commitment)
      const workout2 = await logWorkout({
        user_id: userId,
        exercise_type: 'cardio',
        duration_minutes: 30,
      })
      expect(JSON.parse(workout2).success).toBe(true)

      // 3. Check workout history shows progress
      const history = await getWorkoutHistory({
        user_id: userId,
        days_back: 7,
      })
      const historyParsed = JSON.parse(history)
      expect(historyParsed.stats.total_workouts).toBe(2)

      // 4. Detect patterns (should show partial progress)
      const patterns = await detectPatterns({
        user_id: userId,
      })
      const patternsParsed = JSON.parse(patterns)
      expect(patternsParsed.success).toBe(true)

      // 5. Deploy intervention for missed workouts
      const nudge = await deployNudge({
        user_id: userId,
        message: 'You're halfway to your goal! Keep going!',
        urgency: 'low',
        channel: 'push',
      })
      expect(JSON.parse(nudge).success).toBe(true)

      // 6. Verify all data is persisted
      const db = await getDatabase()
      expect(db.workoutLogs.length).toBe(2)
      expect(db.interventions.length).toBe(1)
    })
  })

  describe('Database Connection Pooling', () => {
    test('should handle concurrent operations', async () => {
      const userId = 'test_concurrent'

      // Simulate 5 concurrent workout logs
      const promises = Array.from({ length: 5 }, (_, i) =>
        logWorkout({
          user_id: userId,
          exercise_type: 'test',
          duration_minutes: 10 + i,
        })
      )

      const results = await Promise.all(promises)

      // All should succeed
      results.forEach((result) => {
        const parsed = JSON.parse(result)
        expect(parsed.success).toBe(true)
      })

      // Verify all 5 workouts were logged
      const history = await getWorkoutHistory({
        user_id: userId,
        days_back: 7,
      })
      const parsed = JSON.parse(history)
      expect(parsed.stats.total_workouts).toBe(5)
    })
  })
})
