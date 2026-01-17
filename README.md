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
| **LLM** | GPT-4o (OpenAI) | Best reasoning, tool use |
| **Frontend** | Next.js 15 | Fast deployment |
| **Database** | LowDB (JSON) | Simple, persistent |
| **Blockchain** | Solidity on Base L2 | Low gas, fast finality |
| **Runtime** | Bun | Fast, modern |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Bun >= 1.0.0 (or pnpm)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/ToXMon/Resolution-Autopilot.git
cd Resolution-Autopilot

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=sk-...
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

### Example Interactions

```bash
# Check drift risk
bun run index.ts "Just got home exhausted. Should I still go to the gym?"

# Ask for analysis
bun run index.ts "Analyze my workout patterns for the last week"

# Request intervention
bun run index.ts "I keep missing my morning workouts. Help me stay on track."
```

## 🛠️ Available Tools

The agent has access to these tools:

1. **analyze_calendar** - Read workout history and detect patterns
2. **detect_patterns** - Analyze behavior for drift signals
3. **book_intervention** - Deploy personalized interventions
4. **send_nudge** - Send motivational messages
5. **fetch_smart_contract** - Check blockchain stake status
6. **log_to_opic** - Log decisions for evaluation

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

### Phase 2: Core Features (Current)
- [ ] Frontend application
- [ ] Smart contracts
- [ ] Real Google Calendar integration
- [ ] Twilio SMS integration
- [ ] OPIC dashboard

### Phase 3: Polish
- [ ] A/B testing framework
- [ ] User segmentation
- [ ] Advanced pattern detection
- [ ] Self-improvement loops

### Phase 4: Deployment
- [ ] Vercel deployment (frontend)
- [ ] Akash Network (backend)
- [ ] Base mainnet contracts
- [ ] Video pitch
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
- OpenAI for GPT-4o

---

Built with ❤️ for the Encode Hackathon
