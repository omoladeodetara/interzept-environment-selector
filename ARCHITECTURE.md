# Oja, Elo, Jale, and Demo App - Architecture Implementation

This document describes the complete architecture of the Last Price pricing optimizer platform, consisting of four main components:

## Components Overview

### 1. **Oja (Owner UI)** - Demo App
Location: `/demo-app`  
Port: `http://localhost:3002`

The business-owner interface for managing the pricing optimization platform.

**Features**:
- Tenant management (BYOK vs Managed mode)
- Experiment creation and management
- Real-time experiment viewing
- Agent business simulation
- Pricing recommendations interface
- Settings and billing dashboard

**Tech Stack**:
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components

### 2. **Elo (A/B Testing Server)** - ab-testing-server
Location: `/ab-testing-server`  
Port: `http://localhost:3000`

The backend A/B testing engine that handles variant assignment, tracking, and Paid.ai integration.

**Key Features**:
- Multi-tenant isolation
- Deterministic variant assignment
- View and conversion tracking
- Tenant-aware Paid.ai signal emission
- Webhook processing
- OpenAPI 3.0 specification

**API Endpoints**:
- Tenant management: `/api/tenants/*`
- Experiment management: `/api/tenants/:id/experiments`
- Pricing: `/api/experiments/:id/pricing`
- Conversion: `/api/experiments/:id/convert`
- Results: `/api/experiments/:id/results`
- Optimization: `/api/jale/optimize`
- Webhooks: `/webhooks/paid`

**Database**: PostgreSQL with 7 tables for multi-tenant data

### 3. **Jale (Pricing Engine)** - jale
Location: `/jale`

The pricing optimization and recommendation engine.

**Features**:
- Elasticity computation
- Experiment result analysis
- Price recommendation generation
- Simulation and confidence scoring
- Linear interpolation for conversion estimation

**Integration**: Called via `/api/jale/optimize` endpoint in Elo

### 4. **Demo (Agent Business Simulation)** - Simulation Page
Location: `/demo-app/app/simulation`

A reference implementation showing how an AI agent-run business integrates with the platform.

**Example**: Coffee shop agent that:
- Requests dynamic pricing per customer
- Simulates purchase decisions based on price sensitivity
- Records conversions
- Tracks metrics in real-time

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Step 1: Database Setup

```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE lastprice;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# Apply schema
sudo -u postgres psql -d lastprice -f db/schema.sql
```

### Step 2: Start Elo (ab-testing-server)

```bash
cd ab-testing-server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
# DB_PASSWORD=postgres
# PAID_API_KEY=your_key_here

# Start server
node server.js
```

Server will be available at `http://localhost:3000`

### Step 3: Start Oja (demo-app)

```bash
cd demo-app

# Install dependencies
npm install

# The .env.local file should already contain:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Start Next.js app
npm run dev
```

App will be available at `http://localhost:3002`

### Step 4: Test the Platform

1. **View Experiments**: Navigate to `http://localhost:3002/experiments`
2. **Run Simulation**: Navigate to `http://localhost:3002/simulation`
3. **Click "Simulate Single Order"** to test the complete flow
4. **Watch the activity log** to see API calls in real-time

## API Flow Diagram

```
User/Agent
    │
    ├──→ GET /api/experiments/:id/pricing?userId=X&tenantId=Y
    │    (Elo assigns variant, records view, emits Paid.ai signal)
    │    ← Returns: { userId, experimentId, variant, pricing }
    │
    ├──→ POST /api/experiments/:id/convert
    │    { userId, tenantId, revenue }
    │    (Elo records conversion, emits Paid.ai signal)
    │    ← Returns: { success, userId, variant, revenue }
    │
    └──→ POST /api/jale/optimize
         { experimentId, objective, candidates }
         (Jale analyzes results, returns recommendation)
         ← Returns: { recommendedPrice, expectedRevenue, confidence, simulation }
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Oja (Owner UI)                      │
│           Next.js 16 + React 19                     │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Tenants  │  │Experiments│  │Simulation│         │
│  └──────────┘  └──────────┘  └──────────┘         │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP REST API
                        │
┌───────────────────────▼─────────────────────────────┐
│          Elo (A/B Testing Server)                   │
│             Express.js + PostgreSQL                 │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Multi-Tenant Database (PostgreSQL)           │  │
│  │ • tenants                                    │  │
│  │ • experiments                                │  │
│  │ • assignments                                │  │
│  │ • views                                      │  │
│  │ • conversions                                │  │
│  │ • usage                                      │  │
│  │ • recommendations                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Paid.ai Integration                          │  │
│  │ • Tenant-aware signal emission               │  │
│  │ • BYOK vs Managed mode support               │  │
│  │ • Webhook processing                         │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              Jale (Pricing Engine)                  │
│                     Node.js                         │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ • Elasticity computation                     │  │
│  │ • Experiment analysis                        │  │
│  │ • Price recommendations                      │  │
│  │ • Confidence scoring                         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Tenant Modes

### Managed Mode
- Platform provides Paid.ai integration
- Single API key for all managed tenants
- Simplified setup
- Lower barrier to entry

**Configuration**:
```json
{
  "name": "Demo Company",
  "email": "demo@example.com",
  "mode": "managed",
  "plan": "starter"
}
```

### BYOK (Bring Your Own Key) Mode
- Tenant provides their own Paid.ai API key
- Direct billing relationship with Paid.ai
- Full data control
- Enterprise-friendly

**Configuration**:
```json
{
  "name": "Enterprise Corp",
  "email": "admin@enterprise.com",
  "mode": "byok",
  "paidApiKey": "sk_live_...",
  "plan": "enterprise"
}
```

## API Examples

### Create a Tenant
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "admin@mycompany.com",
    "mode": "managed",
    "plan": "free"
  }'
```

### Create an Experiment
```bash
curl -X POST http://localhost:3000/api/tenants/TENANT_ID/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "key": "pricing_test_001",
    "name": "Premium Plan Test",
    "description": "Testing $29.99 vs $39.99",
    "variants": [
      { "name": "control", "price": 29.99, "weight": 50 },
      { "name": "experiment", "price": 39.99, "weight": 50 }
    ],
    "status": "active"
  }'
```

### Get Pricing (Agent Request)
```bash
curl "http://localhost:3000/api/experiments/pricing_test_001/pricing?userId=user_123&tenantId=TENANT_ID"
```

### Record Conversion
```bash
curl -X POST http://localhost:3000/api/experiments/pricing_test_001/convert \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "tenantId": "TENANT_ID",
    "revenue": 39.99
  }'
```

### Get Recommendations
```bash
curl -X POST http://localhost:3000/api/jale/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "experimentId": "pricing_test_001",
    "objective": "revenue"
  }'
```

## Development

### Running Tests
```bash
# ab-testing-server
cd ab-testing-server
npm test

# demo-app
cd demo-app
npm run lint
npm run build
```

### API Documentation
OpenAPI specification available at: `http://localhost:3000/api-docs`

### Database Migrations
Schema is in `/db/schema.sql`. For updates:
1. Modify schema.sql
2. Create migration script
3. Apply with `psql -d lastprice -f migration.sql`

## Security Considerations

### Production Checklist
- [ ] Enable API key encryption in database
- [ ] Implement webhook signature verification
- [ ] Add JWT authentication
- [ ] Configure rate limiting
- [ ] Enable HTTPS for all connections
- [ ] Use environment-specific secrets
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and alerting
- [ ] Implement database backups
- [ ] Use prepared statements (already done)

### Current Security Features
- ✅ Parameterized SQL queries (prevents SQL injection)
- ✅ Input validation on all endpoints
- ✅ API key masking in responses
- ✅ Secure cookie flags
- ✅ CORS restricted to specific origin (development)

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check password is set
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### CORS Errors
- Ensure ab-testing-server is running on port 3000
- Ensure demo-app is running on port 3002
- Check CORS origin in server.js matches demo-app URL

### Experiments Not Loading
- Check browser console for errors
- Verify API client is configured with correct base URL
- Test API directly: `curl http://localhost:3000/health`

## Next Steps

1. **Tenant Onboarding**: Build wizard for new tenant signup
2. **Experiment Creation UI**: Form to create experiments
3. **Recommendations Dashboard**: Display and accept recommendations
4. **Analytics**: Real-time charts and statistical significance
5. **BYOK Flow**: Complete tenant API key management
6. **Usage Dashboard**: Track signals, API calls, billing

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
