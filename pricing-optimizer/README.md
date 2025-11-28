# Pricing Optimizer

A hybrid multi-tenant pricing optimizer that supports both "Bring Your Own Key" (BYOK) and "Managed Mode" for Paid.ai integration.

## API-First Design

This project follows an **OpenAPI-first approach**. The API specification is defined in [`openapi.yaml`](./openapi.yaml) following the OpenAPI 3.0.3 standard.

### Viewing the API Documentation

You can view the API documentation using any OpenAPI-compatible tool:

```bash
# Using Swagger UI (via Docker)
docker run -p 8080:8080 -e SWAGGER_JSON=/api/openapi.yaml -v $(pwd):/api swaggerapi/swagger-ui

# Or use online viewers like:
# - https://editor.swagger.io/
# - https://petstore.swagger.io/
```

## Features

- **Multi-Tenant Architecture**: Manage multiple customer accounts with isolated data and configurations
- **Hybrid Mode Support**: BYOK mode for customers with their own API keys, Managed mode using platform credentials
- **Price Elasticity Calculations**: Statistical analysis of how price changes affect demand
- **AI-Powered Recommendations**: Generate pricing recommendations based on A/B test results
- **A/B Test Management**: Full CRUD operations for pricing experiments
- **Usage Tracking & Billing**: Track usage per tenant with tiered pricing plans
- **Multiple Provider Integrations**: Support for Paid.ai, Stripe, and manual tracking

## Quick Start

### Installation

```bash
cd pricing-optimizer
npm install
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the required environment variables:

```env
# Platform Configuration
PLATFORM_MODE=hybrid  # 'byok-only', 'managed-only', or 'hybrid'

# Managed Mode - Your Paid.ai Account
PAID_API_KEY=your_platform_paid_api_key
PAID_API_BASE_URL=https://api.paid.ai/v1

# Authentication
JWT_SECRET=your-super-secret-jwt-key
```

### Starting the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server will start at `http://localhost:3001`

## Usage Examples

### BYOK Mode Setup

```typescript
import { PricingOptimizer } from 'pricing-optimizer';

// Customer provides their Paid.ai key
const optimizer = new PricingOptimizer({
  tenantId: 'coffee-shop-123',
  mode: 'byok',
  provider: {
    type: 'paid-ai',
    apiKey: 'customer_paid_api_key_here',
    baseUrl: 'https://api.paid.ai/v1'
  }
});

// Create an experiment
const experiment = await optimizer.createExperiment({
  name: 'Latte Pricing Test',
  variants: [
    { name: 'control', price: 4.99 },
    { name: 'experiment', price: 5.49 }
  ]
});

// Start the experiment
await optimizer.startExperiment(experiment.id);

// Assign users to variants
const variant = await optimizer.assignVariant(experiment.id, 'user-123');

// Track conversions
await optimizer.trackConversion(experiment.id, 'user-123', variant.id, 5.49);

// Get results
const results = await optimizer.getResults(experiment.id);

// Get recommendations
const recommendation = await optimizer.getRecommendation(experiment.id, {
  objective: 'revenue'
});
```

### Managed Mode Setup

```typescript
import { PricingOptimizer } from 'pricing-optimizer';

// Customer uses platform's managed service
const optimizer = new PricingOptimizer({
  tenantName: 'coffee-shop-123',
  mode: 'managed'
  // Platform's Paid.ai key is used from environment variables
});

// Same API as BYOK mode
const experiment = await optimizer.createExperiment({
  name: 'Latte Pricing Test',
  variants: [
    { name: 'control', price: 4.99 },
    { name: 'experiment', price: 5.49 }
  ]
});
```

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tenants` | Create a new tenant |
| POST | `/api/auth/token` | Generate authentication token |
| GET | `/health` | Health check |

### Protected Endpoints (require Bearer token)

#### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/experiments` | Create new experiment |
| GET | `/api/experiments` | List all experiments |
| GET | `/api/experiments/:id` | Get experiment details |
| PATCH | `/api/experiments/:id` | Update experiment |
| DELETE | `/api/experiments/:id` | Delete experiment |
| POST | `/api/experiments/:id/variants` | Add pricing variant |
| POST | `/api/experiments/:id/activate` | Start experiment |
| POST | `/api/experiments/:id/stop` | Stop experiment |
| GET | `/api/experiments/:id/results` | Get experiment results |

#### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations/analyze` | Analyze current pricing |
| GET | `/api/recommendations/:experimentId` | Get recommendations |
| POST | `/api/recommendations/simulate` | Simulate pricing changes |

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Overview dashboard |
| GET | `/api/analytics/experiments/:id` | Detailed experiment analytics |
| GET | `/api/analytics/elasticity` | Price elasticity analysis |
| POST | `/api/analytics/compare` | Compare multiple experiments |

#### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/integration` | Get current integration config |
| PUT | `/api/settings/integration` | Switch between BYOK/Managed |
| POST | `/api/settings/validate-key` | Validate API key |
| GET | `/api/settings/usage` | Get usage information |
| GET | `/api/settings/billing` | Get billing information |

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
pricing-optimizer/
├── core/                      # Core business logic
│   ├── types.ts               # TypeScript interfaces
│   ├── price-calculator.ts    # Elasticity calculations
│   ├── recommendation-engine.ts # AI recommendations
│   ├── experiment-manager.ts  # A/B test management
│   └── analytics.ts           # Metrics & insights
│
├── integrations/              # Provider integrations
│   ├── adapter.ts             # Common interface
│   ├── paid-ai-adapter.ts     # Paid.ai integration
│   ├── stripe-adapter.ts      # Stripe integration
│   └── manual-adapter.ts      # Manual/CSV tracking
│
├── multi-tenant/              # Multi-tenancy
│   ├── tenant-manager.ts      # Tenant accounts
│   ├── key-manager.ts         # API key handling
│   ├── usage-tracker.ts       # Usage tracking
│   └── billing.ts             # Billing calculations
│
├── api/                       # REST API
│   ├── server.ts              # Express server
│   ├── routes/                # API routes
│   └── middleware/            # Auth & rate limiting
│
└── __tests__/                 # Test files
```

## License

MIT
