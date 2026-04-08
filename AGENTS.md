# Resolution Autopilot — Agent Documentation

## Repo Purpose
AI-powered fitness accountability platform. Combines a behavioral AI agent (workout tracking, nudges, pattern analysis), vision AI workout coaching (camera-based rep counting via Gemini), blockchain accountability (staking commitments on Base), and a Next.js dashboard for users. Built as a monorepo with agent backend, web frontend, and smart contracts.

## Tech Stack
- **Agent Backend**: TypeScript, Venice AI / Gemini LLM APIs, custom agent loop
- **Frontend**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS)
- **Blockchain**: Solidity on Base (commitment contracts), Hardhat
- **Vision AI**: Gemini API for camera-based workout coaching
- **Database**: LowDB (local dev), Supabase (production)
- **Integrations**: Twilio (SMS nudges), Google Calendar, OPIC (agent observability)
- **Deployment**: Docker, Vercel (frontend), Akash (backend)

## Module Map

| Directory | Purpose |
|-----------|---------|
| `apps/agent/src/` | Agent backend — agent loop, LLM, memory, system prompt, tool runner |
| `apps/agent/src/tools/` | Agent tools — blockchain, calendar, intervention, nudge, opic, patterns, workout |
| `apps/web/app/` | Next.js App Router — dashboard, onboarding, workout pages, celebration |
| `apps/web/app/workout/` | Workout flow pages — live, rest, complete |
| `packages/contracts/` | Solidity commitment contract + deployment scripts + tests |

## Global Standards
- TypeScript strict mode
- Custom agent loop pattern (not LangChain) — see `apps/agent/src/agent.ts`
- Tool interface: each tool exports a Zod schema + executor function
- Agent communicates via structured tool calls, max 10 iterations per conversation
- Smart contract interactions via ethers.js on Base network

## Environment Setup
All env vars documented in `.env.example`. Key groups:
- **LLM**: VENICE_API_KEY + VENICE_API_URL + VENICE_MODEL (primary), GEMINI_API_KEY + GEMINI_MODEL (vision)
- **Blockchain**: BASE_RPC_URL, BASE_MAINNET_RPC_URL, WALLET_PRIVATE_KEY, CONTRACT_ADDRESS, CHARITY_ADDRESS
- **Integrations**: TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER (SMS), GOOGLE_CALENDAR_* (calendar)
- **Vision**: GOOGLE_APPLICATION_CREDENTIALS (Gemini Vision API)
- **Observability**: OPIC_API_KEY + OPIC_PROJECT_ID
- **Database**: SUPABASE_URL + SUPABASE_ANON_KEY (production), LowDB auto-activates locally

## Key Patterns

### Agent Loop
`apps/agent/src/agent.ts` implements async generator: format tools → call LLM → yield text or execute tool_calls → push results → loop (max 10 iterations).

### Tool Pattern
Each tool in `apps/agent/src/tools/` exports: Zod parameter schema + async executor returning JSON string. Tools handle: workout logging, blockchain staking, calendar scheduling, behavioral nudges, drift pattern detection.

### Vision Integration
Gemini API processes camera frames for real-time pose detection and rep counting during workouts.

### Smart Contract Accountability
Users stake crypto on fitness commitments. If they miss workouts, funds go to CHARITY_ADDRESS. Contract deployed on Base network.
