# Deployment Guide

This guide covers deploying the Pricing Optimizer in production environments.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer / CDN                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                 ┌───────────────────┐
│   Demo App        │                 │   Pricing API     │
│   (Next.js)       │────────────────▶│   (Express)       │
│   Port: 3002      │                 │   Port: 3001      │
└───────────────────┘                 └─────────┬─────────┘
                                                │
                    ┌───────────────────────────┴────────┐
                    │                                    │
                    ▼                                    ▼
           ┌───────────────────┐              ┌───────────────────┐
           │   PostgreSQL      │              │     Redis         │
           │   (Persistence)   │              │   (Cache/Rate)    │
           └───────────────────┘              └───────────────────┘
```

## Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+ (production)
- Redis 6+ (production)
- Docker & Docker Compose (optional)

## Environment Variables

### Pricing Optimizer API

```env
# Required
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-jwt-secret-minimum-32-chars
API_KEY_ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Platform Mode
PLATFORM_MODE=hybrid  # or 'byok-only' or 'managed-only'

# Paid.ai (for managed mode)
PAID_API_KEY=your_production_paid_api_key
PAID_API_BASE_URL=https://api.paid.ai/v1

# Database (production)
DATABASE_URL=postgresql://user:password@host:5432/pricing_optimizer

# Redis (production)
REDIS_URL=redis://localhost:6379

# Rate Limits
FREE_TIER_LIMIT=1000
STARTER_TIER_LIMIT=10000
PRO_TIER_LIMIT=100000

# Stripe (for billing managed customers)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
```

### Demo App

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Deployment Options

### Option 1: Docker Compose (Recommended for Development/Staging)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./pricing-optimizer
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - JWT_SECRET=${JWT_SECRET}
      - PAID_API_KEY=${PAID_API_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/pricing_optimizer
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  demo:
    build:
      context: ./demo-app
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: pricing_optimizer
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Option 2: Kubernetes

Example deployment manifests:

```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pricing-optimizer-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pricing-optimizer-api
  template:
    metadata:
      labels:
        app: pricing-optimizer-api
    spec:
      containers:
      - name: api
        image: your-registry/pricing-optimizer:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: production
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: pricing-optimizer-secrets
              key: jwt-secret
        resources:
          requests:
            cpu: "100m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

### Option 3: Serverless (Vercel/Netlify)

For the demo app:

```bash
# Deploy to Vercel
cd demo-app
vercel deploy --prod
```

For the API (using a container-based serverless platform):

```bash
# Example: Google Cloud Run
gcloud run deploy pricing-optimizer-api \
  --source ./pricing-optimizer \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Setup

### PostgreSQL Schema (Production)

```sql
-- Create database
CREATE DATABASE pricing_optimizer;

-- Connect to database
\c pricing_optimizer

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  mode VARCHAR(50) NOT NULL DEFAULT 'managed',
  paid_api_key_encrypted TEXT,
  paid_api_base_url TEXT,
  usage_limit INTEGER NOT NULL DEFAULT 1000,
  current_usage INTEGER NOT NULL DEFAULT 0,
  default_provider VARCHAR(50) NOT NULL DEFAULT 'paid-ai',
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiments table
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_sample_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variants table
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  weight INTEGER NOT NULL DEFAULT 50,
  metadata JSONB
);

-- Metrics table
CREATE TABLE variant_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage records table
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_experiments_tenant ON experiments(tenant_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_variants_experiment ON variants(experiment_id);
CREATE INDEX idx_usage_records_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_records_created ON usage_records(created_at);
```

## Security Checklist

- [ ] Use strong, unique JWT_SECRET (minimum 32 characters)
- [ ] Encrypt API_KEY_ENCRYPTION_KEY securely (use secrets manager)
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database connection encryption (SSL)
- [ ] Use environment-specific secrets (dev/staging/prod)
- [ ] Implement audit logging
- [ ] Set up intrusion detection
- [ ] Configure firewall rules

## Monitoring

### Health Checks

The API provides a health endpoint:

```bash
curl https://api.your-domain.com/health
# Returns: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

### Metrics to Monitor

1. **API Latency** - P50, P95, P99 response times
2. **Error Rate** - 4xx and 5xx responses
3. **Request Volume** - Requests per second/minute
4. **Database Connections** - Active/idle connections
5. **Cache Hit Rate** - Redis cache effectiveness
6. **Usage by Tenant** - Track usage limits

### Recommended Tools

- **APM**: Datadog, New Relic, or OpenTelemetry
- **Logging**: ELK Stack, Papertrail, or CloudWatch
- **Alerting**: PagerDuty, Opsgenie

## Scaling Considerations

### Horizontal Scaling

The API is stateless and can be horizontally scaled:

```yaml
# Increase replicas
replicas: 5
```

### Caching Strategy

1. **Variant Assignments** - Cache in Redis (5 min TTL)
2. **Experiment Configs** - Cache in Redis (1 min TTL)
3. **Rate Limit Counters** - Store in Redis

### Database Scaling

1. **Read Replicas** - For analytics queries
2. **Connection Pooling** - Use PgBouncer
3. **Partitioning** - Partition usage_records by date

## Backup & Recovery

### Database Backups

```bash
# Daily backup
pg_dump pricing_optimizer > backup_$(date +%Y%m%d).sql

# Point-in-time recovery with WAL archiving
wal_level = replica
archive_mode = on
```

### Disaster Recovery

1. Multi-region deployment
2. Automated failover
3. Regular restore testing
