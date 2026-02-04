import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

interface UserProfile {
  user_id: string;
  resolution: string;
  start_date: string;
  stake_amount: number;
  intervention_preferences: {
    social: boolean;
    financial: boolean;
    calendar: boolean;
  };
  past_interventions: Array<{
    type: string;
    effectiveness: number;
    timestamp: string;
  }>;
}

interface Intervention {
  intervention_id: string;
  user_id: string;
  type: string;
  triggered_by: string;
  deployed_at: string;
  outcome: string;
}

interface Database {
  workoutLogs: WorkoutLog[];
  userProfiles: UserProfile[];
  interventions: Intervention[];
}

const DB_PATH = path.join(process.cwd(), '..', 'agent', 'db.json');

async function getDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { workoutLogs: [], userProfiles: [], interventions: [] };
  }
}

// GET - Fetch dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id') || 'demo_user_001';

    const db = await getDatabase();
    
    // Get workouts for last 7 days
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const workouts = (db.workoutLogs || []).filter(w => 
      w.user_id === user_id && new Date(w.timestamp) >= oneWeekAgo
    );

    // Calculate weekly pattern (last 7 days)
    const weekPattern: (boolean | null)[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (i === 0) {
        // Today - check if there's a workout or null for "pending"
        const hasWorkout = workouts.some(w => w.timestamp.startsWith(dateStr));
        weekPattern.push(hasWorkout ? true : null);
      } else {
        const hasWorkout = workouts.some(w => w.timestamp.startsWith(dateStr));
        weekPattern.push(hasWorkout);
      }
    }

    // Calculate stats
    const completedDays = weekPattern.filter(d => d === true).length;
    const totalDays = weekPattern.filter(d => d !== null).length || 1;
    const completionRate = Math.round((completedDays / Math.max(totalDays, 4)) * 100);

    // Determine drift risk
    const missedConsecutive = weekPattern.slice(-3).filter(d => d === false).length;
    let driftRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let driftConfidence = 30;
    const driftSignals: string[] = [];

    if (missedConsecutive >= 2) {
      driftRisk = 'MEDIUM';
      driftConfidence = 72;
      driftSignals.push(`${missedConsecutive} consecutive misses`);
    }
    if (missedConsecutive >= 3) {
      driftRisk = 'HIGH';
      driftConfidence = 89;
    }
    if (completionRate < 50) {
      if (driftRisk === 'LOW') driftRisk = 'MEDIUM';
      driftSignals.push('Low completion rate');
    }

    // Get user profile
    const profile = (db.userProfiles || []).find(p => p.user_id === user_id);
    
    // Calculate total minutes this week
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);

    // Get recent interventions
    const recentInterventions = (db.interventions || [])
      .filter(i => i.user_id === user_id)
      .slice(-5);

    // Build recent activity
    const recentActivity = [
      ...workouts.slice(-3).map(w => ({
        title: 'Workout Completed',
        desc: `${w.exercise_type} • ${new Date(w.timestamp).toLocaleDateString()}`,
        icon: '✓',
        color: '#10B981',
        timestamp: w.timestamp,
      })),
      ...recentInterventions.map(i => ({
        title: 'Intervention Sent',
        desc: `${i.type} • ${new Date(i.deployed_at).toLocaleDateString()}`,
        icon: '📱',
        color: '#6366F1',
        timestamp: i.deployed_at,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

    // Calculate current streak
    let currentStreak = 0;
    for (let i = weekPattern.length - 1; i >= 0; i--) {
      if (weekPattern[i] === true) {
        currentStreak++;
      } else if (weekPattern[i] === false) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      user_id,
      profile: profile || {
        resolution: 'Gym 4x/week',
        stake_amount: 100,
        start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      stats: {
        weekPattern,
        completionRate,
        driftRisk,
        driftConfidence,
        driftSignals,
        workoutsThisWeek: completedDays,
        targetWorkouts: 4,
        totalMinutes,
        currentStreak,
        milestones: {
          completed: Math.min(completedDays, 4),
          total: 4,
        },
      },
      recentActivity,
      agentReasoning: driftRisk === 'LOW' 
        ? [
            { type: 'info', message: 'Analyzing workout patterns...' },
            { type: 'success', message: `User on track with ${completionRate}% completion rate` },
            { type: 'info', message: 'No intervention needed at this time' },
          ]
        : [
            { type: 'info', message: 'Analyzing workout patterns...' },
            { type: 'warning', message: `Detected drift signal: ${driftSignals.join(', ')}` },
            { type: 'info', message: `Deploying intervention: Motivational message` },
            { type: 'success', message: 'Intervention deployed successfully' },
          ],
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
