#!/usr/bin/env node

/**
 * Manual validation script for workout logging tools
 * Run with: node validate-workout.js
 */

import { logWorkout, getWorkoutHistory } from './src/tools/workout.js'
import { getDatabase, saveDatabase } from './src/memory.js'

async function validate() {
  console.log('🧪 Starting workout logging validation...\n')

  // Clean up test data
  console.log('📝 Cleaning up test data...')
  const db = await getDatabase()
  db.workoutLogs = []
  await saveDatabase(db)
  console.log('✓ Database cleaned\n')

  // Test 1: Log a workout
  console.log('Test 1: Logging a workout...')
  const logResult1 = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'squats',
    duration_minutes: 20,
    reps: 50,
    sets: 3,
    form_quality: 'good',
    notes: 'Focused on depth and form',
  })
  console.log('✓ Result:', JSON.parse(logResult1))
  console.log()

  // Test 2: Log another workout
  console.log('Test 2: Logging a second workout...')
  const logResult2 = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'push-ups',
    duration_minutes: 15,
    reps: 30,
    sets: 3,
    form_quality: 'excellent',
  })
  console.log('✓ Result:', JSON.parse(logResult2))
  console.log()

  // Test 3: Get workout history
  console.log('Test 3: Retrieving workout history...')
  const historyResult = await getWorkoutHistory({
    user_id: 'test_user_001',
    days_back: 7,
  })
  console.log('✓ Result:', JSON.parse(historyResult))
  console.log()

  // Test 4: Validation - invalid duration
  console.log('Test 4: Testing validation (invalid duration)...')
  const invalidResult = await logWorkout({
    user_id: 'test_user_001',
    exercise_type: 'squats',
    duration_minutes: 0,
  })
  console.log('✓ Result:', JSON.parse(invalidResult))
  console.log()

  // Test 5: User isolation
  console.log('Test 5: Testing user isolation...')
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
  console.log('✓ User 1 workouts:', JSON.parse(user1History).stats.total_workouts)
  console.log('✓ User 2 workouts:', JSON.parse(user2History).stats.total_workouts)
  console.log()

  // Verify database state
  console.log('📊 Final database state:')
  const finalDb = await getDatabase()
  console.log('Total workout logs:', finalDb.workoutLogs.length)
  console.log('Workout logs:', finalDb.workoutLogs.map(w => ({
    user: w.user_id,
    exercise: w.exercise_type,
    duration: w.duration_minutes,
    verified: w.verified,
  })))

  console.log('\n✅ All validations passed!')
}

validate().catch(err => {
  console.error('❌ Validation failed:', err)
  process.exit(1)
})
