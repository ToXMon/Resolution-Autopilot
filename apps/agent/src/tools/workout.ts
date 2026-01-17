import type { ToolDefinition, ToolFn } from '../types.js'
import { getDatabase, saveDatabase } from '../memory.js'
import { v4 as uuidv4 } from 'uuid'

export const logWorkoutToolDefinition: ToolDefinition = {
  name: 'log_workout',
  description: 'Log a completed workout session with exercise details, reps, sets, and form quality. This tool records workout data that can be used to verify commitment contract requirements and track user progress.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID for whom to log the workout',
      },
      exercise_type: {
        type: 'string',
        description: 'Type of exercise performed (e.g., squats, push-ups, lunges, plank, running, cycling)',
      },
      duration_minutes: {
        type: 'number',
        description: 'Duration of workout in minutes',
      },
      reps: {
        type: 'number',
        description: 'Number of repetitions completed (if applicable)',
      },
      sets: {
        type: 'number',
        description: 'Number of sets completed (if applicable)',
      },
      form_quality: {
        type: 'string',
        description: 'Quality of form during exercise: excellent, good, fair, needs_improvement',
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the workout, coaching feedback, or observations',
      },
    },
    required: ['user_id', 'exercise_type', 'duration_minutes'],
  },
}

export interface LogWorkoutInput {
  user_id: string
  exercise_type: string
  duration_minutes: number
  reps?: number
  sets?: number
  form_quality?: 'excellent' | 'good' | 'fair' | 'needs_improvement'
  notes?: string
}

interface WorkoutLog {
  workout_id: string
  user_id: string
  exercise_type: string
  duration_minutes: number
  reps?: number
  sets?: number
  form_quality?: 'excellent' | 'good' | 'fair' | 'needs_improvement'
  notes?: string
  timestamp: string
  verified: boolean
}

export const logWorkout: ToolFn<LogWorkoutInput, string> = async (input) => {
  const {
    user_id,
    exercise_type,
    duration_minutes,
    reps,
    sets,
    form_quality = 'good',
    notes = '',
  } = input

  // Validate input
  if (duration_minutes <= 0) {
    return JSON.stringify({
      success: false,
      error: 'Duration must be greater than 0 minutes',
    })
  }

  // Create workout log entry
  const workoutLog: WorkoutLog = {
    workout_id: uuidv4(),
    user_id,
    exercise_type,
    duration_minutes,
    reps,
    sets,
    form_quality,
    notes,
    timestamp: new Date().toISOString(),
    verified: true, // Marked as verified since it's logged through the agent
  }

  // Save to database
  const db = await getDatabase()
  
  // Initialize workout logs array if it doesn't exist
  if (!db.workoutLogs) {
    db.workoutLogs = []
  }

  db.workoutLogs.push(workoutLog)
  await saveDatabase(db)

  // Calculate workout stats for this user
  const userWorkouts = db.workoutLogs.filter((w: WorkoutLog) => w.user_id === user_id)
  const totalWorkouts = userWorkouts.length
  const totalMinutes = userWorkouts.reduce((sum: number, w: WorkoutLog) => sum + w.duration_minutes, 0)
  const recentWorkouts = userWorkouts.slice(-7) // Last 7 workouts
  
  // Check if this satisfies commitment contract requirements
  const today = new Date().toISOString().split('T')[0]
  const workoutsToday = userWorkouts.filter((w: WorkoutLog) => 
    w.timestamp.startsWith(today)
  ).length

  const result = {
    success: true,
    workout_id: workoutLog.workout_id,
    message: `Workout logged successfully! ${exercise_type} for ${duration_minutes} minutes`,
    stats: {
      total_workouts: totalWorkouts,
      total_minutes: totalMinutes,
      workouts_today: workoutsToday,
      recent_workouts: recentWorkouts.length,
      average_duration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
    },
    commitment_status: workoutsToday > 0 
      ? 'Daily workout requirement met ✓' 
      : 'First workout of the day logged',
    form_feedback: form_quality === 'excellent' || form_quality === 'good'
      ? 'Great job maintaining proper form!'
      : 'Remember to focus on form quality for better results and injury prevention.',
  }

  return JSON.stringify(result, null, 2)
}

export const getWorkoutHistoryToolDefinition: ToolDefinition = {
  name: 'get_workout_history',
  description: 'Retrieve workout history for a user, showing logged exercises, progress, and commitment contract verification status.',
  parameters: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to retrieve workout history for',
      },
      days_back: {
        type: 'number',
        description: 'Number of days of history to retrieve (default: 7)',
      },
    },
    required: ['user_id'],
  },
}

export interface GetWorkoutHistoryInput {
  user_id: string
  days_back?: number
}

export const getWorkoutHistory: ToolFn<GetWorkoutHistoryInput, string> = async (input) => {
  const { user_id, days_back = 7 } = input

  const db = await getDatabase()
  
  if (!db.workoutLogs || db.workoutLogs.length === 0) {
    return JSON.stringify({
      success: true,
      workouts: [],
      message: 'No workout history found. Start logging workouts to track progress!',
      stats: {
        total_workouts: 0,
        total_minutes: 0,
        completion_rate: 0,
      },
    })
  }

  // Filter workouts for this user within the time range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days_back)

  const workouts = db.workoutLogs.filter((w: WorkoutLog) => 
    w.user_id === user_id && new Date(w.timestamp) >= cutoffDate
  )

  // Calculate statistics
  const totalWorkouts = workouts.length
  const totalMinutes = workouts.reduce((sum: number, w: WorkoutLog) => sum + w.duration_minutes, 0)
  
  // Expected workouts (assume 4x per week schedule)
  const expectedWorkouts = Math.ceil((days_back / 7) * 4)
  const completionRate = expectedWorkouts > 0 
    ? Math.min(100, Math.round((totalWorkouts / expectedWorkouts) * 100))
    : 0

  // Group by exercise type
  const exerciseBreakdown: Record<string, number> = {}
  workouts.forEach((w: WorkoutLog) => {
    exerciseBreakdown[w.exercise_type] = (exerciseBreakdown[w.exercise_type] || 0) + 1
  })

  // Check consistency (workouts per week)
  const weeksInRange = Math.max(1, days_back / 7)
  const workoutsPerWeek = totalWorkouts / weeksInRange

  const result = {
    success: true,
    workouts: workouts.map((w: WorkoutLog) => ({
      date: new Date(w.timestamp).toISOString().split('T')[0],
      time: new Date(w.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      exercise: w.exercise_type,
      duration: w.duration_minutes,
      reps: w.reps,
      sets: w.sets,
      form_quality: w.form_quality,
      notes: w.notes,
    })),
    stats: {
      total_workouts: totalWorkouts,
      total_minutes: totalMinutes,
      average_duration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
      completion_rate: completionRate,
      workouts_per_week: Math.round(workoutsPerWeek * 10) / 10,
      exercise_breakdown: exerciseBreakdown,
    },
    commitment_analysis: {
      on_track: completionRate >= 75,
      message: completionRate >= 75
        ? `Excellent! You're meeting your commitment with ${completionRate}% completion rate.`
        : completionRate >= 50
        ? `You're on the right track, but there's room for improvement. Current completion: ${completionRate}%`
        : `Warning: Low completion rate (${completionRate}%). Consider booking interventions to get back on track.`,
    },
  }

  return JSON.stringify(result, null, 2)
}
