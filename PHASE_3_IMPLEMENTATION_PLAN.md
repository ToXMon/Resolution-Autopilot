# Phase 3 Implementation Plan

## Context
Complete missing production-ready features for Resolution Autopilot hackathon demo.

## Requirements Summary

### 1. End-to-End Integration Testing ✅
- Test agent tools integration
- Test frontend pages and components  
- Test smart contract functions
- Ensure all systems work together

### 2. API Rate Limiting and Throttling ✅
- Add HTTP server for agent backend
- Implement rate limiting middleware
- Add throttling for LLM calls
- Proper error responses for rate limits

### 3. Database Connection Pooling ✅
- Implement connection pooling for LowDB
- Add database connection management
- Handle concurrent access properly
- Document upgrade path to PostgreSQL

### 4. Redis Session Management ✅
- Add Redis client setup
- Implement session middleware
- Handle concurrent users properly
- Add session cleanup/expiry

### 5. Performance Optimization ✅
- Ensure agent responds in < 2 seconds
- Add caching layer (Redis)
- Optimize LLM calls
- Add performance monitoring

## Architecture Changes

### New Components

```
apps/agent/
├── src/
│   ├── server.ts                 # NEW: HTTP server with rate limiting
│   ├── middleware/
│   │   ├── rateLimit.ts         # NEW: Rate limiting middleware
│   │   ├── session.ts           # NEW: Session management
│   │   └── cache.ts             # NEW: Caching layer
│   ├── db/
│   │   └── pool.ts              # NEW: Connection pooling
│   ├── __tests__/
│   │   ├── integration/         # NEW: E2E integration tests
│   │   │   ├── agent.test.ts
│   │   │   ├── tools.test.ts
│   │   │   └── api.test.ts
│   │   └── performance/         # NEW: Performance tests
│   │       └── responseTime.test.ts
│   └── utils/
│       ├── redis.ts             # NEW: Redis client
│       └── performance.ts       # NEW: Performance monitoring
```

### Updated package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "redis": "^4.6.11",
    "express-rate-limit": "^7.1.5",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "supertest": "^6.3.3"
  }
}
```

## Implementation Order

1. **Setup Redis and Connection Pooling** (Foundation)
2. **Create HTTP Server with Rate Limiting** (API Layer)
3. **Add Caching and Performance Monitoring** (Optimization)
4. **Write End-to-End Integration Tests** (Verification)
5. **Run Performance Tests** (Validate < 2s response)

## Success Criteria

- [ ] HTTP server running on port 3001
- [ ] Rate limiting: 100 requests/15 minutes per IP
- [ ] Redis session management working
- [ ] Database connection pooling implemented
- [ ] All E2E tests passing
- [ ] Agent response time < 2 seconds (p95)
- [ ] Performance monitoring in place
- [ ] Documentation updated

## Out of Scope

- Smart contract audit (requires security professional)
- Mainnet deployment (use testnet)
- Mobile app (React Native)
- Load testing for 10k+ users
- Full WCAG AA compliance

## Testing Strategy

### Test Layers
1. **Unit Tests**: Individual tool functions (existing)
2. **Integration Tests**: Agent loop with tools (NEW)
3. **API Tests**: HTTP endpoints with rate limiting (NEW)
4. **Contract Tests**: Smart contract functions (existing)
5. **Performance Tests**: Response time benchmarks (NEW)

### Verification
- Tests pass: `bun test`
- API working: `curl http://localhost:3001/health`
- Redis connected: Check logs
- Performance: Agent responds in < 2s

## Notes

- Keep existing custom agent loop architecture intact
- Maintain backward compatibility
- Use Bun runtime features for performance
- Document all environment variables
- Add graceful shutdown handlers
