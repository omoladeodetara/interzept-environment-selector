# Architecture

This document describes the architecture and design decisions of the Pricing Optimizer system.

## Overview

The Pricing Optimizer is a hybrid multi-tenant system designed to help businesses optimize their pricing strategies through A/B testing and data-driven recommendations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Applications                             │
│        (Demo App, Customer Integrations, Third-party Services)           │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API Gateway Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Auth     │  │ Rate Limit  │  │   Usage     │  │   Routes    │    │
│  │ Middleware  │  │ Middleware  │  │  Tracking   │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Core Services                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   Experiment     │  │  Recommendation  │  │    Analytics     │      │
│  │    Manager       │  │     Engine       │  │    Service       │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│  ┌──────────────────┐                                                   │
│  │ Price Calculator │                                                   │
│  └──────────────────┘                                                   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Multi-Tenant Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Tenant Manager  │  │   Key Manager    │  │  Usage Tracker   │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│  ┌──────────────────┐                                                   │
│  │     Billing      │                                                   │
│  └──────────────────┘                                                   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Integration Adapters                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Paid.ai Adapter │  │  Stripe Adapter  │  │  Manual Adapter  │      │
│  │  (BYOK/Managed)  │  │                  │  │   (CSV/In-mem)   │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      External Services                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │    Paid.ai API   │  │   Stripe API     │  │    Database      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Core Services

#### Price Calculator
- Calculates price elasticity of demand from A/B test results
- Uses statistical methods to determine confidence intervals
- Applies psychological pricing principles

#### Experiment Manager
- Full CRUD operations for experiments
- Manages experiment lifecycle (draft → active → completed)
- Consistent variant assignment using hashing
- Tracks views and conversions per variant

#### Recommendation Engine
- Analyzes experiment results
- Generates pricing recommendations based on business goals
- Provides confidence scores and reasoning
- Suggests next steps for implementation

#### Analytics Service
- Aggregates data for dashboard views
- Calculates advanced metrics
- Provides comparison tools for experiments

### 2. Multi-Tenant Layer

#### Tenant Manager
- Creates and manages customer accounts
- Handles plan management (free, starter, pro, enterprise)
- Tracks usage limits

#### Key Manager
- Encrypts and stores customer API keys (BYOK mode)
- Provides secure key retrieval
- Supports key rotation

#### Usage Tracker
- Tracks API calls and signals per tenant
- Provides usage summaries and trends
- Detects when approaching limits

#### Billing
- Calculates monthly charges
- Determines overage costs
- Recommends optimal plans

### 3. Integration Adapters

All adapters implement a common `BillingAdapter` interface:

```typescript
interface BillingAdapter {
  emitSignal(data: SignalData): Promise<void>;
  trackConversion(data: ConversionData): Promise<void>;
  getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics>;
  mode: 'managed' | 'byok';
}
```

#### Paid.ai Adapter
- Sends signals to Paid.ai's API
- Supports both BYOK (customer keys) and Managed (platform keys) modes

#### Stripe Adapter
- Integrates with Stripe Billing
- Tracks conversions via Stripe metadata

#### Manual Adapter
- In-memory tracking for demos and testing
- CSV export/import capabilities

## Data Flow

### Creating an Experiment

1. Client sends POST request to `/api/experiments`
2. Auth middleware validates JWT token
3. Rate limit middleware checks request quota
4. Experiment Manager creates experiment with variants
5. Response returned to client

### Recording a Conversion

1. Client assigns variant via SDK
2. SDK calls `assignVariant()` which:
   - Gets active experiment
   - Assigns user to variant via consistent hash
   - Records view in metrics
   - Emits signal to external provider
3. User converts, client calls `trackConversion()`
4. SDK records conversion and sends to provider
5. Usage tracked for billing

### Getting Recommendations

1. Client requests recommendation for experiment
2. System retrieves experiment results
3. Recommendation Engine:
   - Calculates elasticity
   - Applies business goals
   - Generates optimal price
   - Creates reasoning and next steps
4. Returns recommendation with confidence score

## Security

### Authentication
- JWT-based authentication for API access
- Tokens include tenant ID for multi-tenancy
- 24-hour token expiration by default

### API Key Security
- Customer API keys encrypted at rest using AES-256-GCM
- Keys stored with IV and auth tag
- Never logged or exposed in responses

### Rate Limiting
- Per-tenant rate limits based on plan tier
- Default limits: Free (60/min), Starter (300/min), Pro (1000/min)
- Usage-based limits to prevent abuse

## Scalability Considerations

### Current Implementation (In-Memory)
- Suitable for development and small deployments
- Fast access, no external dependencies
- Data lost on server restart

### Production Recommendations

1. **Database**: PostgreSQL for persistent storage
   - Experiments, variants, metrics
   - Tenant configurations
   - Usage records

2. **Caching**: Redis for:
   - Rate limit tracking
   - Session data
   - Variant assignment cache

3. **Message Queue**: For async processing
   - Signal emission
   - Analytics aggregation
   - Billing calculations

## Design Decisions

### 1. Hybrid Mode (BYOK + Managed)
- **Rationale**: Flexibility for different customer segments
- BYOK appeals to enterprise customers with security requirements
- Managed mode reduces friction for smaller customers

### 2. In-Memory Storage for MVP
- **Rationale**: Simplicity and speed for initial development
- Easy to swap out for production databases
- No external dependencies for testing

### 3. Consistent Hashing for Variant Assignment
- **Rationale**: Same user always gets same variant
- Deterministic without storing assignments
- Hash based on userId + experimentId

### 4. Statistical Significance Calculation
- **Rationale**: Helps users make informed decisions
- Z-test for comparing conversion rates
- Clear confidence intervals

### 5. Psychological Pricing
- **Rationale**: .99 endings proven more effective
- Automatic application for recommendations
- Configurable based on price range
