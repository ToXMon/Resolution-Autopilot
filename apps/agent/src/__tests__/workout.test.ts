import { describe, test, expect, beforeEach } from 'bun:test'
import { logWorkout, getWorkoutHistory } from '../tools/workout.js'
import { getDatabase, saveDatabase } from '../memory.js'

describe('Workout Logging Tools', () => {
  // Clean up database before each test
  beforeEach(async () => {
    const db = await getDatabase()
    db.workoutLogs = []
    await saveDatabase(db)
  })

  describe('logWorkout', () => {
    test('should log a workout successfully', async () => {
      const result = await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 20,
        reps: 50,
        sets: 3,
        form_quality: 'good',
        notes: 'Focused on depth and form',
      })

      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.workout_id).toBeDefined()
      expect(parsed.message).toContain('squats')
      expect(parsed.message).toContain('20 minutes')
      expect(parsed.stats.total_workouts).toBe(1)
      expect(parsed.stats.workouts_today).toBe(1)
    })

    test('should track multiple workouts', async () => {
      // Log first workout
      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 20,
        reps: 50,
        sets: 3,
      })

      // Log second workout
      const result = await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'push-ups',
        duration_minutes: 15,
        reps: 30,
        sets: 3,
      })

      const parsed = JSON.parse(result)
      expect(parsed.stats.total_workouts).toBe(2)
      expect(parsed.stats.total_minutes).toBe(35)
      expect(parsed.stats.average_duration).toBe(18) // (20 + 15) / 2 rounded
    })

    test('should validate duration is positive', async () => {
      const result = await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 0,
      })

      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(false)
      expect(parsed.error).toContain('greater than 0')
    })

    test('should default form_quality to good', async () => {
      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'running',
        duration_minutes: 30,
      })

      const db = await getDatabase()
      const workout = db.workoutLogs[0]
      expect(workout.form_quality).toBe('good')
    })
  })

  describe('getWorkoutHistory', () => {
    test('should return empty history for new user', async () => {
      const result = await getWorkoutHistory({
        user_id: 'new_user_001',
      })

      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.workouts).toEqual([])
      expect(parsed.stats.total_workouts).toBe(0)
    })

    test('should retrieve workout history', async () => {
      // Log some workouts
      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 20,
        reps: 50,
        sets: 3,
      })

      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'push-ups',
        duration_minutes: 15,
        reps: 30,
        sets: 3,
      })

      const result = await getWorkoutHistory({
        user_id: 'test_user_001',
        days_back: 7,
      })

      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.workouts.length).toBe(2)
      expect(parsed.stats.total_workouts).toBe(2)
      expect(parsed.stats.total_minutes).toBe(35)
      expect(parsed.stats.exercise_breakdown.squats).toBe(1)
      expect(parsed.stats.exercise_breakdown['push-ups']).toBe(1)
    })

    test('should filter workouts by user_id', async () => {
      // Log workouts for different users
      await logWorkout({
        user_id: 'user_1',
        exercise_type: 'squats',
        duration_minutes: 20,
      })

      await logWorkout({
        user_id: 'user_2',
        exercise_type: 'running',
        duration_minutes: 30,
      })

      const result = await getWorkoutHistory({
        user_id: 'user_1',
      })

      const parsed = JSON.parse(result)
      expect(parsed.workouts.length).toBe(1)
      expect(parsed.workouts[0].exercise).toBe('squats')
    })

    test('should calculate completion rate', async () => {
      // Log 4 workouts (meets 4x/week expectation)
      for (let i = 0; i < 4; i++) {
        await logWorkout({
          user_id: 'test_user_001',
          exercise_type: 'workout',
          duration_minutes: 30,
        })
      }

      const result = await getWorkoutHistory({
        user_id: 'test_user_001',
        days_back: 7,
      })

      const parsed = JSON.parse(result)
      expect(parsed.stats.completion_rate).toBe(100)
      expect(parsed.commitment_analysis.on_track).toBe(true)
    })

    test('should show workouts per week', async () => {
      // Log 4 workouts
      for (let i = 0; i < 4; i++) {
        await logWorkout({
          user_id: 'test_user_001',
          exercise_type: 'workout',
          duration_minutes: 30,
        })
      }

      const result = await getWorkoutHistory({
        user_id: 'test_user_001',
        days_back: 7,
      })

      const parsed = JSON.parse(result)
      expect(parsed.stats.workouts_per_week).toBe(4)
    })
  })

  describe('Integration with Database', () => {
    test('workouts should persist in database', async () => {
      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 20,
      })

      const db = await getDatabase()
      expect(db.workoutLogs.length).toBe(1)
      expect(db.workoutLogs[0].exercise_type).toBe('squats')
      expect(db.workoutLogs[0].verified).toBe(true)
    })

    test('workout should have unique ID and timestamp', async () => {
      await logWorkout({
        user_id: 'test_user_001',
        exercise_type: 'squats',
        duration_minutes: 20,
      })

      const db = await getDatabase()
      const workout = db.workoutLogs[0]
      
      expect(workout.workout_id).toBeDefined()
      expect(workout.timestamp).toBeDefined()
      expect(new Date(workout.timestamp)).toBeInstanceOf(Date)
    })
  })
})
