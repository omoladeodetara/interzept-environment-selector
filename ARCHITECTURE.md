# Last Price - Modular Monolith Architecture

This document describes the architecture of the Last Price pricing optimizer platform after restructuring to a modular monolith pattern.

## Architecture Overview

Last Price follows a **modular monolith** architecture, organizing code into well-defined modules while maintaining a single deployable unit. This approach provides:

- **Clear module boundaries**: Each module has a specific responsibility
- **Independent development**: Modules can be developed and tested in isolation
- **Easier testing**: Mock dependencies at module boundaries
- **Future flexibility**: Modules can be extracted to microservices if needed
- **Simpler deployment**: Single server process reduces operational complexity

## Directory Structure

```
last-price/
├── server.ts                    # Main server entry point
├── package.json                 # Root dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── openapi.yaml                 # API specification
├── .env.example                 # Environment variables template
│
├── packages/                    # Internal modules (business logic)
│   ├── elo/                     # A/B Testing module
│   │   ├── index.ts             # Variant assignment, tracking, results
│   │   └── README.md            # Module documentation
│   └── jale/                    # Pricing Engine module
│       ├── index.ts             # Elasticity, recommendations, simulation
│       └── README.md            # Module documentation
│
├── services/                    # Service layer (infrastructure)
│   ├── database.ts              # PostgreSQL database access
│   └── signals.ts               # Paid.ai Signals API integration
│
├── api-delegates/               # HTTP route handlers
│   ├── tenants.ts               # Tenant management endpoints
│   ├── experiments.ts           # Experiment endpoints
│   ├── pricing.ts               # Pricing optimization endpoints
│   ├── webhooks.ts              # Webhook handlers
│   └── health.ts                # Health check and debug endpoints
│
├── models/                      # Type definitions
│   └── types.ts                 # Core TypeScript interfaces
│
├── utils/                       # Utility functions
│   └── config.ts                # Configuration management
│
├── migrations/                  # Database migrations
│   └── schema.sql               # PostgreSQL schema
│
├── docs/                        # Documentation
├── specs/                       # Test specifications
├── public/                      # Static assets
│
├── demo-app/                    # Example demo app - pricing experiment showcase
└── ui/                          # Component library (for Oja and other UIs)
```

## Core Components

### 1. Packages (Business Logic Modules)

#### **Elo (A/B Testing)**
Location: `packages/elo/`

The A/B testing engine that handles variant assignment and tracking.

**Responsibilities:**
- Deterministic variant assignment (control/experiment)
- View and conversion tracking
- Results aggregation and statistics
- Experiment analytics

**Key Functions:**
- `assignVariant(userId, experimentId)` - Assign user to variant
- `trackConversion(userId, experimentId, data)` - Record conversion
- `getExperimentResults(experimentId)` - Get aggregated results

#### **Jale (Pricing Engine)**
Location: `jale/`

The advanced pricing optimization and recommendation engine.

**Files:**
- `index.ts` - Core pricing functions (elasticity, significance, optimal pricing)
- `types.ts` - Shared type definitions
- `recommendation-engine.ts` - AI-powered pricing recommendations
- `experiment-manager.ts` - A/B experiment lifecycle management
- `analytics.ts` - Dashboard data and experiment analytics

**Responsibilities:**
- Price elasticity analysis with confidence intervals
- Statistical significance testing
- Revenue simulation for candidate prices
- Advanced pricing recommendations with reasoning
- Psychological pricing optimization
- Business goal constraints (min/max price, margins)
- Experiment lifecycle management
- Analytics and dashboard data

**Key Functions (index.ts):**
- `recommendPrice(options)` - Generate advanced pricing recommendations
- `calculateElasticity(control, experiment)` - Calculate price elasticity
- `analyzeElasticity(control, experiment)` - Full elasticity analysis
- `calculateOptimalPrice(price, elasticity)` - Compute optimal price point
- `applyPsychologicalPricing(price)` - Apply .99/.95 pricing
- `calculateRevenueImpact(current, new, conversions, elasticity)` - Revenue impact
- `calculateStatisticalSignificance(v1, v2)` - Statistical testing
- `generateAdvancedRecommendation(variants, goals)` - Full recommendation

**Key Functions (recommendation-engine.ts):**
- `generateRecommendation(results, goals)` - Generate full recommendation with reasoning
- `quickAnalysis(current, proposed, elasticity)` - Quick price change analysis

**Key Functions (experiment-manager.ts):**
- `createExperiment(tenantId, request)` - Create new experiment
- `activateExperiment(id, tenantId)` - Start experiment
- `assignVariant(experimentId, userId)` - Assign user to variant
- `recordView/recordConversion()` - Track events
- `getExperimentResults(id)` - Get aggregated results

**Key Functions (analytics.ts):**
- `getDashboardData(tenantId)` - Dashboard overview
- `getExperimentAnalytics(id)` - Detailed experiment analytics
- `compareExperiments(ids)` - Compare multiple experiments

### 2. Services (Infrastructure Layer)

#### **Database Service**
Location: `services/database.ts`

Handles all PostgreSQL database operations.

**Operations:**
- Tenant CRUD (create, read, update, delete)
- Experiment management
- Assignment tracking
- View and conversion recording
- Usage metrics
- Results aggregation

#### **Signals Service**
Location: `services/signals.ts`

Integrates with Paid.ai's Signals API.

**Operations:**
- Emit A/B test signals
- Track pricing view events
- Track conversion events
- Support for tenant-specific API keys (BYOK mode)

### 3. API Delegates (HTTP Layer)

API delegates handle HTTP routing, validation, and response formatting.

#### **Tenants Delegate**
Location: `api-delegates/tenants.ts`

Endpoints: `/api/tenants/*`

- Create/list/get/update/delete tenants
- Create experiments for tenants
- Multi-tenant isolation

#### **Experiments Delegate**
Location: `api-delegates/experiments.ts`

Endpoints: `/api/experiments/*`

- Get pricing with variant assignment
- Record conversions
- Get experiment definitions
- Get experiment results

#### **Pricing Delegate**
Location: `api-delegates/pricing.ts`

Endpoints: `/api/jale/*`

- Get pricing recommendations (Jale integration)
- Propose new variants

#### **Webhooks Delegate**
Location: `api-delegates/webhooks.ts`

Endpoints: `/webhooks/*`

- Handle Paid.ai webhook events
- Process subscription/payment events
- Link webhooks to experiments

#### **Health Delegate**
Location: `api-delegates/health.ts`

Endpoints: `/health`, `/api/debug/*`

- Health check (database status)
- Debug endpoints (development only)

### 4. Models

Location: `models/types.ts`

TypeScript interfaces and types for:
- Tenant, Experiment, Variant
- Assignment, View, Conversion
- ExperimentResults, VariantMetrics
- PricingRecommendation
- Config

### 5. Main Server

Location: `server.ts`

The main entry point that:
- Configures Express middleware
- Loads OpenAPI specification
- Mounts API delegates
- Handles graceful shutdown
- Serves Swagger UI documentation

## Data Flow

### Experiment Flow

```
1. User Request → server.ts
   ↓
2. API Delegate (experiments.ts) → Validates request
   ↓
3. Database Service → Gets/creates assignment
   ↓
4. Elo Package → Assigns variant (if needed)
   ↓
5. Database Service → Records view
   ↓
6. Signals Service → Emits to Paid.ai (async)
   ↓
7. Response → Returns pricing with variant
```

### Conversion Flow

```
1. Conversion Event → experiments.ts
   ↓
2. Database Service → Records conversion
   ↓
3. Signals Service → Emits conversion to Paid.ai
   ↓
4. Response → Confirms conversion
```

### Optimization Flow

```
1. Optimization Request → pricing.ts
   ↓
2. Jale Package → Fetches experiment data
   ↓
3. Jale Package → Simulates revenue for candidates
   ↓
4. Jale Package → Selects best price
   ↓
5. Response → Returns recommendation
```

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 12+
- **HTTP Client**: Axios
- **API Documentation**: Swagger/OpenAPI 3.0
- **Frontend**: Next.js 16 (ui library, demo-app)

## Multi-Tenancy

The platform supports two tenant modes:

### Managed Mode
- Platform provides Paid.ai integration
- Shared API key for all tenants
- Simpler setup, faster onboarding

### BYOK Mode (Bring Your Own Key)
- Tenant provides their own Paid.ai API key
- Full data isolation
- Enterprise use case

## Database Schema

Tables:
- `tenants` - Tenant accounts
- `experiments` - A/B test experiments
- `assignments` - User variant assignments
- `views` - Pricing page views
- `conversions` - Subscription/purchase events
- `usage` - Usage metrics per tenant

## Configuration

Environment variables (see `.env.example`):

```bash
# Required
PAID_API_KEY=your_paid_api_key

# Optional
PORT=3000
NODE_ENV=development
PAID_API_BASE_URL=https://api.paid.ai/v1

# Database
DATABASE_URL=postgres://user:password@localhost:5432/lastprice
# Or individual DB_* variables

# Webhooks
WEBHOOK_SECRET=your_webhook_secret
ENABLE_WEBHOOK_VERIFICATION=false

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3002
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Setup database
psql -d lastprice -f migrations/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Build TypeScript
npm run build

# Start server
npm run dev
```

### Build and Run

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Type checking only
npm run type-check
```

## API Documentation

Interactive API documentation is available at:
- Development: http://localhost:3000/api-docs
- Uses OpenAPI 3.0 specification from `openapi.yaml`

## Testing Strategy

- **Unit Tests**: Test packages (elo, jale) in isolation
- **Integration Tests**: Test API delegates with mock services
- **End-to-End Tests**: Test full request/response cycles
- **Database Tests**: Test database service with test database

## Comparison to Previous Architecture

### Before (Scattered Structure)
```
last-price/
├── ab-testing-server/  ← Everything in one place
│   ├── server.js
│   ├── ab-testing.js
│   ├── database.js
│   ├── signals.js
│   └── tenants.js
├── jale/              ← Separate, tightly coupled
│   └── index.js
└── db/                ← Database schema separate
    └── schema.sql
```

Problems:
- Mixed concerns (routing, logic, data access)
- Hard to test in isolation
- Unclear dependencies
- JavaScript (no type safety)

### After (Modular Monolith)
```
last-price/
├── server.ts          ← Entry point
├── packages/          ← Business logic modules
│   ├── elo/
│   └── jale/
├── services/          ← Infrastructure
├── api-delegates/     ← HTTP layer
├── models/            ← Types
└── migrations/        ← Database
```

Benefits:
- Clear separation of concerns
- Independent module development
- Easy to test
- TypeScript type safety
- Single deployment unit
- Future microservices option

## References

- [Modular Monolith Pattern](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
