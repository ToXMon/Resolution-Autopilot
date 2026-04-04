#!/usr/bin/env node

/**
 * Manual validation script for workout logging tools
 * Run with: node validate-workout.js
 */

import { logWorkout, getWorkoutHistory } from './src/tools/workout.js'
import { getDatabase, saveDatabase } from './src/memory.js'

async function validate() {

  // Clean up test data
  const db = await getDatabase()
  db.workoutLogs = []
  await saveDatabase(db)

  // Test 1: Log a workout
  const logResult1 = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'squats',
    duration_minutes: 20,
    reps: 50,
    sets: 3,
    form_quality: 'good',
    notes: 'Focused on depth and form',
  })

  // Test 2: Log another workout
  const logResult2 = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'push-ups',
    duration_minutes: 15,
    reps: 30,
    sets: 3,
    form_quality: 'excellent',
  })

  // Test 3: Get workout history
  const historyResult = await getWorkoutHistory({
    user_id: 'test_user_001',
    days_back: 7,
  })

  // Test 4: Validation - invalid duration
  const invalidResult = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'squats',
    duration_minutes: 0,
  })

  // Test 5: User isolation
  await logWorkout({
    user_id: 'test_user_002',
    exercise_type: 'running',
    duration_minutes: 30,
  })
  const user1History = await getWorkoutHistory({
    user_id: 'test_user_001',
  })
  const user2History = await getWorkoutHistory({
    user_id: 'test_user_002',
  })

  // Verify database state
  const finalDb = await getDatabase()
    user: w.user_id,
    exercise: w.exercise_type,
    duration: w.duration_minutes,
    verified: w.verified,
  })))

}

validate().catch(err => {
  console.error('❌ Validation failed:', err)
  process.exit(1)
})
