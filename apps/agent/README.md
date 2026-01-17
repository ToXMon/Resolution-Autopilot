# Resolution Autopilot Agent

Custom AI agent for behavioral pattern detection and intervention deployment.

## Setup

1. Install dependencies:
```bash
# From the root directory
pnpm install

# Or from this directory
bun install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## Usage

### Basic Usage

```bash
# Run the agent with a message
bun run index.ts "Your message here"

# Or use the start script
bun start "Your message here"
```

### Example Queries

**Check drift risk:**
```bash
bun run index.ts "Am I at risk of quitting my gym resolution?"
```

**Get intervention:**
```bash
bun run index.ts "Just got home exhausted. Should I still go to the gym?"
```

**Analyze patterns:**
```bash
bun run index.ts "Analyze my workout patterns for the last week"
```

**Request help:**
```bash
bun run index.ts "I keep missing my morning workouts. Help me stay on track."
```

## How It Works

The agent follows a simple loop:

1. **User Input** → Agent receives your message
2. **Context Building** → Loads your profile and history
3. **LLM Reasoning** → GPT-4o analyzes patterns and decides actions
4. **Tool Execution** → Calls tools (calendar, patterns, intervention)
5. **Response** → Returns analysis and recommendations

### Available Tools

- `analyze_calendar` - Reviews workout history
- `detect_patterns` - Identifies drift signals
- `book_intervention` - Schedules interventions
- `send_nudge` - Sends motivational messages
- `fetch_smart_contract` - Checks blockchain stake
- `log_to_opic` - Logs decisions for evaluation

## Development

### Hot Reload Mode

```bash
bun run dev
```

### Testing

```bash
bun test
```

### Linting

```bash
bun run lint
```

## Project Structure

```
apps/agent/
├── src/
│   ├── agent.ts         # Main agent loop
│   ├── llm.ts          # GPT-4o integration
│   ├── types.ts        # Type definitions
│   ├── systemPrompt.ts # Agent instructions
│   ├── memory.ts       # Database layer
│   ├── toolRunner.ts   # Tool dispatcher
│   ├── ui.ts          # Console UI
│   └── tools/         # Individual tools
│       ├── calendar.ts
│       ├── patterns.ts
│       ├── intervention.ts
│       ├── nudge.ts
│       ├── blockchain.ts
│       └── opic.ts
├── index.ts           # Entry point
├── db.json           # Local database (auto-generated)
└── logs/
    └── opic.json     # OPIC logs (auto-generated)
```

## Troubleshooting

### "OpenAI API key not found"

Make sure you've:
1. Created `.env` file (copy from `.env.example`)
2. Added your API key: `OPENAI_API_KEY=sk-...`
3. Restarted the agent

### "Module not found"

Install dependencies:
```bash
bun install
```

### Agent hangs or loops infinitely

The agent has a maximum of 10 iterations. If it reaches this limit, it will stop automatically.

## Architecture

This agent is built **from scratch** (no LangChain/LLaMA) following Scott Morris's pattern:

- Simple while loop for agent reasoning
- Direct OpenAI API calls with tool definitions
- JSON-based persistent storage (LowDB)
- Full transparency and observability

Perfect for demonstrating technical depth to hackathon judges! 🚀
