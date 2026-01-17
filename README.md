# Resolution Autopilot 🎯

> AI agent system that prevents resolution failure through real-time behavioral pattern detection and proactive micro-interventions

Built for the Encode Hackathon using Ryan Carson's methodology: PRD → Spec → Tasks → TDD

## 🎬 Project Overview

**The Problem:** 92% of resolutions fail by February. Not from lack of motivation, but from absence of real-time intervention at critical decision points.

**The Solution:** Resolution Autopilot uses custom AI agents (no frameworks) to:
- Detect behavioral drift signals in real-time
- Deploy personalized interventions at decision points
- Learn what works for each individual user
- Hold users accountable through blockchain-based commitment contracts

## 🏗️ Architecture

This is a **custom agent-from-scratch** implementation inspired by Scott Morris's architecture:

```
┌─────────────────────────────────────────────────┐
│          Resolution Autopilot Agent             │
├─────────────────────────────────────────────────┤
│  1. MESSAGE INTAKE (User input)                 │
│  2. CONTEXT BUILDER (Pull history, analyze)     │
│  3. LLM REASONING LOOP (GPT-4o)                 │
│  4. TOOL RUNNER (Execute tools)                 │
│  5. MEMORY MANAGEMENT (Save results)            │
│  6. REFLECTION LOOP (Learn from outcomes)       │
│  7. RESPONSE GENERATION (To user)               │
└─────────────────────────────────────────────────┘
```

### Why Custom Agent (No Frameworks)?

✅ Full transparency - judges see raw technical skill  
✅ Complete control - perfect for evaluation  
✅ Lean codebase - faster shipping  
✅ Observable - every decision logged  

## 📦 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Agent Loop** | Custom TypeScript | Full control, no black boxes |
| **LLM** | Venice AI (Llama 3.3 70B) + Google Gemini | Privacy-focused, powerful reasoning |
| **Frontend** | Next.js 15 | Fast deployment, App Router |
| **Database** | LowDB (JSON) | Simple, persistent |
| **Blockchain** | Solidity on Base L2 | Low gas, fast finality |
| **SMS** | Twilio | Multi-channel notifications |
| **Calendar** | Google Calendar API | Real calendar integration |
| **Runtime** | Bun | Fast, modern |

## 🔧 Configuration

The application requires API keys for full functionality. Copy `.env.example` to `.env` and configure:

```env
# LLM Provider (Venice AI or Gemini)
LLM_PROVIDER=venice
VENICE_API_KEY=your-venice-key
GEMINI_API_KEY=your-gemini-key

# Google Calendar (optional - falls back to mock data)
GOOGLE_CALENDAR_API_KEY=your-api-key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Twilio SMS (optional - falls back to console logging)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Blockchain (for smart contracts)
BASE_RPC_URL=https://sepolia.base.org
WALLET_PRIVATE_KEY=your-private-key
CHARITY_ADDRESS=your-charity-wallet
```

**Note**: The agent works with mock data if APIs are not configured, making it easy to demo without credentials.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Bun >= 1.0.0 (or pnpm)
- Venice AI API key (or Google Gemini API key)

### Installation

```bash
# Clone the repository
git clone https://github.com/ToXMon/Resolution-Autopilot.git
cd Resolution-Autopilot

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Add your Venice AI API key to .env
# LLM_PROVIDER=venice
# VENICE_API_KEY=your-key-here
```

### Running the Agent

```bash
# Navigate to agent directory
cd apps/agent

# Run the agent with a message
bun run index.ts "Am I at risk of quitting my gym resolution?"

# Or use pnpm
pnpm start "I missed my workout today. What should I do?"
```

### Running the Frontend

```bash
# Navigate to web directory
cd apps/web

# Install dependencies (if not already done)
pnpm install

# Start the development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Example Interactions

```bash
# Check drift risk
bun run index.ts "Just got home exhausted. Should I still go to the gym?"

# Ask for analysis
bun run index.ts "Analyze my workout patterns for the last week"

# Request intervention
bun run index.ts "I keep missing my morning workouts. Help me stay on track."

# Log a completed workout
bun run index.ts "I just finished 30 squats in 3 sets with good form"

# Check workout history
bun run index.ts "Show me my workout history for the past week"
```

## 🛠️ Available Tools

The agent has access to these tools:

1. **analyze_calendar** - Read workout history and detect patterns
2. **detect_patterns** - Analyze behavior for drift signals
3. **book_intervention** - Deploy personalized interventions
4. **send_nudge** - Send motivational messages
5. **fetch_smart_contract** - Check blockchain stake status
6. **log_to_opic** - Log decisions for evaluation
7. **log_workout** - Log completed workouts with exercise details (NEW)
8. **get_workout_history** - Retrieve verified workout logs and progress (NEW)

### Vision-Based Workout Logging

The system now includes **vision agent integration** for reliable workout tracking:

- **Verified Workout Logs**: Replace unreliable calendar-based tracking with actual workout logs
- **Form Quality Tracking**: Record exercise form quality (excellent, good, fair, needs_improvement)
- **Smart Contract Verification**: Logged workouts satisfy commitment contract requirements
- **Real-time Coaching**: Integration-ready with vision-based form coaching (inspired by [gym_buddy](https://github.com/Tabintel/gym_buddy))
- **Progress Analytics**: Track exercise types, duration, reps, sets, and improvement over time

## 📁 Project Structure

```
resolution-autopilot/
├── apps/
│   ├── agent/                    # Custom AI agent backend
│   │   ├── src/
│   │   │   ├── agent.ts         # Main agent loop
│   │   │   ├── llm.ts           # GPT-4o integration
│   │   │   ├── types.ts         # Zod schemas
│   │   │   ├── systemPrompt.ts  # Agent instructions
│   │   │   ├── memory.ts        # LowDB storage
│   │   │   ├── toolRunner.ts    # Tool dispatch
│   │   │   ├── ui.ts            # Console UI
│   │   │   └── tools/           # Individual tools
│   │   └── index.ts             # Entry point
│   └── web/                     # Next.js frontend (coming soon)
├── packages/
│   ├── contracts/               # Solidity smart contracts (coming soon)
│   └── types/                   # Shared TypeScript types (coming soon)
├── docs/
│   ├── Resolution_Autopilot_PRD_v2.md        # Product requirements
│   ├── Resolution_Autopilot_Design_Agent_v2.md  # Design specs
│   └── Resolution_Autopilot_Code_Prompts_v2.md  # Code architecture
└── README.md
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd apps/agent
bun test
```

### Linting

```bash
# Lint all code
pnpm lint

# Lint specific package
cd apps/agent
pnpm lint
```

### Development Mode

```bash
# Run agent in hot-reload mode
cd apps/agent
bun run dev
```

## 📊 OPIC Integration

All agent decisions are logged to `./logs/opic.json` for evaluation:

```json
{
  "log_id": "uuid",
  "timestamp": "ISO timestamp",
  "event_name": "drift_detected",
  "metrics": {
    "confidence": 0.87,
    "failure_risk": "high",
    "signals": ["missed 2 consecutive workouts"]
  },
  "reasoning_chain": "User shows high drift risk..."
}
```

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Monorepo setup
- [x] Agent loop implementation
- [x] Tool system
- [x] Memory management
- [x] Basic CLI interface
- [x] Venice AI & Gemini integration

### Phase 2: Core Features ✅
- [x] Frontend application (Next.js 15)
- [x] Smart contracts (CommitmentContract.sol)
- [x] Real Google Calendar integration
- [x] Twilio SMS integration
- [x] OPIC evaluation dashboard
- [x] User dashboard with metrics
- [x] Landing page with navigation
- [x] Vision-based workout logging system
- [x] Workout history and progress tracking

### Phase 3: Testing & Polish (Next)
- [ ] End-to-end integration testing
- [ ] API route connections
- [ ] Smart contract deployment to testnet
- [ ] Real-time data updates
- [ ] Performance optimization
- [ ] Accessibility testing

### Phase 4: Deployment
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Akash
- [ ] Deploy contracts to Base mainnet
- [ ] Video pitch
- [ ] Documentation updates
- [ ] Submission materials

## 📚 Documentation

- [Product Requirements Document](./Resolution_Autopilot_PRD_v2.md)
- [Design Specifications](./Resolution_Autopilot_Design_Agent_v2.md)
- [Code Architecture](./Resolution_Autopilot_Code_Prompts_v2.md)

## 🤝 Contributing

This is a hackathon project. Contributions welcome after initial submission!

## 📄 License

MIT

## 🙏 Acknowledgments

- Scott Morris for the agent-from-scratch pattern
- Ryan Carson for the PRD → Spec → Tasks → TDD methodology
- Encode Hackathon for the opportunity
- Venice AI and Google for privacy-focused LLM solutions
- [gym_buddy](https://github.com/Tabintel/gym_buddy) for vision agent workout tracking inspiration

---

Built with ❤️ for the Encode Hackathon
