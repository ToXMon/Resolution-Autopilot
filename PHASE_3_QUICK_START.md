# Quick Start: Phase 3 Production Features

## What's New in Phase 3?

Phase 3 adds production-ready infrastructure to Resolution Autopilot:
- 🚀 **HTTP Server** - RESTful API with Express
- 🔒 **Rate Limiting** - Protect endpoints from abuse
- 💾 **Connection Pooling** - Handle concurrent database access
- 🔑 **Session Management** - Redis-backed user sessions
- ⚡ **Performance** - Sub-2-second response times with caching
- ✅ **Testing** - 50+ integration and performance tests

## Installation (5 Minutes)

### 1. Install Dependencies

```bash
cd apps/agent
npm install
```

**New Dependencies**:
- `express` - HTTP server
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `ioredis` - Redis client

### 2. Start Redis

**Option A: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Option B: Local Install**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis
```

**Option C: Skip Redis (Fallback Mode)**
The server will run without Redis, but rate limiting and caching will be disabled.

### 3. Configure Environment

```bash
cd apps/agent
cp .env.example .env
```

**Minimum Required Configuration**:
```bash
# LLM Provider (choose one)
LLM_PROVIDER=venice
VENICE_API_KEY=your-api-key-here

# Or use Gemini
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here

# Redis (optional - server runs without it)
REDIS_URL=redis://localhost:6379
```

### 4. Start the Server

```bash
# Production mode
npm run server

# Development mode (hot reload - requires Bun)
bun run dev:server
```

**Server will start on**: `http://localhost:3001`

## Quick Test

### 1. Health Check
```bash
curl http://localhost:3001/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-04T10:00:00.000Z",
  "uptime": 10,
  "database": {
    "activeConnections": 0,
    "waitingQueue": 0,
    "maxConnections": 10
  },
  "performance": {
    "agentResponseTime": { "target": 2000, "actual": 0, "passing": true },
    "llmCallTime": { "target": 1500, "actual": 0, "passing": true }
  }
}
```

### 2. Agent Interaction
```bash
curl -X POST http://localhost:3001/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! How can you help me?", "userId": "test_user"}'
```

**Expected Response**:
```json
{
  "success": true,
  "response": "Hello! I'm your AI fitness coach...",
  "sessionId": "abc-123-def-456",
  "performance": {
    "duration": 1234,
    "target": 2000,
    "passing": true
  }
}
```

### 3. Log a Workout
```bash
curl -X POST http://localhost:3001/api/workout/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "exercise_type": "squats",
    "duration_minutes": 30,
    "reps": 50,
    "sets": 3,
    "form_quality": "excellent"
  }'
```

### 4. Get Workout History
```bash
curl "http://localhost:3001/api/workout/history?user_id=test_user&days_back=7"
```

### 5. Check Performance Stats
```bash
curl http://localhost:3001/api/performance
```

## API Endpoints Reference

| Endpoint | Method | Rate Limit | Cache | Description |
|----------|--------|------------|-------|-------------|
| `/health` | GET | None | No | Health check with metrics |
| `/api/agent` | POST | 20/min | No | AI agent interaction |
| `/api/workout/log` | POST | 50/hour | No | Log workout |
| `/api/workout/history` | GET | 100/15min | 5min | Get workout history |
| `/api/patterns` | GET | 100/15min | 10min | Detect drift patterns |
| `/api/performance` | GET | 100/15min | No | Performance statistics |

## Rate Limiting

Rate limits are enforced per IP address (or session ID for agent endpoint).

**Response when rate limited**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 1 minute.",
  "retryAfter": 60,
  "resetAt": "2024-02-04T10:01:00.000Z"
}
```

**Headers**:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - When the limit resets
- `Retry-After` - Seconds until you can retry

## Session Management

Sessions are automatically created and managed via Redis.

**Session Header**:
```bash
curl -X POST http://localhost:3001/api/agent \
  -H "X-Session-Id: your-session-id-here" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

If no session ID is provided, one will be created and returned in the response headers.

**Session Expiry**: 1 hour (auto-extended on each request)

## Caching

GET endpoints are automatically cached in Redis:
- Workout history: 5 minutes
- Pattern detection: 10 minutes

**Cache Headers**:
- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response computed fresh

## Testing

### Run All Tests (Requires Bun)
```bash
cd apps/agent

# Install Bun if needed
curl -fsSL https://bun.sh/install | bash

# Run tests
bun test
```

### Run Specific Test Suites
```bash
# Integration tests
bun test src/__tests__/integration/

# Performance tests
bun test src/__tests__/performance/

# Specific file
bun test src/__tests__/integration/tools.test.ts
```

### Test Coverage
- ✅ Workout logging and history (20 tests)
- ✅ Agent tool integration (15 tests)
- ✅ Agent loop behavior (12 tests)
- ✅ Performance benchmarks (10 tests)
- ✅ Smart contracts (20+ tests)

**Total**: 77+ comprehensive tests

## Performance Monitoring

### Real-Time Metrics

Monitor performance in the logs:
```
POST /api/agent 200 1245ms
📊 [agent_response] 1245.32ms
GET /api/workout/history 200 45ms (✅ Cache hit)
```

### Performance Endpoint

```bash
curl http://localhost:3001/api/performance
```

**Response**:
```json
{
  "stats": {
    "agent_response": {
      "count": 42,
      "average": 1456,
      "min": 890,
      "max": 2340,
      "p50": 1420,
      "p95": 1890,
      "p99": 2210
    }
  },
  "targets": {
    "agentResponseTime": { "target": 2000, "actual": 1890, "passing": true },
    "llmCallTime": { "target": 1500, "actual": 1120, "passing": true }
  },
  "passing": true
}
```

### Performance Targets
- **Agent Response (P95)**: < 2000ms ✅
- **LLM Call (P95)**: < 1500ms ✅
- **Database Read**: < 50ms ✅
- **Database Write**: < 100ms ✅

## Troubleshooting

### Server won't start
1. Check Redis is running: `redis-cli ping` (should return `PONG`)
2. Check port 3001 is available: `lsof -i :3001`
3. Verify environment variables: `cat .env`
4. Check logs for errors

### Rate limiting errors
- Wait for the specified `retryAfter` seconds
- Or reset rate limit manually (requires Redis CLI):
  ```bash
  redis-cli DEL "resolution:ratelimit:your-key"
  ```

### Slow responses
1. Check Redis connection: `redis-cli ping`
2. Check LLM API status
3. Review performance endpoint: `curl http://localhost:3001/api/performance`
4. Increase Redis cache TTL in `.env`

### Tests failing
1. Ensure Bun is installed: `bun --version`
2. Clear database: `rm apps/agent/db.json`
3. Clear Redis: `redis-cli FLUSHALL`
4. Run tests individually to isolate failures

## Production Deployment

### Environment Variables (Production)

```bash
# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# LLM Provider
LLM_PROVIDER=venice
VENICE_API_KEY=your-production-api-key

# Redis (use managed service)
REDIS_URL=redis://your-redis-host:6379
REDIS_PREFIX=resolution:
SESSION_TTL=3600
CACHE_TTL=300
```

### Recommended Services

- **Server Hosting**: AWS EC2, Google Cloud Run, Vercel, Railway
- **Redis**: Redis Cloud, AWS ElastiCache, Upstash
- **Monitoring**: Sentry, Datadog, New Relic
- **Load Balancing**: AWS ALB, Cloudflare, NGINX

### Security Checklist

- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Use strong Redis password
- [ ] Configure CORS for your domain only
- [ ] Set up API authentication (JWT tokens)
- [ ] Enable request logging
- [ ] Configure DDoS protection
- [ ] Set up monitoring and alerts

## Next Steps

1. **Test all endpoints** - Use the curl commands above
2. **Run the test suite** - `bun test`
3. **Monitor performance** - Check `/api/performance`
4. **Review documentation** - Read `PHASE_3_COMPLETE.md`
5. **Deploy to production** - Follow deployment checklist

## Getting Help

- **Documentation**: See `PHASE_3_COMPLETE.md` for detailed docs
- **Implementation Plan**: See `PHASE_3_IMPLEMENTATION_PLAN.md`
- **Summary**: See `PHASE_3_SUMMARY.md`
- **Code**: All source in `apps/agent/src/`

## Architecture at a Glance

```
Frontend (Next.js)
        ↓
HTTP Server (Express:3001)
  ├── Rate Limiting (Redis)
  ├── Session Management (Redis)
  ├── Caching (Redis)
  └── Performance Monitoring
        ↓
Agent Loop (Custom)
  ├── LLM (Venice/Gemini)
  └── 8 Specialized Tools
        ↓
Data Layer
  ├── Redis (Sessions, Cache, Rate Limits)
  └── LowDB (Workouts, Messages, Profiles)
      └── Connection Pool
```

**Ready to build! 🚀**

---

**Phase 3 Implementation Complete** ✅
- Production-ready HTTP server
- Rate limiting and session management
- Connection pooling and caching
- 50+ integration tests
- Performance monitoring
- Comprehensive documentation

**Next**: Deploy to production and start Phase 4: Scale & Launch
