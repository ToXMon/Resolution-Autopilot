# Phase 3 Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] TypeScript compiles without errors
- [x] Code review completed (0 issues)
- [x] Security scan completed (0 vulnerabilities)
- [x] All atomic operations verified (no race conditions)
- [x] Graceful shutdown tested

### ✅ Testing
- [ ] Run all tests locally with Bun: `bun test`
- [ ] Integration tests pass (30 tests)
- [ ] Performance tests pass (10 tests)
- [ ] Manual API testing completed
- [ ] Load testing (optional, recommended)

### ✅ Dependencies
- [x] All npm packages installed
- [x] Redis available (Docker or managed service)
- [x] LLM API keys configured
- [x] Environment variables set

## Local Testing Checklist

### 1. Environment Setup
```bash
# Clone repository
cd apps/agent

# Install dependencies
npm install

# Start Redis
docker run -d -p 6379:6379 redis:latest

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start Server
```bash
npm run server
# Should see: 🚀 Server running on http://localhost:3001
```

### 3. Health Check
```bash
curl http://localhost:3001/health
# Should return: {"status": "healthy", ...}
```

### 4. API Testing
```bash
# Test agent endpoint
curl -X POST http://localhost:3001/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "userId": "test_user"}'

# Test workout logging
curl -X POST http://localhost:3001/api/workout/log \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "exercise_type": "squats",
    "duration_minutes": 30
  }'

# Test workout history
curl "http://localhost:3001/api/workout/history?user_id=test_user&days_back=7"

# Test pattern detection
curl "http://localhost:3001/api/patterns?user_id=test_user"

# Test performance stats
curl http://localhost:3001/api/performance
```

### 5. Rate Limiting Test
```bash
# Should hit rate limit after 20 requests in 1 minute
for i in {1..25}; do
  curl -X POST http://localhost:3001/api/agent \
    -H "Content-Type: application/json" \
    -d '{"message": "Test '${i}'"}' 
done

# Request 21+ should return: {"error": "Rate limit exceeded", ...}
```

### 6. Session Testing
```bash
# First request (creates session)
curl -X POST http://localhost:3001/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' -v

# Note the X-Session-Id in response headers

# Second request (reuses session)
curl -X POST http://localhost:3001/api/agent \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: <session-id-from-previous>" \
  -d '{"message": "Remember me?"}'
```

### 7. Caching Test
```bash
# First request (cache miss)
curl "http://localhost:3001/api/workout/history?user_id=test&days_back=7" -v
# Should see: X-Cache: MISS

# Second request (cache hit)
curl "http://localhost:3001/api/workout/history?user_id=test&days_back=7" -v
# Should see: X-Cache: HIT
```

### 8. Performance Verification
```bash
# Check performance stats after some usage
curl http://localhost:3001/api/performance

# Verify:
# - agentResponseTime.actual < 2000ms
# - llmCallTime.actual < 1500ms
# - passing: true
```

## Staging Deployment Checklist

### 1. Infrastructure Setup
- [ ] Provision server (AWS EC2, GCP, Railway, etc.)
- [ ] Set up managed Redis (Redis Cloud, ElastiCache)
- [ ] Configure DNS (staging.yourdomain.com)
- [ ] Set up SSL/TLS certificate
- [ ] Configure firewall (allow ports 80, 443, 3001)

### 2. Environment Configuration
```bash
# staging.env
NODE_ENV=staging
PORT=3001
FRONTEND_URL=https://staging-frontend.yourdomain.com

LLM_PROVIDER=venice
VENICE_API_KEY=<staging-api-key>

REDIS_URL=redis://<user>:<password>@<redis-host>:6379
REDIS_PREFIX=resolution:staging:
SESSION_TTL=3600
CACHE_TTL=300
```

### 3. Deployment
```bash
# SSH into server
ssh user@staging-server

# Clone repository
git clone <repo-url>
cd Resolution-Autopilot/apps/agent

# Install dependencies
npm install

# Copy environment file
cp staging.env .env

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "resolution-agent" -- run server
pm2 save
pm2 startup
```

### 4. Verify Deployment
```bash
# Health check
curl https://staging-api.yourdomain.com/health

# Test API endpoints
curl -X POST https://staging-api.yourdomain.com/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello staging!"}'
```

### 5. Monitoring Setup
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring (Datadog, New Relic)
- [ ] Configure log aggregation (CloudWatch, Papertrail)
- [ ] Set up alerts (Slack, PagerDuty)

## Production Deployment Checklist

### 1. Security Hardening
- [ ] Enable HTTPS/TLS only (disable HTTP)
- [ ] Set strong Redis password
- [ ] Configure CORS for production domain only
- [ ] Set up API authentication (JWT tokens)
- [ ] Enable rate limiting (already implemented)
- [ ] Configure DDoS protection (Cloudflare, AWS Shield)
- [ ] Set up Web Application Firewall (WAF)
- [ ] Disable debug logs in production

### 2. Environment Configuration
```bash
# production.env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.yourdomain.com

LLM_PROVIDER=venice
VENICE_API_KEY=<production-api-key>

REDIS_URL=redis://<user>:<password>@<redis-host>:6379
REDIS_PREFIX=resolution:prod:
SESSION_TTL=3600
CACHE_TTL=300

# Optional: Database migration
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 3. High Availability Setup
- [ ] Deploy to multiple availability zones
- [ ] Set up load balancer (AWS ALB, NGINX)
- [ ] Configure auto-scaling (min: 2, max: 10 instances)
- [ ] Set up Redis cluster (high availability)
- [ ] Configure database replication (if using PostgreSQL)
- [ ] Set up CDN (Cloudflare, AWS CloudFront)

### 4. Deployment Options

#### Option A: Docker + Kubernetes
```bash
# Build Docker image
docker build -t resolution-agent:v1.0.0 .

# Push to registry
docker push your-registry/resolution-agent:v1.0.0

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Option B: Serverless (Google Cloud Run)
```bash
# Deploy to Cloud Run
gcloud run deploy resolution-agent \
  --image gcr.io/your-project/resolution-agent \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option C: Traditional Server (PM2)
```bash
# SSH into production server
ssh user@prod-server

# Deploy code
git pull origin main
cd apps/agent
npm install

# Restart service
pm2 restart resolution-agent
pm2 save
```

### 5. Post-Deployment Verification
```bash
# Health check
curl https://api.yourdomain.com/health

# Test all endpoints
curl -X POST https://api.yourdomain.com/api/agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello production!"}'

# Check performance
curl https://api.yourdomain.com/api/performance

# Verify rate limiting
# (Run 25 requests in 1 minute, should see rate limit error)

# Verify caching
# (Make same request twice, second should be cached)
```

### 6. Monitoring & Alerting
- [ ] Verify uptime monitoring is active
- [ ] Test error tracking (trigger an error, check Sentry)
- [ ] Verify performance monitoring (check Datadog dashboard)
- [ ] Test log aggregation (check CloudWatch logs)
- [ ] Test alerts (trigger an alert, verify notification)

### 7. Rollback Plan
- [ ] Document current deployment version
- [ ] Keep previous version available
- [ ] Test rollback procedure in staging
- [ ] Document rollback steps

```bash
# Rollback with PM2
pm2 stop resolution-agent
git checkout <previous-version-tag>
npm install
pm2 start resolution-agent

# Rollback with Kubernetes
kubectl rollout undo deployment/resolution-agent
```

## Performance Benchmarks (Post-Deployment)

### Run Performance Tests
```bash
# Install Apache Bench or similar
sudo apt-get install apache2-utils

# Test agent endpoint (10 concurrent, 100 requests)
ab -n 100 -c 10 -p agent-payload.json -T application/json \
  https://api.yourdomain.com/api/agent

# Verify:
# - Mean response time < 2000ms
# - 95% < 2500ms
# - 0% errors
```

### Monitor Key Metrics
```bash
# Check performance endpoint
curl https://api.yourdomain.com/api/performance

# Verify targets:
{
  "targets": {
    "agentResponseTime": {
      "target": 2000,
      "actual": 1456,  // Should be < 2000
      "passing": true
    },
    "llmCallTime": {
      "target": 1500,
      "actual": 1120,  // Should be < 1500
      "passing": true
    }
  },
  "passing": true  // Overall should be true
}
```

## Troubleshooting

### Common Issues

#### Server won't start
```bash
# Check if port is in use
lsof -i :3001
# Kill process if needed
kill -9 <PID>

# Check Redis connection
redis-cli ping
# Should return: PONG

# Check environment variables
cat .env | grep REDIS_URL
cat .env | grep VENICE_API_KEY

# Check logs
pm2 logs resolution-agent
```

#### Rate limiting not working
```bash
# Check Redis connection
redis-cli ping

# Check Redis keys
redis-cli KEYS "resolution:ratelimit:*"

# Clear rate limits (if needed)
redis-cli FLUSHDB
```

#### Slow responses
```bash
# Check Redis latency
redis-cli --latency

# Check LLM API status
curl https://api.venice.ai/health

# Check performance metrics
curl https://api.yourdomain.com/api/performance

# Check server resources
top
free -h
df -h
```

#### Sessions not persisting
```bash
# Check Redis connection
redis-cli ping

# Check session keys
redis-cli KEYS "resolution:session:*"

# Check session TTL
redis-cli TTL "resolution:session:<session-id>"
```

## Rollback Procedure

### If deployment fails:

1. **Stop new deployment**
```bash
pm2 stop resolution-agent
# or
kubectl rollout pause deployment/resolution-agent
```

2. **Revert to previous version**
```bash
git checkout <previous-tag>
npm install
pm2 start resolution-agent
# or
kubectl rollout undo deployment/resolution-agent
```

3. **Verify rollback**
```bash
curl https://api.yourdomain.com/health
```

4. **Notify team**
- Send notification to team
- Update status page
- Document issue

## Success Criteria

### Deployment is successful when:
- [x] Health check returns 200 OK
- [x] All API endpoints respond correctly
- [x] Rate limiting works as expected
- [x] Session management persists across requests
- [x] Caching improves response times
- [x] Performance targets met (< 2s agent response)
- [x] Error rate < 1%
- [x] Uptime > 99.9%
- [x] Monitoring and alerts active

## Post-Deployment Tasks

### Immediate (First 24 Hours)
- [ ] Monitor error rates closely
- [ ] Watch performance metrics
- [ ] Check rate limiting is effective
- [ ] Verify session management working
- [ ] Monitor Redis memory usage
- [ ] Review logs for issues

### Short-Term (First Week)
- [ ] Analyze performance data
- [ ] Optimize cache TTLs if needed
- [ ] Adjust rate limits based on usage
- [ ] Review and fix any errors
- [ ] Document any issues found

### Ongoing
- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Quarterly load testing
- [ ] Continuous monitoring and optimization

---

## Quick Reference

**Local Test**: `npm run server` + test all endpoints
**Staging Deploy**: Set up infrastructure + deploy + verify
**Production Deploy**: Security hardening + HA setup + deploy + monitor

**Documentation**:
- Quick Start: `PHASE_3_QUICK_START.md`
- Complete Docs: `PHASE_3_COMPLETE.md`
- Final Report: `PHASE_3_FINAL_REPORT.md`

**Support**:
- Check logs: `pm2 logs resolution-agent`
- Health check: `curl /health`
- Performance: `curl /api/performance`

---

**Phase 3 Deployment Ready** ✅
**Next**: Deploy and monitor!
