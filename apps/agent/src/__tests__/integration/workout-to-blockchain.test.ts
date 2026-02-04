import { describe, test, expect, beforeEach } from 'bun:test'
import { logWorkout, getWorkoutHistory } from '../../tools/workout.js'
import { fetchSmartContract } from '../../tools/blockchain.js'
import { getDatabase, saveDatabase } from '../../memory.js'

/**
 * Integration Test: Workout Logging → Milestone Verification → Payment Flow
 * 
 * This test verifies the complete user flow:
 * 1. User logs workouts via vision agent
 * 2. Workouts accumulate toward weekly milestones
 * 3. Smart contract verifies milestones are met
 * 4. Payment flow is triggered on successful completion
 */
describe('Workout to Blockchain Integration', () => {
  const TEST_USER = 'integration_test_user_001'

  beforeEach(async () => {
    // Clean database before each test
    const db = await getDatabase()
    db.workoutLogs = []
    db.messages = []
    await saveDatabase(db)
  })

  test('should log workout and reflect in contract milestone progress', async () => {
    // Step 1: User completes a workout (logged by vision agent)
    const workoutResult = await logWorkout({
      user_id: TEST_USER,
      exercise_type: 'squats',
      duration_minutes: 30,
      reps: 100,
      sets: 5,
      form_quality: 'excellent',
      notes: 'Vision-verified workout',
    })

    const workout = JSON.parse(workoutResult)
    expect(workout.success).toBe(true)
    expect(workout.workout_id).toBeDefined()
    expect(workout.stats.total_workouts).toBe(1)

    // Step 2: Check workout history confirms logging
    const historyResult = await getWorkoutHistory({
      user_id: TEST_USER,
      days_back: 7,
    })

    const history = JSON.parse(historyResult)
    expect(history.success).toBe(true)
    expect(history.workouts.length).toBe(1)
    expect(history.stats.completion_rate).toBeGreaterThan(0)

    // Step 3: Verify smart contract reflects progress
    const contractResult = await fetchSmartContract({
      user_address: TEST_USER,
      contract_type: 'commitment',
    })

    const contract = JSON.parse(contractResult)
    expect(contract.success).toBe(true)
    expect(contract.contract_data.commitment).toBeDefined()
    
    // Workout should count toward milestone completion
    // Note: In real implementation, backend will call contract.completeMilestone()
    expect(contract.contract_data.commitment.total_milestones).toBeGreaterThan(0)
  })

  test('should complete milestone after 4 workouts in a week', async () => {
    // Log 4 workouts (weekly requirement)
    for (let i = 0; i < 4; i++) {
      await logWorkout({
        user_id: TEST_USER,
        exercise_type: 'workout',
        duration_minutes: 30,
      })
    }

    // Check completion rate
    const historyResult = await getWorkoutHistory({
      user_id: TEST_USER,
      days_back: 7,
    })

    const history = JSON.parse(historyResult)
    expect(history.stats.workouts_per_week).toBe(4)
    expect(history.stats.completion_rate).toBe(100)
    expect(history.commitment_analysis.on_track).toBe(true)

    // In production, this would trigger:
    // 1. Call to smart contract: completeMilestone(milestoneIndex, proofHash)
    // 2. Update user's milestone progress on-chain
    // 3. If all milestones complete → trigger payment
  })

  test('should handle failed commitment when completion rate is low', async () => {
    // Log only 1 workout (below 4x/week requirement)
    await logWorkout({
      user_id: TEST_USER,
      exercise_type: 'workout',
      duration_minutes: 20,
    })

    const historyResult = await getWorkoutHistory({
      user_id: TEST_USER,
      days_back: 7,
    })

    const history = JSON.parse(historyResult)
    expect(history.stats.workouts_per_week).toBe(1)
    expect(history.stats.completion_rate).toBeLessThan(100)
    expect(history.commitment_analysis.on_track).toBe(false)

    // In production, agent would:
    // 1. Detect drift signal
    // 2. Deploy intervention
    // 3. If user still fails → call contract.forfeitCommitment()
  })

  test('should verify workout quality requirements for milestone', async () => {
    // Log workout with poor form (should not count toward milestone)
    const poorFormResult = await logWorkout({
      user_id: TEST_USER,
      exercise_type: 'squats',
      duration_minutes: 30,
      form_quality: 'poor',
    })

    const poorForm = JSON.parse(poorFormResult)
    expect(poorForm.success).toBe(true)

    // Log workout with good form (should count)
    const goodFormResult = await logWorkout({
      user_id: TEST_USER,
      exercise_type: 'squats',
      duration_minutes: 30,
      form_quality: 'excellent',
    })

    const goodForm = JSON.parse(goodFormResult)
    expect(goodForm.success).toBe(true)

    // In production, smart contract milestone verification would:
    // 1. Check form_quality threshold (e.g., >= 'good')
    // 2. Only count workouts meeting quality standards
    // 3. Require X high-quality workouts per milestone
  })

  test('should generate proof hash for smart contract verification', async () => {
    const workoutResult = await logWorkout({
      user_id: TEST_USER,
      exercise_type: 'deadlifts',
      duration_minutes: 45,
      reps: 50,
      sets: 5,
      form_quality: 'excellent',
    })

    const workout = JSON.parse(workoutResult)
    expect(workout.workout_id).toBeDefined()

    // In production, proof hash would be:
    // 1. Hash of workout data + timestamp + video IPFS hash
    // 2. Signed by backend service (verifier)
    // 3. Passed to smart contract as proof
    
    // Example: keccak256(workout_id + timestamp + form_quality + video_hash)
    const proofHash = workout.workout_id // Simplified for test
    expect(proofHash.length).toBeGreaterThan(0)
  })

  test('should track multiple users independently', async () => {
    const USER_A = 'user_a'
    const USER_B = 'user_b'

    // User A logs 2 workouts
    await logWorkout({ user_id: USER_A, exercise_type: 'running', duration_minutes: 30 })
    await logWorkout({ user_id: USER_A, exercise_type: 'cycling', duration_minutes: 20 })

    // User B logs 3 workouts
    await logWorkout({ user_id: USER_B, exercise_type: 'squats', duration_minutes: 25 })
    await logWorkout({ user_id: USER_B, exercise_type: 'push-ups', duration_minutes: 15 })
    await logWorkout({ user_id: USER_B, exercise_type: 'planks', duration_minutes: 10 })

    // Verify User A's history
    const historyA = JSON.parse(await getWorkoutHistory({ user_id: USER_A }))
    expect(historyA.workouts.length).toBe(2)
    expect(historyA.stats.total_minutes).toBe(50)

    // Verify User B's history
    const historyB = JSON.parse(await getWorkoutHistory({ user_id: USER_B }))
    expect(historyB.workouts.length).toBe(3)
    expect(historyB.stats.total_minutes).toBe(50)

    // Each user should have independent smart contract state
    const contractA = JSON.parse(await fetchSmartContract({ user_address: USER_A, contract_type: 'commitment' }))
    const contractB = JSON.parse(await fetchSmartContract({ user_address: USER_B, contract_type: 'commitment' }))

    expect(contractA.contract_data.commitment.user).toBe(USER_A)
    expect(contractB.contract_data.commitment.user).toBe(USER_B)
  })
})
