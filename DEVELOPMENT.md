# Development Guide - Resolution Autopilot

## Getting Started with Development

### Initial Setup

1. **Clone and Install**
```bash
git clone https://github.com/ToXMon/Resolution-Autopilot.git
cd Resolution-Autopilot
pnpm install
```

2. **Configure Environment**
```bash
cd apps/agent
cp .env.example .env
# Edit .env and add your VENICE_API_KEY or GEMINI_API_KEY
```

3. **Test the Agent**
```bash
bun run index.ts "Am I at risk of quitting?"
```

## Development Workflow

### Phase 4: Testing & Validation (Current Phase)

#### Task List
- [ ] Set up Venice AI or Gemini API key
- [ ] Test basic agent queries
- [ ] Validate all tool executions
- [ ] Check OPIC logging
- [ ] Write unit tests
- [ ] Verify error handling

#### Testing Commands

**Test Pattern Detection:**
```bash
bun run index.ts "Analyze my workout patterns for the last 7 days"
```

**Test Drift Detection:**
```bash
bun run index.ts "I missed 2 workouts this week. Am I failing?"
```

**Test Intervention:**
```bash
bun run index.ts "Just got home exhausted. Need help staying on track"
```

**Test Smart Contract:**
```bash
bun run index.ts "Show me my stake status"
```

### Expected Output

When the agent runs successfully, you should see:

1. **Welcome Banner**
```
============================================================
  Resolution Autopilot - AI Behavioral Coach
============================================================
```

2. **User Message** (cyan)
```
👤 User
Your message here
```

3. **Agent Thinking** (with spinner)
```
⠋ Thinking...
⠋ Analyzing patterns...
⠋ Executing: analyze_calendar...
```

4. **Tool Calls** (yellow)
```
⚙️  Calling tool: analyze_calendar
   Arguments: { "user_id": "demo_user_001", "days_back": 7 }

⚙️  Tool Response
{
  "events": [...],
  "drift_signals": [...],
  "completion_rate": 0.33
}
```

5. **Agent Response** (green)
```
🤖 ResolutionGuard
Based on your patterns, you're at MEDIUM-HIGH risk...
```

6. **OPIC Logs**
```
📊 [OPIC] Logged event: drift_detected
   Metrics: {"confidence":0.87,"failure_risk":"high"}
```

### Debugging

#### Enable Verbose Logging

Edit `apps/agent/src/ui.ts` to add more console logs:
```typescript
console.log('[DEBUG]', ...args)
```

#### Check Database State

```bash
cat apps/agent/db.json | jq
```

#### View OPIC Logs

```bash
cat apps/agent/logs/opic.json | jq
```

#### Clear State

```bash
# Remove database
rm apps/agent/db.json

# Remove logs
rm -rf apps/agent/logs

# Agent will reinitialize on next run
```

## Code Structure

### Agent Loop Flow

```
index.ts
  ↓
agent.ts (runAgent)
  ↓
1. Add user message to history
  ↓
2. Loop:
   a. Get full history
   b. Call LLM with tools
   c. If response.content → Done
   d. If response.toolCalls → Execute tools
   e. Add tool results to history
   f. Loop back to step 2
```

### Adding a New Tool

1. Create tool file: `apps/agent/src/tools/mytool.ts`

```typescript
import type { ToolDefinition, ToolFn } from '../types.js'

export const myToolDefinition: ToolDefinition = {
  name: 'my_tool',
  description: 'What this tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '...' }
    },
    required: ['param1']
  }
}

export const myTool: ToolFn<{param1: string}, string> = async (input) => {
  // Tool logic here
  return JSON.stringify({ result: 'success' })
}
```

2. Export from `tools/index.ts`:
```typescript
import { myTool, myToolDefinition } from './mytool.js'

export const toolDefinitions = [
  // ... existing tools
  myToolDefinition,
]

export const tools = {
  // ... existing tools
  my_tool: myTool,
}
```

3. Update system prompt if needed in `systemPrompt.ts`

### Modifying Agent Behavior

Edit `apps/agent/src/systemPrompt.ts` to change:
- Agent personality
- Reasoning process
- Tool usage guidelines
- Output format

The system prompt is the "brain" of the agent!

## Testing Strategy

### Manual Testing Checklist

- [ ] Agent starts without errors
- [ ] Demo data initializes
- [ ] Calendar analysis returns realistic data
- [ ] Pattern detection identifies drift
- [ ] Interventions are logged
- [ ] OPIC logs are created
- [ ] Agent completes within max iterations
- [ ] Error messages are clear

### Automated Testing (TODO)

Create `apps/agent/src/__tests__/agent.test.ts`:

```typescript
import { test, expect } from 'bun:test'
import { runAgent } from '../agent'

test('agent completes simple query', async () => {
  const result = await runAgent('Hello')
  expect(result).toBeDefined()
  expect(result.length).toBeGreaterThan(0)
})

test('agent calls tools', async () => {
  const result = await runAgent('Analyze my patterns')
  // Check that tool calls were made
  const toolMessages = result.filter(m => m.role === 'tool')
  expect(toolMessages.length).toBeGreaterThan(0)
})
```

Run tests:
```bash
bun test
```

## Next Steps

### Phase 5: Frontend Development

1. Initialize Next.js app:
```bash
cd apps/web
pnpm create next-app@latest . --typescript --tailwind --app
```

2. Create API route to agent:
```typescript
// apps/web/app/api/agent/route.ts
import { runAgent } from '@resolution-autopilot/agent'

export async function POST(req: Request) {
  const { message } = await req.json()
  const result = await runAgent(message)
  return Response.json({ result })
}
```

3. Build UI components from design specs

### Phase 6: Smart Contracts

1. Initialize Hardhat:
```bash
cd packages/contracts
pnpm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. Write contracts following PRD specs

### Phase 7: Integration

1. Connect frontend to agent API
2. Connect frontend to smart contracts
3. Test end-to-end flows
4. Deploy to staging

## Troubleshooting

### Common Issues

**Issue: "Cannot find module"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Issue: "OpenAI API error"**
```bash
# Solution: Check API key and quota
echo $VENICE_API_KEY or GEMINI_API_KEY
# Verify at platform.openai.com
```

**Issue: "Agent loops infinitely"**
```bash
# Solution: Check MAX_ITERATIONS in agent.ts
# Default is 10, increase if needed
```

**Issue: "Tool not found"**
```bash
# Solution: Ensure tool is exported in tools/index.ts
# and added to toolRunner.ts switch statement
```

## Performance Tips

1. **Reduce token usage**: Edit systemPrompt.ts to be more concise
2. **Faster tool execution**: Mock external APIs during development
3. **Quick iteration**: Use `bun run dev` for hot reload
4. **Parallel testing**: Run multiple queries with different sessions

## Code Quality

### Before Committing

```bash
# Format code
pnpm run lint

# Run tests
pnpm test

# Check types
cd apps/agent
tsc --noEmit
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-tool

# Make changes and test
bun run index.ts "test query"

# Commit with clear message
git add .
git commit -m "Add new tool: feature_name"

# Push and create PR
git push origin feature/new-tool
```

## Resources

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Zod Documentation](https://zod.dev)
- [LowDB Guide](https://github.com/typicode/lowdb)
- [Bun Documentation](https://bun.sh/docs)
- [Scott Morris's Agent Repo](https://github.com/hendrixer/agent-from-scratch)

## Support

For issues or questions:
1. Check the README files
2. Review the PRD and design docs
3. Look at example queries in this guide
4. Open a GitHub issue

Happy coding! 🚀
