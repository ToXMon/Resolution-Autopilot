# Code Prompts: Resolution Autopilot
## Agent-From-Scratch Architecture (No Frameworks)

**Architecture Reference**: Scott Morris's agent-from-scratch (hendrixer/agent-from-scratch)
**Goal**: Custom agent loop with tool calling, memory management, and OPIC logging

---

## 1. Project Setup & Monorepo Structure

### Prompt for Cursor/Windsurf

```
Create a monorepo project structure for Resolution Autopilot using:
- Bun as runtime (fast, like Scott Morris repo)
- TypeScript for all code
- pnpm workspaces for package management

Structure:
```
resolution-autopilot/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── onboarding/
│   │   │   └── evaluation/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── agent/                  # Agent backend (like Scott Morris)
│       ├── src/
│       │   ├── agent.ts        # Main agent loop
│       │   ├── llm.ts          # GPT-4o integration
│       │   ├── types.ts        # Zod schemas
│       │   ├── systemPrompt.ts
│       │   ├── memory.ts       # Conversation history + DB
│       │   ├── toolRunner.ts   # Tool execution
│       │   └── tools/
│       │       ├── index.ts
│       │       ├── calendar.ts
│       │       ├── patterns.ts
│       │       ├── intervention.ts
│       │       ├── blockchain.ts
│       │       ├── nudge.ts
│       │       └── opic.ts
│       ├── db.json             # In-memory DB like Scott Morris
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── contracts/
│   │   │   ├── CommitmentContract.sol
│   │   │   └── MilestoneVerifier.sol
│   │   ├── hardhat.config.ts
│   │   └── package.json
│   └── types/                  # Shared types
│       ├── index.ts
│       └── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

Setup files needed:
- pnpm-workspace.yaml
- Root package.json
- .env.example (with OPENAI_API_KEY, SUPABASE_URL, etc.)
- tsconfig.json (root)
- .gitignore

Include bun install instructions in README.
```

---

## 2. Agent Loop Implementation (Core)

### Prompt for Cursor/Windsurf

```
Build the main agent loop in src/agent.ts following Scott Morris's pattern.

Key requirements:
1. async function runResolutionAgent(userMessage: string, tools: any[])
2. Main loop structure:
   a. Add user message to conversation history
   b. Fetch full conversation history from memory
   c. Call LLM with messages + tools
   d. If response has content → return (agent done)
   e. If response has toolCalls → execute tool, add result to history, loop back
3. Use for/while loop with proper exit conditions
4. Log all decisions to console (for debugging)
5. Export as default

Import dependencies:
- addMessages, getMessages, saveToolResponse from ./memory
- runLLM from ./llm
- runTool from ./toolRunner
- showLoader, logMessage from ./ui

Return type: Promise<AIMessage[]> (full conversation history)

Make it exactly like Scott Morris's agent.ts but with ResolutionGuard-specific comments.
```

### agent.ts Code Structure

```typescript
import type { AIMessage } from '../types'
import { addMessages, getMessages, saveToolResponse } from './memory'
import { runLLM } from './llm'
import { showLoader, logMessage } from './ui'
import { runTool } from './toolRunner'

export const runAgent = async (
  userMessage: string,
  tools: any[]
): Promise<AIMessage[]> => {
  // 1. User input
  await addMessages({ role: 'user', content: userMessage })
  
  // 2. Main loop
  const loader = showLoader('Analyzing patterns...')
  
  while (true) {
    const history = await getMessages()
    const response = await runLLM(history, tools)
    
    // 3. If LLM has final answer
    if (response.content) {
      loader.stop()
      logMessage(response)
      await addMessages(response)
      return history
    }
    
    // 4. If LLM wants to use tools
    if (response.toolCalls) {
      const toolCall = response.toolCalls[0]
      logMessage(response) // Log "calling tool X"
      loader.update(`Executing: ${toolCall.function.name}`)
      
      const toolResult = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResult)
      
      loader.update(`Done: ${toolCall.function.name}`)
    }
  }
}

export default runAgent
```

---

## 3. LLM Integration with Tool Definitions

### Prompt for Cursor/Windsurf

```
Create src/llm.ts that integrates OpenAI GPT-4o with tool definitions.

Requirements:
1. Import OpenAI from 'openai'
2. Use zodFunction helper from @openai/zod-functions (or manually create tool defs)
3. Create runLLM function: async (messages: AIMessage[], tools: any[])
4. Use GPT-4o model with:
   - temperature: 0.1 (deterministic reasoning)
   - max_tokens: 2000
   - tool_choice: 'auto'
   - parallel_tool_calls: false
5. Include system prompt from ./systemPrompt
6. Return response.choices[0].message

Tool definitions should be formatted as OpenAI function schemas.
All tools must have:
- name: string
- description: string
- parameters: { type: 'object', properties: {...}, required: [...] }

Import openai instance from ./ai.ts

Example tool def (generateImage):
{
  "name": "analyze_calendar",
  "description": "Read user's calendar events to detect patterns and drift signals",
  "parameters": {
    "type": "object",
    "properties": {
      "days_back": { "type": "number", "description": "How many days back to analyze" }
    },
    "required": ["days_back"]
  }
}
```

### Key Tools to Define (in zodFunction format or manual)

```
Tools needed:
1. analyze_calendar(days_back: number) → calendar events JSON
2. detect_patterns(user_id: string) → drift signals array
3. book_intervention(type: 'calendar'|'message'|'financial', details: {}) → confirmation
4. send_nudge(message: string, channel: 'sms'|'push'|'email') → delivery confirmation
5. fetch_smart_contract(user_id: string) → stake info JSON
6. log_to_opic(event_name: string, metrics: {}) → OPIC response
```

---

## 4. System Prompt (LLM Behavior)

### Prompt for Cursor/Windsurf

```
Create src/systemPrompt.ts with a detailed system prompt for ResolutionGuard agent.

Requirements:
1. Export const systemPrompt: string
2. Define agent personality: "You are ResolutionGuard, an AI behavioral coach"
3. Core responsibilities:
   - Analyze user patterns to detect failure risk
   - Deploy interventions at decision points
   - Track outcomes
   - Reason transparently about decisions
4. When deciding what to do:
   - Use analyze_calendar to see patterns
   - Use detect_patterns for risk assessment
   - Choose intervention based on user profile
   - Use send_nudge to deliver intervention
   - Log everything to OPIC for evaluation
5. Format: Multi-line template string with clear sections

Sections:
- Identity: Who you are
- Goal: What you're trying to do
- Rules: How to behave
- Tool usage: When to use which tool
- Output format: How to communicate
- Safety: What NOT to do (don't make false promises, always ask permission before calendar write)

Example snippet:
"You are ResolutionGuard, an AI behavioral coach. Your job:
1. Help users complete their resolutions through proactive intervention
2. Detect when users are at risk of quitting
3. Deploy personalized interventions
4. Track outcomes and learn what works

Rules:
- Always explain your reasoning
- Never intervene without cause
- Respect user privacy
- Log all decisions for transparency
- If unsure, ask user for permission"
```

---

## 5. Memory Management (DB + Conversation History)

### Prompt for Cursor/Windsurf

```
Create src/memory.ts following Scott Morris's LowDB pattern.

Requirements:
1. Use lowdb for JSON-based persistent storage (like db.json)
2. Database schema:
   {
     "messages": [
       {
         "id": uuid,
         "role": "user"|"assistant"|"tool",
         "content": string,
         "toolCallId"?: string,
         "createdAt": ISO timestamp
       }
     ],
     "userProfiles": [{ user_id, resolution, history... }],
     "interventions": [{ intervention_id, user_id, type, outcome... }]
   }
3. Export functions:
   - getDb() → Promise<Database>
   - addMessages(...messages: AIMessage[]) → Promise<void>
   - getMessages() → Promise<AIMessage[]>
   - saveToolResponse(toolCallId, result) → Promise<void>
   - getUserProfile(user_id) → Promise<UserProfile>
   - logIntervention(user_id, intervention) → Promise<void>

4. Use Zod for type safety on database writes
5. Handle file write errors gracefully

Metadata handling:
- When storing messages, add: { id: uuid(), createdAt: new Date().toISOString() }
- When retrieving, strip metadata (return clean AIMessage[])
```

### Database Schema (Types)

```typescript
interface AIMessage {
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCallId?: string
}

interface MessageWithMetadata extends AIMessage {
  id: string
  createdAt: string
}

interface UserProfile {
  user_id: string
  resolution: string
  start_date: string
  stake_amount: number
  intervention_preferences: {
    social: boolean
    financial: boolean
    calendar: boolean
  }
  past_interventions: Array<{ type: string; effectiveness: number }>
}

interface Intervention {
  intervention_id: string
  user_id: string
  type: 'calendar' | 'message' | 'financial'
  triggered_by: string
  deployed_at: string
  outcome: 'success' | 'skipped' | 'failed'
  user_feedback?: string
}
```

---

## 6. Tool Definitions (Individual Files)

### Prompt for Cursor/Windsurf - Calendar Tool

```
Create src/tools/calendar.ts

A tool that reads user's Google Calendar and detects patterns.

Function signature:
export const analyzeCalendarToolDefinition = { name: 'analyze_calendar', ... }
export const analyzeCalendar: ToolFn<{days_back: number}, string> = async (input) => {
  // Read calendar events
  // Analyze for:
  // - Scheduled workout times
  // - Cancellations/gaps
  // - Drift signals
  // Return JSON with analysis
}

For hackathon MVP: Mock implementation returning realistic data:
{
  "events": [
    { "date": "2025-01-16", "time": "6:00 AM", "title": "Gym - Legs", "completed": true },
    { "date": "2025-01-17", "time": "6:00 AM", "title": "Gym - Chest", "completed": false },
    { "date": "2025-01-18", "time": "6:00 AM", "title": "Gym - Arms", "completed": false }
  ],
  "drift_signals": [
    { "signal": "Missed 2 consecutive workouts", "severity": "high" },
    { "signal": "No workout scheduled for tomorrow", "severity": "medium" }
  ],
  "completion_rate": 0.33
}

Later: Integrate real Google Calendar API (google-auth-library-nodejs)
```

### Prompt for Cursor/Windsurf - Pattern Detection

```
Create src/tools/patterns.ts

This tool uses LLM to analyze patterns and detect failure risk.

Function:
export const detectPatterns: ToolFn<{user_id: string}, string> = async (input) => {
  // 1. Fetch user history from memory
  // 2. Analyze patterns:
  //    - Missed sessions trend
  //    - Time of day patterns
  //    - Trigger events (tiredness, work stress)
  // 3. Calculate failure probability
  // 4. Identify which interventions worked before
  // 5. Return structured assessment

  Return:
  {
    "drift_detected": boolean,
    "confidence": 0-1,
    "signals": ["missed 2 consecutive", "no future bookings"],
    "failure_risk": "low" | "medium" | "high",
    "recommended_intervention": "calendar" | "message" | "financial",
    "reasoning": "User history shows... therefore..."
  }
}

Use for hackathon: Rule-based logic + LLM reasoning
Later: Pure LLM analysis with prompt chains
```

### Prompt for Cursor/Windsurf - Intervention Booking

```
Create src/tools/intervention.ts

Deploy interventions (calendar blocking, notifications, etc.)

Function:
export const bookIntervention: ToolFn<{
  type: 'calendar' | 'message' | 'financial',
  details: Record<string, any>
}, string> = async (input) => {
  switch(input.type) {
    case 'calendar':
      // Google Calendar API: Create event
      // Block calendar at specific time
      // Add description: "Intervention: Prevent resolution failure"
      return { success: true, event_id: '...', message: 'Calendar blocked' }
    
    case 'message':
      // Twilio: Send SMS/push with intervention message
      return { success: true, message_id: '...', delivery_status: 'sent' }
    
    case 'financial':
      // Show user their stake at risk
      // Financial incentive reminder
      return { success: true, message: 'Financial nudge sent' }
  }
}

For MVP: Simulate responses
Later: Integrate real APIs
```

### Prompt for Cursor/Windsurf - Blockchain Integration

```
Create src/tools/blockchain.ts

Read smart contract state and verify milestones.

Functions:
export const fetchSmartContract: ToolFn<{user_id: string}, string>
export const verifyMilestone: ToolFn<{user_id: string, milestone_id: string, proof: string}, string>

For hackathon MVP:
- Mock Ethereum/Base responses
- Return realistic contract state: { stake: '100 USDC', status: 'active', milestones_completed: 2 }
- Simulate milestone verification

Later:
- Use ethers.js to connect to Base testnet
- Call smart contract read functions
- Submit milestone proofs (off-chain data signed by agent)

Example response:
{
  "user_id": "user_123",
  "stake_amount": "100 USDC",
  "status": "active",
  "milestones": [
    { "id": 1, "target_date": "2025-01-30", "completed": true },
    { "id": 2, "target_date": "2025-02-13", "pending": true }
  ],
  "current_earnings": "10 USDC bonus"
}
```

### Prompt for Cursor/Windsurf - Nudge Delivery

```
Create src/tools/nudge.ts

Send intervention messages to user.

Function:
export const sendNudge: ToolFn<{
  message: string,
  channel: 'sms' | 'push' | 'email',
  user_id: string
}, string> = async (input) => {
  // For MVP: Log to console
  console.log(`[NUDGE - ${input.channel}] ${input.message}`)
  
  // Later: Integrate Twilio for SMS/push
  // Later: Sendgrid for email
  
  return {
    success: true,
    channel: input.channel,
    message_id: uuid(),
    delivery_status: 'pending'
  }
}

Nudge templates:
- Social: "Your accountability buddy is counting on you! 💪"
- Financial: "Your $100 stake is at risk. Complete today's workout? 🎯"
- Temporal: "Reschedule tomorrow? I can find a better time. 📅"
```

### Prompt for Cursor/Windsurf - OPIC Logging

```
Create src/tools/opic.ts

Log agent decisions and metrics to OPIC for evaluation.

Function:
export const logToOPIC: ToolFn<{
  event_name: string,
  metrics: Record<string, any>,
  reasoning_chain?: string
}, string> = async (input) => {
  // For MVP: Log to JSON file + console
  // Later: Send to OPIC API
  
  const log_entry = {
    timestamp: new Date().toISOString(),
    event: input.event_name,
    metrics: input.metrics,
    reasoning: input.reasoning_chain
  }
  
  // Append to logs/opic.json
  // Also: Print nice formatted output
  
  return { success: true, log_id: uuid() }
}

Events to log:
- "drift_detected" → { confidence, signals, failure_risk }
- "intervention_deployed" → { type, user_response, effectiveness }
- "milestone_verified" → { milestone_id, proof, result }
- "user_sentiment" → { satisfaction_score, feedback }
```

---

## 7. Tool Runner (Dispatcher)

### Prompt for Cursor/Windsurf

```
Create src/toolRunner.ts - executes individual tools based on LLM decision.

Function:
export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
): Promise<string> => {
  const input = { userMessage, toolArgs: JSON.parse(toolCall.function.arguments) }
  
  switch (toolCall.function.name) {
    case 'analyze_calendar':
      return await analyzeCalendar(input.toolArgs)
    case 'detect_patterns':
      return await detectPatterns(input.toolArgs)
    case 'book_intervention':
      return await bookIntervention(input.toolArgs)
    case 'send_nudge':
      return await sendNudge(input.toolArgs)
    case 'fetch_smart_contract':
      return await fetchSmartContract(input.toolArgs)
    case 'log_to_opic':
      return await logToOPIC(input.toolArgs)
    default:
      return `Unknown tool: ${toolCall.function.name}`
  }
}

Import all tools from ./tools/index.ts
Return stringified JSON for LLM to parse
```

---

## 8. UI/Logging (Console Output)

### Prompt for Cursor/Windsurf

```
Create src/ui.ts - pretty console output + loading spinners.

Functions:
1. showLoader(text: string) → { stop, succeed, fail, update }
2. logMessage(message: AIMessage) → void

Requirements:
- Use ora for spinners
- Color-code messages:
  * User: Cyan
  * Assistant: Green
  * Tool: Yellow
- For assistant messages with tool calls: show which tools are being called
- For tool results: show "Tool X completed"

Example output:
```
👤 User
Detect if I'm at risk of quitting my gym resolution

🤖 Assistant
Analyzing patterns...

⚙️  Tool: analyze_calendar
  → Completed in 250ms

⚙️  Tool: detect_patterns
  → Completed in 150ms

🤖 Assistant
Based on your patterns, you're at MEDIUM-HIGH risk...
```

Use colors from ora/chalk library.
```

---

## 9. Entry Point (index.ts)

### Prompt for Cursor/Windsurf

```
Create index.ts at root of agent app.

Minimal entry point:
```typescript
import 'dotenv/config'
import runAgent from './src/agent'
import { tools } from './src/tools'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

await runAgent(userMessage, tools)
```

Should work with: `bun run index.ts "your message here"`
```

---

## 10. Package.json Configuration

### Prompt for Cursor/Windsurf

```
Create package.json for agent app with:

Scripts:
- "start": "bun run index.ts"
- "dev": "bun run --hot index.ts"
- "test": "bun test"
- "lint": "eslint src --fix"

Dependencies:
- openai: "latest" (GPT-4o)
- dotenv: "latest" (env vars)
- lowdb: "latest" (JSON DB like Scott Morris)
- uuid: "latest" (ID generation)
- zod: "latest" (type validation)
- ora: "latest" (spinners)
- chalk: "latest" (colors - already in ora)
- @openai/zod-functions: "latest" (tool definitions)

DevDependencies:
- @types/bun: "latest"
- @types/node: "latest"
- typescript: "latest"
- eslint: "latest"

Config:
- type: "module" (ES modules)
- engines: { node: ">=18" }
```

---

## 11. TypeScript Types (Zod Schemas)

### Prompt for Cursor/Windsurf

```
Create src/types.ts with all type definitions.

Export:
1. AIMessage (from OpenAI)
2. ToolFn<A, T> generic type for tool functions
3. UserProfile, Intervention, CalendarEvent schemas with Zod
4. ResolutionAgent type
5. ToolDefinition type

Use Zod for runtime validation:
```typescript
const UserProfileSchema = z.object({
  user_id: z.string(),
  resolution: z.string(),
  start_date: z.string().datetime(),
  stake_amount: z.number().positive(),
  intervention_preferences: z.object({
    social: z.boolean(),
    financial: z.boolean(),
    calendar: z.boolean()
  })
})

export type UserProfile = z.infer<typeof UserProfileSchema>
```

This ensures type safety everywhere.
```

---

## 12. Deployment Scripts (Week 4)

### Prompt for Cursor/Windsurf

```
Create deployment automation:

1. Dockerfile for agent backend:
   - FROM oven/bun:latest
   - COPY . .
   - RUN bun install
   - CMD ["bun", "run", "index.ts"]
   - Expose port 3001

2. Akash SDL file (akash.yaml):
   - Define compute: 1 vCPU, 1GB RAM
   - Expose HTTP port 3001
   - Set environment variables
   - Include pricing strategy

3. Script: deploy-to-akash.sh
   - Build Docker image
   - Push to registry
   - Deploy using Akash CLI
   - Output deployment URL

4. GitHub Actions workflow (.github/workflows/deploy.yml):
   - On push to main: test → build → deploy
   - Run TypeScript checks
   - Run agent tests
   - Deploy to Akash

Include health check endpoint: GET /health → { status: 'ok' }
```

---

## Implementation Order (Build This Way)

### Week 1
1. ✅ Project setup (monorepo, package.json, tsconfig)
2. ✅ Types.ts (all TypeScript definitions)
3. ✅ Memory.ts (LowDB setup)
4. ✅ LLM.ts (OpenAI integration)
5. ✅ SystemPrompt.ts (agent instructions)
6. ✅ Agent.ts (main loop - copy Scott Morris pattern)
7. ✅ ToolRunner.ts (dispatcher)
8. ✅ Basic tools (calendar, patterns mock implementations)
9. ✅ UI.ts (console output)
10. ✅ Index.ts (entry point)
11. ✅ Test end-to-end agent loop

### Week 2-4
- Add remaining tools (intervention, blockchain, nudge, OPIC)
- Frontend integration
- Smart contracts
- OPIC dashboard
- Deployment

---

## Testing Strategy

### Prompt for Cursor/Windsurf

```
Create simple tests using Bun's test runner.

Test structure:
- src/__tests__/agent.test.ts
- src/__tests__/llm.test.ts
- src/__tests__/tools.test.ts

Focus:
1. Agent loop completes (doesn't hang)
2. Tools return valid JSON
3. Memory saves/retrieves messages correctly
4. Zod validation works
5. Multiple turns work (user message → tool call → tool result → agent response)

Run with: bun test
```

---

## Quick Reference: Scott Morris Pattern

```
// The essence of the agent loop (copy this pattern)

while (true) {
  // Get all history
  const history = await getMessages()
  
  // Call LLM
  const response = await runLLM(history, tools)
  
  // If done: return
  if (response.content) {
    await addMessages(response)
    return
  }
  
  // If tool call: execute and loop
  if (response.toolCalls) {
    const result = await runTool(response.toolCalls[0])
    await addMessages({ role: 'tool', content: result, toolCallId: ... })
    // Loop back automatically
  }
}
```

This is it. Simple, elegant, full control.
```

---

## Environment Variables

```
.env file needed:
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
GOOGLE_CALENDAR_API_KEY=...
TWILIO_AUTH_TOKEN=...
BASE_RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x...
OPIC_API_KEY=...
```

---

## Why This Works

✅ **Simple**: Main loop is ~20 lines of code  
✅ **Transparent**: Every decision is logged  
✅ **Powerful**: Tool use + LLM reasoning = sophisticated behavior  
✅ **Fast to ship**: Week 1 working prototype  
✅ **Perfect for judges**: Raw technical skill, no framework black boxes  

Go build. 🚀
