# Integration Tests

This directory contains integration tests for the Resolution Autopilot agent system.

## Test Files

### `workout-to-blockchain.test.ts`
Tests the complete workout logging and blockchain payment flow:
- User logs workouts via vision agent
- Workouts accumulate toward weekly milestones
- Smart contract verifies milestones are met
- Payment flow is triggered on successful completion

### `intervention-flow.test.ts` ✨ NEW
Tests the complete autonomous intervention system:
- **Pattern Detection**: Agent detects drift signals from user behavior
- **Intervention Deployment**: Agent books appropriate intervention (calendar/social/financial)
- **Nudge Delivery**: Agent sends timely nudges via SMS/push/email
- **Outcome Tracking**: System records user response and escalates if needed

## Test Scenarios in `intervention-flow.test.ts`

### 1. Drift Detection → Calendar Intervention
**Scenario**: User misses 2 consecutive workouts
- Agent detects 50% completion rate
- Recommends calendar intervention (based on past effectiveness)
- Books workout event for next day
- Sends SMS reminder nudge
- Verifies intervention logged as pending

### 2. High-Risk User → Social Accountability
**Scenario**: User at high risk of failure
- Agent detects 33% completion rate (4 consecutive misses)
- High confidence drift signal (>0.8)
- Recommends social intervention (most effective for this user)
- Deploys accountability buddy notification
- Sends high-urgency SMS

### 3. Positive Response → Success Tracking
**Scenario**: User responds to intervention
- Agent deploys gentle message intervention
- User completes workout within 24 hours
- Intervention marked as "success"
- Data feeds into ML model for future recommendations

### 4. Escalation Flow → Financial Warning
**Scenario**: User ignores initial interventions
- **Round 1**: Message intervention deployed → user ignores → marked "failed"
- **Round 2**: Escalate to financial intervention
- High-stakes nudge sent via SMS ($100 at immediate risk)
- Agent prepared to call smart contract forfeitCommitment() if final warning fails

### 5. Complete Escalation Ladder
**Scenario**: Tests full escalation path
- **Level 1**: Message (gentle reminder) → failed
- **Level 2**: Calendar (schedule specific time) → failed  
- **Level 3**: Social (accountability partner) → failed
- **Level 4**: Financial (final warning with stakes) → pending
- Verifies complete escalation history in database

### 6. Multi-Channel Nudge Delivery
**Scenario**: Tests all communication channels
- SMS: High-urgency reminders
- Push: Daily motivation
- Email: Weekly summaries
- Verifies unique message IDs and delivery status

## Running the Tests

```bash
# Run all integration tests
bun test

# Run specific test file
bun test apps/agent/src/__tests__/integration/intervention-flow.test.ts

# Run with verbose output
bun test --verbose

# Run specific test by name
bun test -t "should detect drift after 2 missed workouts"
```

## Test Database Cleanup

Each test uses `beforeEach` to clean the database before running:
```typescript
beforeEach(async () => {
  const db = await getDatabase()
  db.workoutLogs = []
  db.messages = []
  db.interventions = []
  db.userProfiles = []
  await saveDatabase(db)
})
```

This ensures tests are isolated and don't interfere with each other.

## Production Flow

The intervention flow tests mirror the production agent flow:

1. **Daily Pattern Analysis**
   ```
   Agent runs detectPatterns() daily
   → Analyzes calendar data, workout history, user behavior
   → Returns drift signals, risk assessment, recommended intervention
   ```

2. **Intervention Deployment**
   ```
   If drift detected → bookIntervention()
   → Calendar: Schedule workout + book Uber
   → Social: Notify accountability buddy
   → Financial: Warn about stake at risk
   → Message: Send motivational reminder
   ```

3. **Nudge Delivery**
   ```
   Intervention triggers sendNudge()
   → Routes to appropriate channel (SMS/push/email)
   → Sets urgency level based on risk
   → Logs delivery status
   ```

4. **Outcome Tracking**
   ```
   User completes/ignores intervention
   → updateInterventionOutcome('success' | 'failed' | 'skipped')
   → Data feeds ML model for personalized recommendations
   → Failed interventions trigger escalation
   ```

## Key Assertions

- ✅ Drift detection accuracy (confidence scores, risk levels)
- ✅ Correct intervention type recommendation based on user preferences
- ✅ Intervention details properly configured (times, amounts, partners)
- ✅ Nudges delivered through correct channels
- ✅ Intervention outcomes tracked in database
- ✅ Escalation ladder followed correctly
- ✅ User profile data influences recommendations

## Future Enhancements

- [ ] Test integration with Google Calendar API
- [ ] Test real Twilio SMS delivery (currently simulated)
- [ ] Test ML model recommendations (effectiveness scoring)
- [ ] Test concurrent interventions for multiple users
- [ ] Test time-based intervention triggers (scheduled jobs)
- [ ] Test intervention rollback on user request

## Tools Used

| Tool | Purpose | File |
|------|---------|------|
| `detectPatterns` | Analyze user behavior for drift signals | `tools/patterns.ts` |
| `bookIntervention` | Deploy calendar/social/financial/message interventions | `tools/intervention.ts` |
| `sendNudge` | Send SMS/push/email reminders | `tools/nudge.ts` |
| `saveUserProfile` | Store user preferences and history | `memory.ts` |
| `updateInterventionOutcome` | Track success/failure of interventions | `memory.ts` |
| `getInterventions` | Retrieve intervention history | `memory.ts` |

## Database Schema

Tests interact with these database collections:

- **userProfiles**: User settings, intervention preferences, past effectiveness
- **interventions**: Deployed interventions, outcomes, timestamps
- **workoutLogs**: Workout history (for pattern detection)
- **messages**: Agent conversation history

See `types.ts` for complete schema definitions.
