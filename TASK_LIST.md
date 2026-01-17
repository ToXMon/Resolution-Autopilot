# Resolution Autopilot - Task List
## Following Ryan Carson's Methodology: PRD → Spec → Tasks → TDD

This document provides an iterative, week-by-week task breakdown for building the Resolution Autopilot hackathon project.

---

## 📋 Ryan Carson's Methodology

1. **PRD (Product Requirements Document)** ✅
   - See: `Resolution_Autopilot_PRD_v2.md`
   - Defines WHAT we're building and WHY

2. **Spec (Design Specifications)** ✅
   - See: `Resolution_Autopilot_Design_Agent_v2.md`
   - Defines HOW it looks and feels

3. **Tasks (This Document)** ✅
   - Breaks down work into actionable items
   - Organized by week and priority

4. **TDD (Test-Driven Development)** 🔄
   - Write tests first, then implementation
   - Validate as we build

---

## 🎯 Project Status Overview

### ✅ COMPLETED: Weeks 1-2 Foundation
- [x] Monorepo setup with pnpm workspaces
- [x] TypeScript configuration
- [x] Core agent loop (Scott Morris pattern)
- [x] All 8 tools implemented (calendar, patterns, intervention, nudge, blockchain, OPIC, workout logging, workout history)
- [x] Memory management with LowDB
- [x] System prompt with agent instructions
- [x] Console UI with colored output
- [x] Comprehensive documentation
- [x] Vision agent integration for workout logging
- [x] Workout verification system for smart contracts

### 🔄 IN PROGRESS: Week 2 Testing & Iteration
- [ ] Install dependencies and test locally
- [ ] Validate tool execution (including new workout tools)
- [ ] Write unit tests
- [ ] Iterate on agent responses

### 📅 UPCOMING: Weeks 3-4
- [ ] Frontend application with workout logging UI
- [ ] Smart contracts with verified workout milestones
- [ ] OPIC dashboard
- [ ] Vision agent real-time integration (Phase 2)
- [ ] Deployment

---

## Week 1-2: Core Agent System ✅

### Day 1-2: Setup & Architecture ✅
- [x] Initialize monorepo structure
- [x] Configure TypeScript and build tools
- [x] Setup environment variables
- [x] Create README and documentation

### Day 3-4: Agent Loop ✅
- [x] Implement types and schemas (Zod)
- [x] Build LLM integration (GPT-4o)
- [x] Create main agent loop
- [x] Add tool runner and dispatcher

### Day 5-6: Tools Implementation ✅
- [x] Calendar analysis tool (mock data)
- [x] Pattern detection tool
- [x] Intervention booking tool
- [x] Nudge delivery tool
- [x] Blockchain integration tool
- [x] OPIC logging tool

### Day 7: Testing & Documentation ✅
- [x] Console UI with colors
- [x] Memory management (LowDB)
- [x] System prompt
- [x] Development guide
- [x] README files

---

## Week 2-3: Testing & Frontend

### Phase 4: Testing & Validation (Days 8-10)

#### Priority 1: Get Agent Running
- [ ] **Task 4.1**: Install dependencies
  ```bash
  pnpm install
  ```
  - **Success Criteria**: No installation errors
  - **Test**: `pnpm --version` works

- [ ] **Task 4.2**: Setup Venice AI or Gemini API key
  ```bash
  cd apps/agent
  cp .env.example .env
  # Add VENICE_API_KEY or GEMINI_API_KEY to .env
  ```
  - **Success Criteria**: Key is valid
  - **Test**: Make a simple API call

- [ ] **Task 4.3**: Run first agent query
  ```bash
  bun run index.ts "Hello, are you working?"
  ```
  - **Success Criteria**: Agent responds without errors
  - **Test**: See colored console output

#### Priority 2: Validate Tool Execution
- [ ] **Task 4.4**: Test calendar analysis
  ```bash
  bun run index.ts "Analyze my workout patterns for the last week"
  ```
  - **Success Criteria**: 
    - Tool is called
    - Returns realistic calendar data
    - Shows completion rate
  - **Test**: Check db.json for saved messages

- [ ] **Task 4.5**: Test pattern detection
  ```bash
  bun run index.ts "Am I at risk of failing my resolution?"
  ```
  - **Success Criteria**:
    - Calls analyze_calendar first
    - Then calls detect_patterns
    - Returns drift assessment
  - **Test**: Check OPIC logs for reasoning

- [ ] **Task 4.6**: Test intervention deployment
  ```bash
  bun run index.ts "I'm struggling to stay on track. Help me."
  ```
  - **Success Criteria**:
    - Detects drift
    - Recommends intervention
    - Calls book_intervention
    - Logs to OPIC
  - **Test**: Verify intervention in db.json

- [ ] **Task 4.7**: Test blockchain integration
  ```bash
  bun run index.ts "Show me my stake status"
  ```
  - **Success Criteria**:
    - Calls fetch_smart_contract
    - Returns stake info
    - Shows milestones
  - **Test**: Verify mock contract data

#### Priority 3: Write Unit Tests
- [ ] **Task 4.8**: Test agent loop
  ```typescript
  // apps/agent/src/__tests__/agent.test.ts
  test('agent completes query', async () => {
    const result = await runAgent('test')
    expect(result.length).toBeGreaterThan(0)
  })
  ```

- [ ] **Task 4.9**: Test tools individually
  ```typescript
  test('calendar tool returns data', async () => {
    const result = await analyzeCalendar({ user_id: 'test', days_back: 7 })
    const data = JSON.parse(result)
    expect(data.events).toBeDefined()
  })
  ```

- [ ] **Task 4.10**: Test memory management
  ```typescript
  test('messages are saved', async () => {
    await addMessages({ role: 'user', content: 'test' })
    const messages = await getMessages()
    expect(messages.length).toBeGreaterThan(0)
  })
  ```

#### Priority 4: Iterate on Agent Behavior
- [ ] **Task 4.11**: Refine system prompt
  - Test different queries
  - Note where agent gets confused
  - Update systemPrompt.ts
  - Re-test

- [ ] **Task 4.12**: Improve tool descriptions
  - Review LLM's tool selection
  - Make descriptions clearer
  - Add more examples

- [ ] **Task 4.13**: Optimize response quality
  - Test edge cases
  - Handle errors gracefully
  - Add validation

### Phase 5: Frontend Application (Days 11-14)

#### Priority 1: Setup Next.js
- [ ] **Task 5.1**: Initialize Next.js app
  ```bash
  cd apps/web
  pnpm create next-app@latest . --typescript --tailwind --app
  ```

- [ ] **Task 5.2**: Configure Tailwind with design tokens
  - Copy color palette from design doc
  - Add custom fonts (Space Grotesk, Inter)
  - Setup dark mode

- [ ] **Task 5.3**: Create base layout
  - App shell with navigation
  - Dark theme by default
  - Responsive design

#### Priority 2: Build Core Pages
- [ ] **Task 5.4**: Onboarding flow (3 screens)
  - Screen 1: Problem framing
  - Screen 2: Solution reveal
  - Screen 3: Commitment contract
  - Navigation between screens

- [ ] **Task 5.5**: Dashboard page
  - Today's status section
  - Pattern visualization
  - Intervention proposals
  - Agent reasoning panel (expandable)

- [ ] **Task 5.6**: API route to agent
  ```typescript
  // app/api/agent/route.ts
  export async function POST(req: Request) {
    const { message } = await req.json()
    // Call agent backend
    return Response.json({ result })
  }
  ```

#### Priority 3: Build Components
- [ ] **Task 5.7**: PatternCard component
  - 7-day timeline visualization
  - Completion stats
  - Drift signals
  - Hover states

- [ ] **Task 5.8**: InterventionCard component
  - Intervention proposal UI
  - Accept/Customize/Dismiss buttons
  - Shows reasoning

- [ ] **Task 5.9**: ReasoningPanel component
  - Expandable agent reasoning
  - Monospace font for logs
  - Syntax highlighting

- [ ] **Task 5.10**: SmartContractWidget
  - Stake status
  - Milestone progress
  - Earnings display
  - Link to Etherscan

---

## Week 3: Smart Contracts & OPIC

### Phase 6: Smart Contracts (Days 15-17)

#### Priority 1: Setup Hardhat
- [ ] **Task 6.1**: Initialize Hardhat project
  ```bash
  cd packages/contracts
  pnpm add --save-dev hardhat @nomicfoundation/hardhat-toolbox
  npx hardhat init
  ```

- [ ] **Task 6.2**: Configure for Base L2
  ```typescript
  // hardhat.config.ts
  networks: {
    baseSepolia: {
      url: process.env.BASE_RPC_URL,
      accounts: [process.env.WALLET_PRIVATE_KEY]
    }
  }
  ```

#### Priority 2: Write Contracts
- [ ] **Task 6.3**: CommitmentContract.sol
  - Escrow for user stakes
  - Milestone verification based on workout logs
  - Success/failure logic
  - Charity distribution

- [ ] **Task 6.4**: MilestoneVerifier.sol
  - Off-chain proof verification
  - Agent signature validation
  - Workout log verification
  - Milestone completion tracking

- [ ] **Task 6.5**: Write contract tests
  ```bash
  npx hardhat test
  ```

- [ ] **Task 6.6**: Integrate workout logs with smart contracts
  - Connect log_workout to milestone tracking
  - Verify workout completion for payments
  - Test milestone verification with workout data

#### Priority 3: Deploy & Integrate
- [ ] **Task 6.7**: Deploy to testnet
  ```bash
  npx hardhat run scripts/deploy.ts --network baseSepolia
  ```

- [ ] **Task 6.8**: Verify on Etherscan
  ```bash
  npx hardhat verify --network baseSepolia DEPLOYED_ADDRESS
  ```

- [ ] **Task 6.9**: Update blockchain tool with real contract
  - Replace mock data
  - Use ethers.js
  - Test read/write operations
  - Connect workout logs to contract verification

### Phase 6.5: Vision Agent Workout Logging (Days 17-18) ✅

#### Priority 1: Core Logging System ✅
- [x] **Task 6.5.1**: Create log_workout tool
  - Record exercise type, duration, reps, sets
  - Track form quality
  - Store in database with verification status
  - Calculate user statistics

- [x] **Task 6.5.2**: Create get_workout_history tool
  - Retrieve workout logs by date range
  - Calculate completion rates
  - Analyze commitment status
  - Group by exercise type

- [x] **Task 6.5.3**: Update database schema
  - Add WorkoutLog type
  - Include in DatabaseSchema
  - Support all workout fields

- [x] **Task 6.5.4**: Integrate with agent system
  - Add tools to tool definitions
  - Export from tools/index.ts
  - Update system prompt with workout logging instructions

#### Priority 2: Documentation ✅
- [x] **Task 6.5.5**: Create VISION_AGENT_INTEGRATION.md
  - Document architecture and data model
  - Provide usage examples
  - Explain smart contract integration
  - Outline future enhancement roadmap

- [x] **Task 6.5.6**: Update README.md
  - Add workout logging to tool list
  - Include example interactions
  - Update roadmap with vision agent features
  - Add gym_buddy acknowledgment

- [x] **Task 6.5.7**: Update TASK_LIST.md
  - Reflect completed vision agent tasks
  - Update smart contract integration tasks
  - Add future vision processing tasks

#### Priority 3: Future Enhancements (Phase 2)
- [ ] **Task 6.5.8**: Real-time vision processing setup
  - Install Python dependencies (vision-agents, YOLO)
  - Configure video stream infrastructure
  - Set up pose detection pipeline
  - Test with sample workout videos

- [ ] **Task 6.5.9**: Automatic workout detection
  - Implement exercise recognition from video
  - Add automatic rep/set counting
  - Calculate form quality from pose data
  - Auto-log workouts after session ends

- [ ] **Task 6.5.10**: Real-time coaching integration
  - Voice feedback during exercises
  - Form correction suggestions
  - Progress tracking visualization
  - Integration with web UI

### Phase 7: OPIC Dashboard (Days 18-19)

#### Priority 1: Data Collection
- [ ] **Task 7.1**: Enhance OPIC logging
  - Log more events
  - Add timestamps
  - Track user sessions

- [ ] **Task 7.2**: Calculate metrics
  - Intervention precision
  - User satisfaction
  - Completion rate vs baseline
  - Agent reasoning quality

#### Priority 2: Dashboard UI
- [ ] **Task 7.3**: Create evaluation page
  - 4 key metric cards
  - Sparkline charts
  - Trend indicators

- [ ] **Task 7.4**: Agent trace viewer
  - Full reasoning chains
  - Tool execution logs
  - Timeline of decisions

- [ ] **Task 7.5**: A/B test results
  - Compare intervention strategies
  - User segmentation
  - Effectiveness by type

---

## Week 4: Polish & Deployment

### Phase 8: Polish (Days 20-21)

- [ ] **Task 8.1**: Error handling
  - Graceful degradation
  - User-friendly messages
  - Logging for debugging

- [ ] **Task 8.2**: Performance optimization
  - Code splitting
  - Lazy loading
  - Caching strategies

- [ ] **Task 8.3**: Accessibility audit
  - WCAG AA compliance
  - Keyboard navigation
  - Screen reader support

- [ ] **Task 8.4**: Cross-browser testing
  - Chrome, Firefox, Safari
  - Mobile responsive
  - Touch interactions

### Phase 9: Deployment (Days 22-28)

- [ ] **Task 9.1**: Create Dockerfile
- [ ] **Task 9.2**: Deploy frontend to Vercel
- [ ] **Task 9.3**: Deploy backend to Akash
- [ ] **Task 9.4**: Setup CI/CD with GitHub Actions
- [ ] **Task 9.5**: Deploy contracts to mainnet (if ready)
- [ ] **Task 9.6**: Record video pitch (3 minutes)
- [ ] **Task 9.7**: Write case study
- [ ] **Task 9.8**: Prepare submission materials
- [ ] **Task 9.9**: Final testing
- [ ] **Task 9.10**: Submit to hackathon

---

## 🎯 Current Priority: Phase 4 Testing

**Next immediate steps:**

1. Install dependencies: `pnpm install`
2. Setup .env with OpenAI key
3. Run first test: `bun run index.ts "Hello"`
4. Validate all tools work
5. Write unit tests
6. Iterate on responses

**Success criteria for Phase 4:**
- Agent runs without errors ✓
- All 6 tools execute successfully
- OPIC logs are generated
- Unit tests pass
- Agent provides helpful responses

---

## 📊 Progress Tracking

Use this checklist format in your development:

```markdown
- [ ] Task not started
- [x] Task completed
- [~] Task in progress
- [!] Task blocked
```

Update this file as you complete tasks and commit regularly!

---

## 🚀 Quick Reference

**Test the agent:**
```bash
cd apps/agent
bun run index.ts "Your query here"
```

**Check logs:**
```bash
cat db.json | jq
cat logs/opic.json | jq
```

**Run tests:**
```bash
bun test
```

**Start fresh:**
```bash
rm db.json
rm -rf logs
```

---

## 📚 Related Documents

- [Product Requirements](./Resolution_Autopilot_PRD_v2.md) - What we're building
- [Design Specifications](./Resolution_Autopilot_Design_Agent_v2.md) - How it looks
- [Code Architecture](./Resolution_Autopilot_Code_Prompts_v2.md) - How it's built
- [Development Guide](./DEVELOPMENT.md) - How to develop
- [README](./README.md) - Quick start guide

---

**Built for Encode Hackathon using Ryan Carson's methodology** 🚀
