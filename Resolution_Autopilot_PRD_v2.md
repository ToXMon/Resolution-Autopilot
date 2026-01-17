# Product Requirements Document: Resolution Autopilot
## Built from Scratch (No Frameworks)

---

## Executive Summary

Resolution Autopilot is an **AI agent system** that prevents resolution failure through real-time behavioral pattern detection and proactive micro-interventions at decision points. Built using a **custom agent loop** (no LangChain/LLaMA), it demonstrates sophisticated agentic reasoning with tool use, reflection, and continuous learning.

**Why custom agents beat frameworks for this hackathon:**
- Judges see raw technical depth (not black-box frameworks)
- Full control over reasoning loops (perfect for OPIC evaluation)
- Every decision is logged and auditable (compliance + observability)
- Lean codebase (ship faster, impress with efficiency)

---

## Problem Statement

**The Real Problem (Not Surface-Level):**
- 92% of resolutions fail by February (University of Scranton)
- Root cause: NOT lack of motivation, but **absence of real-time decision-point intervention**
- Behavioral change requires 200+ micro-decisions daily that require external scaffolding
- Current apps track AFTER failure (reactive). We need PREVENTION BEFORE failure (proactive)
- Jia Chen's insight: "Most people quit because of a single missed session that creates a cascade. Stop the cascade before it starts."

**Why This Matters:**
- Fitness/wellness is the #1 abandoned category (judges noted this multiple times)
- Solves with sophisticated agentic architecture = judges cannot ignore
- Web3 commitment contracts add real stakes (actual innovation, not gimmick)
- OPIC integration = transparent agent evaluation (double prize opportunity)

---

## Target Users

**Primary:**
- 25-40 year olds who've failed 3+ resolutions
- Tech-savvy, willing to connect apps
- Value transparency + real accountability (crypto-friendly)

**Secondary:**
- Corporate wellness programs
- Fitness coaches managing cohorts
- Therapists tracking behavioral change

---

## Core Architecture: The Agent Loop

### System Design Overview

```
┌─────────────────────────────────────────────────┐
│          Resolution Autopilot Agent             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │ 1. MESSAGE INTAKE                      │   │
│  │    (User input, system state)          │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 2. CONTEXT BUILDER                      │   │
│  │    - Pull user history from DB          │   │
│  │    - Analyze calendar patterns          │   │
│  │    - Load past intervention effectiveness│   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 3. LLM REASONING LOOP (Core Agent)      │   │
│  │    Model: GPT-4o (OpenAI)               │   │
│  │    Temperature: 0.1 (deterministic)    │   │
│  │    Max Tokens: 2000                    │   │
│  │                                         │   │
│  │  System Prompt:                         │   │
│  │  "You are ResolutionGuard, an AI       │   │
│  │   behavioral coach that prevents       │   │
│  │   resolution failure. Your job:        │   │
│  │   1. Analyze patterns                  │   │
│  │   2. Detect drift signals              │   │
│  │   3. Deploy interventions              │   │
│  │   Always reason through decisions      │   │
│  │   transparently."                      │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 4. TOOL RUNNER                          │   │
│  │    LLM decides which tool to call       │   │
│  │                                         │   │
│  │    Available Tools:                     │   │
│  │    • analyze_calendar (read-only)       │   │
│  │    • detect_patterns (analysis)         │   │
│  │    • book_intervention (calendar write) │   │
│  │    • send_nudge (message delivery)      │   │
│  │    • fetch_smart_contract (blockchain) │   │
│  │    • log_to_opic (observability)        │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 5. MEMORY MANAGEMENT                    │   │
│  │    - Save tool results to DB            │   │
│  │    - Update conversation history        │   │
│  │    - Track intervention outcomes        │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 6. REFLECTION LOOP (Optional)           │   │
│  │    - Did intervention work?             │   │
│  │    - Should we adjust strategy?         │   │
│  │    - Log to OPIC for analysis           │   │
│  └──────────────────┬──────────────────────┘   │
│                     │                          │
│  ┌──────────────────▼──────────────────────┐   │
│  │ 7. RESPONSE GENERATION                  │   │
│  │    (To user + system state)             │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Agent Loop Implementation (TypeScript)

The agent operates in a simple loop similar to Scott Morris's architecture:

```typescript
// Simplified pseudocode (full implementation in code prompts)

async function runResolutionAgent(userMessage: string) {
  // 1. Add user message to conversation history
  await addMessages({ role: 'user', content: userMessage });
  
  // 2. Fetch conversation history from DB
  const history = await getMessages();
  
  // 3. Run LLM with system prompt + tools
  while (true) {
    const response = await runLLM(history, tools);
    
    // 4. If LLM returned text (final response)
    if (response.content) {
      await addMessages(response);
      return response;
    }
    
    // 5. If LLM wants to call a tool
    if (response.toolCalls) {
      const toolCall = response.toolCalls[0];
      
      // 6. Execute the tool
      const toolResult = await runTool(toolCall);
      
      // 7. Save result to history
      await addMessages({
        role: 'tool',
        content: toolResult,
        toolCallId: toolCall.id
      });
      
      // 8. Loop back: LLM now has tool result, can decide next step
    }
  }
}
```

**Key: The agent keeps looping until it decides to stop (when it returns final text response).**

---

## Core Features (MVP - Week 1-4)

### 1. Pattern Detection Agent (Week 1-2)

**What It Does:**
- Analyzes user's calendar, app activity, and behavioral history
- Identifies "drift signals": missed gym sessions, late-night food orders, skipped routines
- Uses LLM reasoning to predict failure probability in real-time
- Outputs: `{ driftDetected: boolean, confidence: 0-1, signals: string[], failureRisk: 'low'|'medium'|'high' }`

**Tools Used:**
- `analyze_calendar()` - Read user's calendar events
- `detect_patterns()` - LLM analyzes patterns, returns structured JSON
- `fetch_user_history()` - Get past resolutions + outcomes

**Example LLM Reasoning Chain:**

```
User Message: "Just got home from work. Exhausted."

[LLM Reasoning]
Thought: This is a critical decision point. User is tired, which historically leads to skipped workouts.
Looking at history:
- 3 of 4 times user was "exhausted" → skipped next workout
- Tomorrow is scheduled gym day (6am)
- User is currently 2/4 workouts this week (2 remaining)

This is a MEDIUM-HIGH drift signal. Need to intervene NOW.

Action: I should:
1. Check what usually works (analyze_calendar for similar past events)
2. Deploy intervention (book_intervention)
3. Send supportive message (send_nudge)
```

### 2. Intervention Deployment Agent (Week 2-3)

**What It Does:**
- Receives drift signal from pattern detection
- Decides which intervention to deploy based on user's profile
- Executes intervention across multiple channels
- Tracks effectiveness

**Intervention Types:**

| Type | Example | Tool Used |
|------|---------|-----------|
| **Calendar** | Auto-book 7am Uber to gym for tomorrow | `book_intervention` |
| **Financial** | "Your $100 stake covers this. Skip = lose $20" | `send_nudge` with financial context |
| **Social** | "Post to your accountability buddy" | `send_nudge` to community |
| **Temporal** | "Reschedule to evening if morning doesn't work" | `book_intervention` with flexibility |

**Tools Used:**
- `book_intervention()` - Write to Google Calendar, Uber, etc.
- `send_nudge()` - Send message (SMS, push, in-app)
- `fetch_smart_contract()` - Check user's stake status on blockchain
- `get_intervention_history()` - See what worked before

**LLM Decision Making:**

```
[LLM gets drift signal: driftDetected=true, confidence=0.87]

Thought: User is at high risk. I need to choose intervention.
Looking at user profile:
- Personality type: "external accountability" (based on past)
- Previous successful interventions: Social accountability 73%, Calendar 68%
- Failed interventions: Generic notifications 12%

Best approach: Deploy social accountability + calendar backup

Action: 
1. book_intervention(book_uber_to_gym_tomorrow)
2. send_nudge(notify_accountability_buddy)
3. log_to_opic(intervention_deployed, reasoning_chain)
```

### 3. Smart Contract Integration (Week 3)

**What It Does:**
- User stakes ETH/USDC on resolution completion
- Smart contract holds funds in escrow
- Agent can trigger milestone verifications
- On success: funds released. On failure: goes to charity.

**Contract Interactions:**
- `fetch_smart_contract(user_id)` - Check current stake amount, milestones, status
- `verify_milestone(user_id, milestone_id, proof)` - Agent submits completion proof
- User can call `claimSuccess()` or `forfeit()` directly

**Why This Matters:**
- Real accountability (not just gamification)
- Blockchain provides trustless escrow (no platform risk)
- User sees their commitment in real money
- Judges see full-stack Web3 integration

### 4. Evaluation Dashboard (OPIC Integration) (Week 4)

**What It Tracks:**

| Metric | Definition | OPIC Category |
|--------|-----------|---------------|
| `intervention_precision` | % of interventions that prevented failure | Accuracy |
| `user_retention_week_1` | % of users still engaged after week 1 | Engagement |
| `agent_reasoning_quality` | LLM-as-judge score for decision chains | Quality |
| `false_positive_rate` | % of "drift" alerts that were unnecessary | Precision |
| `intervention_effectiveness_by_type` | Which interventions work for which users | Learning |

**Dashboard Features:**
- Real-time agent trace logs (show full reasoning chain)
- Metrics dashboard (Recharts graphs)
- A/B testing interface (compare intervention strategies)
- User segmentation (which profiles benefit most)

**Why This Wins OPIC Prize:**
- Complete observability into agent decisions
- Transparent reasoning (every thought logged)
- Evaluation metrics tied to business outcomes
- Shows self-improvement (agent learns over time)

---

## Technical Architecture (No Frameworks)

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Agent Loop** | Custom TypeScript (like Scott Morris repo) | Full control, no black boxes |
| **LLM** | GPT-4o (OpenAI) | Best reasoning, tool use, cost-effective |
| **Frontend** | Next.js 15 App Router | Fast shipping, deployment to Vercel |
| **Backend** | Node.js/Express + custom agent | Minimal dependencies, easy deployment |
| **Database** | PostgreSQL (Supabase) | Structured data, reliability |
| **Messaging** | Twilio for SMS/push | Multi-channel nudges |
| **Blockchain** | Solidity on Base L2 | Low gas fees, fast finality |
| **Observability** | OPIC SDK + custom logger | Judge-grade evaluation pipeline |
| **Deployment** | Vercel (frontend) + Akash Network (backend) | Cost-efficient, decentralized |

### Agent Loop Components (Custom Implementation)

```
src/
├── agent.ts              # Main agent loop (like Scott Morris)
├── llm.ts                # GPT-4o + tool definitions (Zod schemas)
├── tools/
│   ├── calendar.ts       # Google Calendar API
│   ├── patterns.ts       # Pattern detection logic
│   ├── intervention.ts   # Deploy interventions
│   ├── blockchain.ts     # Smart contract read/write
│   ├── nudge.ts          # SMS/push notifications
│   └── opic.ts           # OPIC logging
├── memory.ts             # Conversation history (JSON-based like Scott Morris)
├── types.ts              # Zod schemas for type safety
├── systemPrompt.ts       # LLM system message
└── db.ts                 # Database layer (Supabase)
```

### Deployment Architecture

```
┌─────────────────────────┐
│  Vercel (Frontend)      │
│  - Next.js 15 App       │
│  - RainbowKit wallet    │
│  - OPIC dashboard       │
└────────────┬────────────┘
             │
             ├─────────────────────────────┐
             │                             │
┌────────────▼───────────┐    ┌───────────▼────────────┐
│ Akash Network          │    │ Base Chain             │
│ (Backend Agent Loop)   │    │ (Smart Contracts)      │
│ - Docker container     │    │ - CommitmentContract   │
│ - FastAPI if needed    │    │ - MilestoneVerifier    │
│ - Agent orchestration  │    │ - Charity Distribution │
└────────────┬───────────┘    └───────────┬────────────┘
             │                             │
             └──────────┬──────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
    ┌─────▼────┐  ┌────▼────┐  ┌────▼────┐
    │ Supabase │  │  OPIC   │  │ Twilio  │
    │ (Data)   │  │ (Evals) │  │ (Msgs)  │
    └──────────┘  └─────────┘  └─────────┘
```

---

## User Flow

### Day 1: Onboarding

```
1. User connects wallet (MetaMask/Coinbase)
2. Sets resolution: "Gym 4x/week for 8 weeks"
3. Stakes $100 USDC (smart contract holds)
4. Grants permissions:
   - Calendar read access
   - Location (optional, opt-in)
   - Notification delivery
5. System sets 4 milestones (2 weeks each)
```

### Daily: Pattern Detection Loop

```
Every 6 hours:
1. Agent analyzes:
   - Calendar: Did user complete scheduled workouts?
   - Location: Is user at gym?
   - App activity: Are they planning?
2. If drift detected:
   - Send alert to user
   - Suggest intervention
   - Log to OPIC
3. If no drift:
   - Encourage message
   - Update progress UI
```

### Intervention Flow (When Drift Detected)

```
[Pattern detection: High drift risk detected]
  ↓
[Agent decides intervention type based on profile]
  ↓
[Execute intervention:]
  - Book Uber to gym tomorrow
  - Send accountability message
  - Show progress at risk visualization
  ↓
[Track outcome:]
  - Did user go to gym?
  - Did intervention help?
  - Update intervention effectiveness score
```

### Weekly: Milestone Check

```
Every 14 days:
1. Agent verifies milestone completion
2. Submits proof to smart contract
3. Contract releases funds (if successful)
4. User sees progress + earnings
5. OPIC logs success metrics
```

### End of Resolution (Week 8)

```
Scenario A: Success
  - User completed 8 weeks
  - Smart contract releases $100 + 10% bonus ($110)
  - User gets NFT badge
  - Resolution marked complete

Scenario B: Failure
  - User abandons before completion
  - Smart contract sends $100 to charity
  - User gets option to restart with lower stake
  - OPIC logs failure reason + intervention gaps
```

---

## Success Metrics

### Primary KPIs

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Completion Rate** | 60%+ | vs 8% industry baseline (7.5x improvement) |
| **Week 4 Retention** | 75%+ | Most quit by week 3 |
| **Intervention Precision** | 85%+ true positives | Don't annoy users with false alerts |
| **User Satisfaction** | 4.5/5+ stars | Intervention should feel helpful, not creepy |

### OPIC Evaluation Metrics

| Metric | Definition |
|--------|-----------|
| `intervention_quality_score` | LLM-as-judge evaluating each intervention decision |
| `reasoning_transparency` | % of decisions with full chain-of-thought logged |
| `self_improvement_delta` | Agent accuracy improvement over time |
| `user_satisfaction_correlation` | Does higher OPIC score = higher user satisfaction? |

### Financial Metrics (Web3)

| Metric | Definition |
|--------|-----------|
| `stake_conversion` | % of users who stake real funds (proves they care) |
| `successful_payouts` | $ distributed to users who completed |
| `charitable_distributions` | $ sent to charities from failures |

---

## Why This Wins

### ✅ Solves Most-Abandoned Category
- Fitness/wellness: 92% failure rate
- Judges explicitly highlighted: "January gym hater here"
- You: Proven solution with agentic architecture

### ✅ Sophisticated Agentic Architecture
- Custom agent loop (shows technical depth)
- Tool use with structured reasoning
- Reflection + learning capabilities
- Transparent decision chains (OPIC-ready)

### ✅ Web3 Integration (Actual Value)
- Smart contracts for trustless accountability
- User stakes real money (psychological commitment)
- Blockchain provides immutability (user can verify outcomes)
- NOT a gimmick - solving real problem

### ✅ OPIC Prize Winner
- Complete observability pipeline
- Evaluation metrics tied to business outcomes
- Self-improving system (learns what works)
- Can win BOTH Health/Wellness AND OPIC prize

### ✅ Built from Scratch
- No LangChain/LLaMA/frameworks
- Custom agent loop (judges see raw skill)
- Lean, efficient codebase
- Full control over reasoning

---

## Timeline (4 Weeks)

### Week 1: Foundation (Days 1-7)
- [ ] Day 1: Monorepo setup, agent loop architecture
- [ ] Day 2: LLM integration + tool definitions (Zod schemas)
- [ ] Day 3: Pattern detection tools (calendar, history analysis)
- [ ] Day 4: Basic frontend (onboarding, dashboard stub)
- [ ] Day 5: Memory/DB layer (Supabase)
- [ ] Day 6: Testing + logging framework
- [ ] Day 7: **DEMO 1**: Working agent that detects patterns

**Deliverable**: Agent can analyze user data, detect drift signals, log reasoning

### Week 2: Agent Capabilities (Days 8-14)
- [ ] Day 8: Intervention tools (calendar booking, notifications)
- [ ] Day 9: Smart contract integration (read stake status)
- [ ] Day 10: Multi-turn agent loops (agent calls multiple tools)
- [ ] Day 11: Reflection pattern (agent evaluates its own decisions)
- [ ] Day 12: Nudge delivery system (Twilio integration)
- [ ] Day 13: OPIC integration (log all decisions)
- [ ] Day 14: **DEMO 2**: End-to-end intervention flow

**Deliverable**: Agent can detect drift AND deploy interventions

### Week 3: Polish + OPIC (Days 15-21)
- [ ] Day 15: Smart contract deployment (Base testnet)
- [ ] Day 16: Wallet integration (RainbowKit)
- [ ] Day 17: OPIC evaluation dashboard
- [ ] Day 18: A/B testing framework (compare intervention strategies)
- [ ] Day 19: UI design system (dark theme, professional)
- [ ] Day 20: Video pitch script + storyboards
- [ ] Day 21: **DEMO 3**: Full system with OPIC observability

**Deliverable**: Production-ready system with transparent evaluation

### Week 4: Launch Ready (Days 22-28)
- [ ] Day 22: Deploy to Vercel (frontend) + Akash (backend)
- [ ] Day 23: Smart contract mainnet preparation
- [ ] Day 24: Security audit (code review + contract tests)
- [ ] Day 25: Record video pitch (3 minutes max)
- [ ] Day 26: Write case study (OPIC results + user testimonial)
- [ ] Day 27: Final UI polish + accessibility testing
- [ ] Day 28: **SUBMISSION**: Everything ready for judges

**Deliverable**: Polished, deployed, documented project

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Privacy concerns with location | High | Make location optional; process locally where possible |
| Smart contract bugs | Critical | Extensive testing on testnet; use OpenZeppelin libraries |
| Agent makes bad decisions | High | OPIC tracks this; user can always override |
| Intervention fatigue (too many nudges) | Medium | OPIC tracks user satisfaction; back off if drops below 3/5 |
| Integration complexity | Medium | Use established APIs (Google Cal, Twilio, Supabase) |

---

## Why Custom Agent Architecture Wins (vs Frameworks)

| Aspect | Custom (Scott Morris Style) | LangChain/LLaMA |
|--------|---------------------------|-----------------|
| **Observability** | Perfect (you log everything) | Black box tool calls |
| **OPIC Prize** | ✅ Judges see full transparency | ❌ Can't show reasoning |
| **Code Size** | ~500 LOC agent loop | 2000+ LOC abstraction |
| **Control** | Complete | Limited by framework |
| **Shipping Speed** | Week 1 working prototype | Week 1 framework debugging |
| **Judge Impression** | "Built from first principles" | "Used a library" |

---

## Submission Checklist

- [ ] GitHub repo public (clean commit history, no mega-commits)
- [ ] Video pitch (3 min: problem → solution → demo → why agents matter)
- [ ] Hosted site deployed (Vercel + Akash)
- [ ] Smart contract on Base testnet (with verified source)
- [ ] OPIC evaluation results (screenshot dashboard)
- [ ] Case study (how agent performance improved over time)
- [ ] README with setup instructions (ship-in-place code)
- [ ] Accessibility audit (WCAG AA)

---

## Why You Win

**Pieter Levels** says: Ship fast, iterate faster. ✅ Custom agent = lean codebase = Week 1 MVP

**Jia Chen** says: Solve the real problem. ✅ Prevent failure at decision points (not surface-level tracking)

**Nader Dabit** says: Use Web3 where it adds value. ✅ Smart contracts for trustless accountability

**Judges** will see:
1. Sophisticated agentic reasoning (custom loop)
2. Transparent agent decisions (OPIC dashboard)
3. Novel solution to most-abandoned category (fitness)
4. Potential for 2 prizes (Health/Wellness + OPIC)
5. Production-ready code (not prototype)

**They cannot ignore this.**

---

## Go Build

Week 1 focus: Get working agent that detects patterns + deploys one intervention.

The rest flows naturally from there.

You got this. 🚀
