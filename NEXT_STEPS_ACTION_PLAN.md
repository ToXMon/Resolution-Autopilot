# Phase 3 Next Steps - Action Plan

> **Quick Start**: This document provides immediate actionable steps to continue Phase 3 implementation.

---

## 🎯 Current Status

**Completed** (30%):
- ✅ Integration test suite (3/5 test files)
- ✅ Rate limiting library with Redis
- ✅ Comprehensive implementation plan

**Next Sprint Goals** (Complete remaining 70%):
- Complete rate limiting middleware
- Run and validate all tests
- Begin database migration
- Start smart contract audit

---

## 🚀 Immediate Next Steps (Priority Order)

### Step 1: Complete Rate Limiting Middleware (30 minutes)

Create `apps/web/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRedis } from './lib/redis'
import { apiRateLimiter } from './lib/rate-limit'

export async function middleware(request: NextRequest) {
  // Initialize rate limiter with Redis
  const redis = getRedis()
  const limiter = apiRateLimiter(redis || undefined)
  
  // Get user identifier (IP address or user ID from session)
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
  
  // Check rate limit
  const result = await limiter.checkLimit(identifier)
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil(result.resetMs / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(Date.now() + result.resetMs),
        },
      }
    )
  }
  
  // Add rate limit headers to response
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Date.now() + result.resetMs))
  
  return response
}

// Apply middleware to API routes only
export const config = {
  matcher: '/api/:path*',
}
```

**Test it**:
```bash
cd apps/web
# Create .env.local
echo "REDIS_URL=redis://localhost:6379" > .env.local
pnpm dev

# Test rate limiting
curl -I http://localhost:3000/api/agent
# Should see X-RateLimit-* headers
```

---

### Step 2: Run Integration Tests (15 minutes)

```bash
cd apps/agent

# Install dependencies if needed
bun install

# Run all tests
bun test

# Run specific test file
bun test src/__tests__/integration/workout-to-blockchain.test.ts

# Run with coverage
bun test --coverage
```

**Expected Results**:
- All tests should pass
- If any failures, review and fix
- Document any issues found

**Common Issues**:
- Missing environment variables (add to `.env`)
- LowDB file permissions (delete `db.json` and retry)
- Tool function import errors (check paths)

---

### Step 3: Create Missing Integration Tests (1 hour)

#### Calendar Integration Test

Create `apps/agent/src/__tests__/integration/calendar-integration.test.ts`:

```typescript
import { describe, test, expect, beforeEach } from 'bun:test'
import { analyzeCalendar } from '../../tools/calendar.js'
import { getDatabase, saveDatabase } from '../../memory.js'

describe('Google Calendar Integration', () => {
  beforeEach(async () => {
    const db = await getDatabase()
    db.messages = []
    await saveDatabase(db)
  })

  test('should fetch real calendar events when configured', async () => {
    // Skip if Google Calendar not configured
    if (!process.env.GOOGLE_CALENDAR_CLIENT_ID) {
      console.log('⏭️  Skipping: Google Calendar not configured')
      return
    }

    const result = await analyzeCalendar({
      user_id: 'test_user',
      days_back: 7,
    })

    const data = JSON.parse(result)
    expect(data.success).toBe(true)
    expect(data.events).toBeDefined()
  })

  test('should use mock data when Google Calendar not configured', async () => {
    // Force mock data by clearing env vars
    const originalKey = process.env.GOOGLE_CALENDAR_CLIENT_ID
    delete process.env.GOOGLE_CALENDAR_CLIENT_ID

    const result = await analyzeCalendar({
      user_id: 'test_user',
      days_back: 7,
    })

    const data = JSON.parse(result)
    expect(data.success).toBe(true)
    expect(data.events).toBeDefined()
    expect(data.events.length).toBeGreaterThan(0)

    // Restore env var
    if (originalKey) process.env.GOOGLE_CALENDAR_CLIENT_ID = originalKey
  })

  test('should detect workout events correctly', async () => {
    const result = await analyzeCalendar({
      user_id: 'test_user',
      days_back: 7,
    })

    const data = JSON.parse(result)
    const workoutEvents = data.events.filter((e: any) => 
      e.title.toLowerCase().includes('gym') ||
      e.title.toLowerCase().includes('workout') ||
      e.title.toLowerCase().includes('exercise')
    )

    // Should have at least some workout events in mock data
    expect(workoutEvents.length).toBeGreaterThan(0)
  })
})
```

#### Twilio Integration Test

Create `apps/agent/src/__tests__/integration/twilio-integration.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test'
import { sendNudge } from '../../tools/nudge.js'

describe('Twilio SMS Integration', () => {
  test('should send real SMS when Twilio configured', async () => {
    // Skip if Twilio not configured
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log('⏭️  Skipping: Twilio not configured')
      return
    }

    // Use test phone number (won't actually send)
    const result = await sendNudge({
      user_id: 'test_user',
      message: 'Test nudge from integration test',
      channel: 'sms',
      urgency: 'low',
      user_phone: process.env.TEST_PHONE_NUMBER || '+15555551234',
    })

    const data = JSON.parse(result)
    expect(data.success).toBe(true)
    expect(data.channel).toBe('sms')
  })

  test('should use mock delivery when Twilio not configured', async () => {
    // Force mock by clearing env vars
    const originalSid = process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_ACCOUNT_SID

    const result = await sendNudge({
      user_id: 'test_user',
      message: 'Test nudge',
      channel: 'sms',
      urgency: 'medium',
      user_phone: '+15555551234',
    })

    const data = JSON.parse(result)
    expect(data.success).toBe(true)
    expect(data.message_id).toContain('mock_')

    // Restore env var
    if (originalSid) process.env.TWILIO_ACCOUNT_SID = originalSid
  })
})
```

---

### Step 4: Install Required Dependencies (10 minutes)

```bash
# Install Redis client
cd apps/web
pnpm add redis
pnpm add -D @types/redis

# Install Prisma for database migration (next step)
pnpm add @prisma/client
pnpm add -D prisma

# Install k6 for load testing (later)
# (k6 is installed globally, not as npm package)
brew install k6  # macOS
# OR download from https://k6.io/docs/get-started/installation/
```

---

### Step 5: Start Database Migration (2-3 hours)

#### Create Prisma Schema

Create `packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String          @id @default(uuid())
  address         String          @unique
  email           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  workoutLogs     WorkoutLog[]
  commitments     Commitment[]
  interventions   Intervention[]
  
  @@map("users")
}

model WorkoutLog {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  exerciseType    String
  durationMinutes Int
  reps            Int?
  sets            Int?
  formQuality     String          @default("good")
  verified        Boolean         @default(false)
  timestamp       DateTime        @default(now())
  notes           String?
  
  @@map("workout_logs")
  @@index([userId, timestamp])
}

model Commitment {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stakeAmount     String          // BigInt as String for ETH amounts
  resolutionGoal  String
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean         @default(true)
  isCompleted     Boolean         @default(false)
  createdAt       DateTime        @default(now())
  
  milestones      Milestone[]
  
  @@map("commitments")
  @@index([userId, isActive])
}

model Milestone {
  id              String          @id @default(uuid())
  commitmentId    String
  commitment      Commitment      @relation(fields: [commitmentId], references: [id], onDelete: Cascade)
  
  targetDate      DateTime
  isCompleted     Boolean         @default(false)
  completedDate   DateTime?
  proofHash       String?
  
  @@map("milestones")
  @@index([commitmentId])
}

model Intervention {
  id              String          @id @default(uuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type            String          // calendar, message, financial, social
  urgency         String          // low, medium, high
  deployedAt      DateTime        @default(now())
  completedAt     DateTime?
  effectiveness   Float?
  details         Json
  
  @@map("interventions")
  @@index([userId, deployedAt])
}
```

#### Initialize Prisma

```bash
cd packages/database
npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

#### Update Environment Variables

```bash
# Add to .env
DATABASE_URL="postgresql://user:password@localhost:5432/resolution_autopilot?schema=public"
```

---

### Step 6: Setup Local PostgreSQL (30 minutes)

#### Option A: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: resolution_autopilot_db
    environment:
      POSTGRES_USER: resolution
      POSTGRES_PASSWORD: autopilot_dev
      POSTGRES_DB: resolution_autopilot
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U resolution"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: resolution_autopilot_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Start services**:
```bash
docker-compose up -d
```

#### Option B: Cloud Database

Use a managed database service:
- **Supabase** (PostgreSQL + Redis) - Free tier available
- **Railway** - Easy PostgreSQL + Redis setup
- **Render** - PostgreSQL + Upstash Redis

---

### Step 7: Run Smart Contract Security Audit (2-3 hours)

#### Manual Security Review Checklist

Create `packages/contracts/docs/SECURITY_AUDIT_CHECKLIST.md`:

```markdown
# Smart Contract Security Audit Checklist

## ✅ Reentrancy Protection
- [x] Uses OpenZeppelin ReentrancyGuard
- [x] All external calls use nonReentrant modifier
- [ ] Check: Does `_completeCommitment` handle reentrancy correctly?
- [ ] Test: Create reentrancy attack test

## ✅ Access Control
- [x] Uses OpenZeppelin Ownable
- [x] Only owner can set charity address
- [x] Only owner can set bonus percentage
- [ ] Check: Can users manipulate milestone completion?

## ✅ Integer Overflow/Underflow
- [x] Solidity 0.8+ has automatic checks
- [ ] Check: Bonus calculation doesn't overflow
- [ ] Test: Create overflow test with max uint256

## ⚠️ External Calls Safety
- [ ] Review: `call{value}` in line 134 and 149
- [ ] Add: Check return value size (prevents return bomb)
- [ ] Add: Gas limit for external calls
- [ ] Test: What if receiver contract reverts?

## ⚠️ Front-Running Protection
- [ ] Check: Can milestone completion be front-run?
- [ ] Check: Can commitment creation be MEV-attacked?
- [ ] Add: Consider using commit-reveal pattern for milestone proof

## ❌ Emergency Pause Mechanism
- [ ] Missing: No circuit breaker for emergencies
- [ ] Add: Pausable pattern from OpenZeppelin
- [ ] Add: Emergency withdrawal function

## ❌ Upgrade Path
- [ ] Missing: No upgrade mechanism
- [ ] Decision: Use UUPS proxy pattern or deploy new version?
- [ ] Consider: Data migration strategy

## 💰 Gas Optimization
- [ ] Review: Loop in `createCommitment` (line 82-90)
- [ ] Check: Can be gas-griefed with large `_totalMilestones`?
- [ ] Add: Maximum milestone limit

## 🔒 Additional Security Checks
- [ ] Timestamp manipulation (milestone deadlines)
- [ ] DoS with large arrays
- [ ] Charity address validation on transfers
- [ ] Contract balance management (where does bonus come from?)
```

#### Run Automated Security Tools

```bash
cd packages/contracts

# Install Slither (static analysis)
pip3 install slither-analyzer

# Run Slither
slither contracts/CommitmentContract.sol

# Install Mythril (symbolic execution)
pip3 install mythril

# Run Mythril
myth analyze contracts/CommitmentContract.sol
```

---

## 📋 Summary of Next Steps

| Step | Priority | Time | Status |
|------|----------|------|--------|
| 1. Complete rate limiting middleware | 🔴 High | 30m | ⏳ TODO |
| 2. Run integration tests | 🔴 High | 15m | ⏳ TODO |
| 3. Create missing tests | 🟡 Medium | 1h | ⏳ TODO |
| 4. Install dependencies | 🔴 High | 10m | ⏳ TODO |
| 5. Start database migration | 🔴 High | 3h | ⏳ TODO |
| 6. Setup PostgreSQL + Redis | 🔴 High | 30m | ⏳ TODO |
| 7. Smart contract audit | 🔴 Critical | 3h | ⏳ TODO |

**Total Estimated Time**: ~8-10 hours

---

## 🎯 Success Criteria

After completing these steps, you should have:

✅ Rate limiting working in production  
✅ All integration tests passing  
✅ Database migrated to PostgreSQL  
✅ Redis setup and working  
✅ Smart contract security reviewed  
✅ Security audit documented  

---

## 📞 Getting Help

If you encounter issues:

1. **Integration Tests Failing**: Check the test README and QUICKSTART guides
2. **Rate Limiting Issues**: Review Redis connection logs
3. **Database Migration**: Check Prisma documentation
4. **Smart Contract Security**: Consult OpenZeppelin security docs

---

## 🚀 After Phase 3

Once Phase 3 is complete, proceed to:

1. **Phase 4**: Production deployment, multi-region setup, social features
2. **Phase 5**: Advanced AI features (multi-exercise detection, AR, wearables)

Refer to `PHASE_3_4_5_IMPLEMENTATION_PLAN.md` for full details.

---

**Good luck! 🎉**

