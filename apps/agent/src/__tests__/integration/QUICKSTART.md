# Intervention Flow Test - Quick Start Guide

## What Was Created

✅ **intervention-flow.test.ts** (638 lines)
   - Complete integration test suite for autonomous intervention system
   - 6 comprehensive test scenarios
   - Tests detect → intervene → nudge → track flow

✅ **README.md** (175 lines)
   - Documentation for all integration tests
   - Explains production flow and test scenarios
   - Usage instructions and key assertions

## Running the Tests

### Run all integration tests
```bash
cd apps/agent
bun test
```

### Run only intervention flow tests
```bash
cd apps/agent
bun test src/__tests__/integration/intervention-flow.test.ts
```

### Run with verbose output
```bash
cd apps/agent
bun test --verbose
```

### Run specific test by name
```bash
cd apps/agent
bun test -t "should detect drift after 2 missed workouts"
```

## Test Scenarios at a Glance

| Test | Scenario | Expected Outcome |
|------|----------|------------------|
| **1** | User misses 2 workouts | Calendar intervention + SMS reminder |
| **2** | User at high risk | Social accountability intervention |
| **3** | User responds positively | Intervention marked successful |
| **4** | User ignores nudge | Escalates to financial warning |
| **5** | Complete escalation ladder | All 4 intervention types tested |
| **6** | Multi-channel delivery | SMS, push, email all working |

## What Each Test Verifies

### ✅ Pattern Detection
- Drift signals detected from calendar data
- Risk levels assessed (low/medium/high)
- Confidence scores calculated
- Recommendations based on past effectiveness

### ✅ Intervention Deployment
- Correct intervention type selected
- Intervention details properly configured
- Calendar events booked (with Uber)
- Social accountability deployed
- Financial stakes communicated

### ✅ Nudge Delivery
- Messages routed to correct channel (SMS/push/email)
- Urgency levels set appropriately
- Delivery status tracked
- Unique message IDs generated

### ✅ Outcome Tracking
- Interventions logged to database
- Outcomes recorded (success/failed/pending)
- User feedback captured
- Escalation paths followed

## Production Flow Tested

```
┌─────────────────────┐
│  detectPatterns()   │  ← Daily cron job
└──────────┬──────────┘
           │ drift detected
           ▼
┌─────────────────────┐
│ bookIntervention()  │  ← calendar/social/financial/message
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   sendNudge()       │  ← SMS/push/email
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User Response      │
└──────────┬──────────┘
           │
           ├─► Success → updateInterventionOutcome('success')
           │             └─► ML model learns
           │
           └─► Failed → Escalate to next tier
                        └─► Higher stakes intervention
```

## Key Files and Tools

### Test File
- `apps/agent/src/__tests__/integration/intervention-flow.test.ts`

### Tools Tested
- `tools/patterns.ts` → `detectPatterns()`
- `tools/intervention.ts` → `bookIntervention()`
- `tools/nudge.ts` → `sendNudge()`

### Database Functions
- `memory.ts` → `saveUserProfile()`, `updateInterventionOutcome()`, `getInterventions()`

### Type Definitions
- `types.ts` → `UserProfile`, `Intervention`, `PatternAnalysis`

## Common Issues and Solutions

### Issue: Bun not installed
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### Issue: Dependencies not installed
```bash
cd apps/agent
bun install
```

### Issue: Database file missing
The tests automatically create and clean the database. If you see issues:
```bash
rm -f db.json  # Remove old database
bun test       # Tests will create fresh database
```

### Issue: Twilio errors
Tests simulate SMS delivery if Twilio is not configured. To test real SMS:
```bash
# Set environment variables
export TWILIO_ACCOUNT_SID="your_account_sid"
export TWILIO_AUTH_TOKEN="your_auth_token"
export TWILIO_PHONE_NUMBER="your_twilio_number"
export TWILIO_TEST_TO_NUMBER="test_recipient_number"
```

## Next Steps

### 1. Run the Tests
```bash
cd apps/agent
bun test
```

### 2. Review Test Output
- All tests should pass
- Check for any warnings or errors
- Verify database cleanup is working

### 3. Extend the Tests
Add more scenarios:
- Test concurrent interventions for multiple users
- Test time-based triggers
- Test intervention rollback
- Test ML model integration

### 4. Integrate with CI/CD
Add to GitHub Actions workflow:
```yaml
- name: Run Integration Tests
  run: |
    cd apps/agent
    bun test
```

## Understanding the Code

### Basic Test Structure
```typescript
test('description', async () => {
  // 1. Setup user profile
  const userProfile = { ... }
  await saveUserProfile(userProfile)

  // 2. Simulate calendar data
  const calendarData = { completion_rate: 0.5, ... }

  // 3. Detect patterns
  const pattern = await detectPatterns({ 
    user_id: TEST_USER, 
    calendar_data: JSON.stringify(calendarData) 
  })

  // 4. Deploy intervention
  const intervention = await bookIntervention({ 
    user_id: TEST_USER, 
    type: 'calendar', 
    details: { ... } 
  })

  // 5. Send nudge
  const nudge = await sendNudge({ 
    user_id: TEST_USER, 
    message: '...', 
    channel: 'sms' 
  })

  // 6. Verify results
  expect(pattern.drift_detected).toBe(true)
  expect(intervention.success).toBe(true)
  expect(nudge.delivery_status).toBe('sent')
})
```

### beforeEach Cleanup
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

This ensures each test starts with a clean slate.

## Questions?

- Check `README.md` for detailed documentation
- Review existing tests in `workout-to-blockchain.test.ts` for patterns
- Look at tool implementations in `tools/` directory
- Check type definitions in `types.ts`

## Success Criteria

✅ All 6 tests pass
✅ Database cleanup working
✅ Interventions logged correctly
✅ Nudges delivered to correct channels
✅ Escalation paths followed
✅ No errors or warnings

---

**Created**: February 2025
**Framework**: Bun Test
**Pattern**: Integration testing following `workout-to-blockchain.test.ts`
