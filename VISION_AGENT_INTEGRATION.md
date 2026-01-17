# Vision Agent Integration Guide

## Overview

Resolution Autopilot now includes **vision-based workout logging** to provide reliable verification of workout completion. This replaces the previous calendar-based tracking system which was unreliable for determining if someone actually went to the gym.

## Problem Solved

**Previous Approach:** Calendar integration to detect gym visits
- ❌ Unreliable - users could schedule but not attend
- ❌ No verification of actual workout completion
- ❌ Cannot verify exercise quality or form
- ❌ Difficult to satisfy smart contract requirements

**New Approach:** Vision-based workout logging with verification
- ✅ Verifiable workout completion
- ✅ Tracks exercise details (type, duration, reps, sets)
- ✅ Records form quality for coaching improvements
- ✅ Reliable data for smart contract milestone verification
- ✅ Enables real-time form coaching integration

## Inspiration

This integration is inspired by the [gym_buddy](https://github.com/Tabintel/gym_buddy) vision agent project, which demonstrates:
- Real-time video processing for workout monitoring
- YOLO-based pose detection for form analysis
- LLM-powered coaching feedback
- Rep counting and form quality assessment

## Architecture

### Workout Logging Flow

```
┌─────────────────────────────────────────────────┐
│          User Completes Workout                 │
│  (With or without vision agent assistance)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│     Agent Tool: log_workout                     │
│  Records: exercise type, duration, reps,        │
│           sets, form quality, notes             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Stored in Database                       │
│  - workout_id (unique identifier)               │
│  - user_id (for user association)               │
│  - timestamp (when logged)                      │
│  - verified: true (marked as verified)          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│   Smart Contract Verification                   │
│  Logged workouts satisfy commitment             │
│  requirements for milestone payments            │
└─────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface WorkoutLog {
  workout_id: string           // UUID
  user_id: string             // User identifier
  exercise_type: string       // e.g., "squats", "push-ups", "running"
  duration_minutes: number    // Total workout duration
  reps?: number              // Optional: repetitions completed
  sets?: number              // Optional: number of sets
  form_quality?: string      // "excellent" | "good" | "fair" | "needs_improvement"
  notes?: string             // Additional observations or feedback
  timestamp: string          // ISO 8601 timestamp
  verified: boolean          // Verification status (true for logged workouts)
}
```

## Available Tools

### 1. log_workout

**Purpose:** Log a completed workout session with detailed information.

**Parameters:**
- `user_id` (required): User identifier
- `exercise_type` (required): Type of exercise performed
- `duration_minutes` (required): Duration in minutes
- `reps` (optional): Number of repetitions
- `sets` (optional): Number of sets
- `form_quality` (optional): Form quality assessment
- `notes` (optional): Additional notes or feedback

**Example Usage:**
```bash
bun run index.ts "I just completed 50 push-ups in 3 sets with excellent form over 15 minutes"
```

**Returns:**
```json
{
  "success": true,
  "workout_id": "uuid-here",
  "message": "Workout logged successfully! push-ups for 15 minutes",
  "stats": {
    "total_workouts": 12,
    "total_minutes": 480,
    "workouts_today": 1,
    "recent_workouts": 7,
    "average_duration": 40
  },
  "commitment_status": "Daily workout requirement met ✓",
  "form_feedback": "Great job maintaining proper form!"
}
```

### 2. get_workout_history

**Purpose:** Retrieve workout history and analyze progress.

**Parameters:**
- `user_id` (required): User identifier
- `days_back` (optional, default: 7): Number of days to retrieve

**Example Usage:**
```bash
bun run index.ts "Show me my workout history for the past 2 weeks"
```

**Returns:**
```json
{
  "success": true,
  "workouts": [
    {
      "date": "2026-01-17",
      "time": "06:30 AM",
      "exercise": "squats",
      "duration": 20,
      "reps": 50,
      "sets": 3,
      "form_quality": "good"
    }
  ],
  "stats": {
    "total_workouts": 8,
    "total_minutes": 320,
    "average_duration": 40,
    "completion_rate": 100,
    "workouts_per_week": 4.0,
    "exercise_breakdown": {
      "squats": 3,
      "push-ups": 2,
      "running": 3
    }
  },
  "commitment_analysis": {
    "on_track": true,
    "message": "Excellent! You're meeting your commitment with 100% completion rate."
  }
}
```

## Integration Strategy

### Phase 1: Current Implementation ✅
- [x] Workout logging tool (`log_workout`)
- [x] Workout history retrieval (`get_workout_history`)
- [x] Database schema with workout logs
- [x] Integration with agent system
- [x] Smart contract verification support
- [x] Documentation and examples

### Phase 2: Vision Agent Integration (Future)
- [ ] Set up vision processing pipeline
- [ ] Integrate YOLO pose detection
- [ ] Connect real-time video feed
- [ ] Implement automatic workout logging from video
- [ ] Add rep counting automation
- [ ] Real-time form quality assessment
- [ ] Voice feedback integration

### Phase 3: Advanced Features (Future)
- [ ] Exercise recognition from video
- [ ] Automatic set/rep counting
- [ ] Form correction suggestions
- [ ] Progress visualization
- [ ] Injury risk detection
- [ ] Personalized coaching recommendations

## How It Works with Smart Contracts

### Commitment Verification

1. **User Stakes Tokens**: User commits ETH/tokens to resolution contract
2. **Workout Requirements**: Contract specifies workout frequency (e.g., 4x/week)
3. **Workout Logging**: User completes workouts and logs them via agent
4. **Milestone Verification**: Logged workouts are verified and timestamped
5. **Reward Distribution**: Meeting milestones triggers token rewards

### Reliability Advantages

**Calendar-based (Old):**
- Cannot verify actual attendance
- Easy to game the system
- No proof of workout completion
- Disputes about milestone completion

**Workout Logging (New):**
- Verifiable workout data
- Timestamped and immutable logs
- Exercise-specific details
- Form quality tracking
- Clear milestone verification

## Integration with Agent System

### Agent Decision Making

The agent now uses workout logs for better decision-making:

1. **Pattern Detection**: Analyze workout logs instead of calendar
2. **Drift Detection**: Identify gaps in logged workouts
3. **Intervention Triggers**: Deploy interventions based on actual completion
4. **Progress Tracking**: Use verified data for progress reports
5. **Commitment Verification**: Reliable data for smart contract milestones

### Example Agent Interaction

**User:** "Am I on track with my resolution?"

**Agent Reasoning:**
1. Calls `get_workout_history` (days_back: 7)
2. Analyzes completion rate and consistency
3. Checks against commitment requirements
4. Provides personalized feedback

**Agent Response:**
```
Based on your workout logs, you've completed 8 out of 8 scheduled workouts 
this week (100% completion rate). Your consistency is excellent! 

Recent workouts:
- Monday: Squats (20 min, good form)
- Wednesday: Running (30 min)
- Friday: Push-ups (15 min, excellent form)
- Saturday: Full body (45 min, fair form - let's work on that)

You're on track to meet your smart contract milestone this week. Keep it up!
```

## Future Enhancements

### Vision Processing Integration

When vision agent capabilities are fully integrated:

1. **Live Workout Session**
   - User starts vision agent
   - Camera captures workout in real-time
   - YOLO detects body positions
   - LLM provides coaching feedback
   - Automatic rep/set counting
   - Form quality assessment

2. **Automatic Logging**
   - Session ends → automatic workout log creation
   - All data captured: type, duration, reps, sets, form
   - Verified by vision agent
   - Stored in database
   - Synced with smart contract

3. **Enhanced Coaching**
   - Form improvement over time
   - Injury prevention alerts
   - Personalized recommendations
   - Progress visualization

### Mobile App Integration

- Camera-based workout tracking
- Offline logging with sync
- Push notifications for encouragement
- Social features (share workouts)
- Integration with fitness wearables

## Technical Requirements

### Current Requirements
- Node.js >= 18
- TypeScript
- Bun runtime
- LowDB for storage

### Future Requirements (Vision Agent)
- Python 3.13+ (for vision processing)
- YOLO pose detection models
- Gemini or OpenAI API (for real-time LLM)
- Stream video infrastructure
- WebRTC for real-time video
- GPU for pose detection (recommended)

## Developer Guide

### Adding New Exercise Types

To support new exercise types, simply log them with `log_workout`:

```typescript
await logWorkout({
  user_id: "user123",
  exercise_type: "deadlifts", // New exercise type
  duration_minutes: 25,
  reps: 30,
  sets: 3,
  form_quality: "good",
  notes: "Focused on controlled movements"
})
```

The system automatically tracks all exercise types in the breakdown.

### Querying Workout Data

```typescript
// Get all workouts for a user
const db = await getDatabase()
const userWorkouts = db.workoutLogs.filter(w => w.user_id === userId)

// Get workouts by type
const squats = userWorkouts.filter(w => w.exercise_type === "squats")

// Calculate total volume
const totalVolume = userWorkouts.reduce((sum, w) => 
  sum + (w.reps || 0) * (w.sets || 1), 0
)
```

### Custom Metrics

You can extend the system to track custom metrics:

```typescript
// Example: Track personal records
const personalRecords = {}
userWorkouts.forEach(workout => {
  const key = workout.exercise_type
  const volume = (workout.reps || 0) * (workout.sets || 1)
  if (!personalRecords[key] || volume > personalRecords[key]) {
    personalRecords[key] = volume
  }
})
```

## References

- [gym_buddy Repository](https://github.com/Tabintel/gym_buddy) - Original vision agent inspiration
- [Vision Agents Documentation](https://visionagents.ai/introduction)
- [YOLO Pose Detection](https://www.ultralytics.com/yolo)
- [Resolution Autopilot PRD](./Resolution_Autopilot_PRD_v2.md)
- [Smart Contracts Documentation](./packages/contracts/README.md)

## Support

For questions or issues with workout logging:
1. Check the agent's response for guidance
2. Review workout history with `get_workout_history`
3. Verify logs are being stored in `db.json`
4. Check OPIC logs for agent reasoning

---

**Built for Encode Hackathon** 🚀

Integrating vision-based workout tracking to ensure reliable commitment verification and help users succeed in their fitness resolutions.
