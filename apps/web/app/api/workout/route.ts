import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

// Define types inline for simplicity
interface WorkoutLog {
  workout_id: string;
  user_id: string;
  exercise_type: string;
  duration_minutes: number;
  reps?: number;
  sets?: number;
  form_quality?: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  notes?: string;
  timestamp: string;
  verified: boolean;
}

interface Database {
  workoutLogs: WorkoutLog[];
}

const DB_PATH = path.join(process.cwd(), '..', 'agent', 'db.json');

async function getDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { workoutLogs: [] };
  }
}

async function saveDatabase(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// POST - Log a new workout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id = 'demo_user_001',
      exercise_type,
      duration_minutes,
      reps,
      sets,
      form_quality = 'good',
      notes = '',
    } = body;

    // Validate required fields
    if (!exercise_type || !duration_minutes) {
      return NextResponse.json(
        { error: 'exercise_type and duration_minutes are required' },
        { status: 400 }
      );
    }

    if (duration_minutes <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      );
    }

    // Create workout log
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
      verified: true,
    };

    // Save to database
    const db = await getDatabase();
    if (!db.workoutLogs) {
      db.workoutLogs = [];
    }
    db.workoutLogs.push(workoutLog);
    await saveDatabase(db);

    // Calculate stats
    const userWorkouts = db.workoutLogs.filter(w => w.user_id === user_id);
    const totalWorkouts = userWorkouts.length;
    const totalMinutes = userWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const workoutsToday = userWorkouts.filter(w => 
      w.timestamp.startsWith(today)
    ).length;

    return NextResponse.json({
      success: true,
      workout_id: workoutLog.workout_id,
      message: `Workout logged successfully! ${exercise_type} for ${duration_minutes} minutes`,
      stats: {
        total_workouts: totalWorkouts,
        total_minutes: totalMinutes,
        workouts_today: workoutsToday,
        average_duration: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
      },
      commitment_status: workoutsToday > 0 
        ? 'Daily workout requirement met ✓' 
        : 'First workout of the day logged',
    });
  } catch (error) {
    console.error('Error logging workout:', error);
    return NextResponse.json(
      { error: 'Failed to log workout' },
      { status: 500 }
    );
  }
}

// GET - Get workout history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id') || 'demo_user_001';
    const days_back = parseInt(searchParams.get('days_back') || '7', 10);

    const db = await getDatabase();
    
    if (!db.workoutLogs || db.workoutLogs.length === 0) {
      return NextResponse.json({
        success: true,
        workouts: [],
        message: 'No workout history found. Start logging workouts to track progress!',
        stats: {
          total_workouts: 0,
          total_minutes: 0,
          completion_rate: 0,
        },
      });
    }

    // Filter workouts for this user within the time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_back);

    const workouts = db.workoutLogs.filter(w => 
      w.user_id === user_id && new Date(w.timestamp) >= cutoffDate
    );

    // Calculate statistics
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
    
    // Expected workouts (assume 4x per week schedule)
    const expectedWorkouts = Math.ceil((days_back / 7) * 4);
    const completionRate = expectedWorkouts > 0 
      ? Math.min(100, Math.round((totalWorkouts / expectedWorkouts) * 100))
      : 0;

    // Group by exercise type
    const exerciseBreakdown: Record<string, number> = {};
    workouts.forEach(w => {
      exerciseBreakdown[w.exercise_type] = (exerciseBreakdown[w.exercise_type] || 0) + 1;
    });

    // Weekly stats
    const weeksInRange = Math.max(1, days_back / 7);
    const workoutsPerWeek = totalWorkouts / weeksInRange;

    return NextResponse.json({
      success: true,
      workouts: workouts.map(w => ({
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
    });
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout history' },
      { status: 500 }
    );
  }
}
