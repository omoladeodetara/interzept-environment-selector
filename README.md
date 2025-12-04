# Last Price: A/B Testing for Pricing Experiments

> *"Wetin be your last price?"* — A comprehensive guide and implementation for discovering optimal pricing through systematic A/B testing, inspired by Nigerian marketplace wisdom.

This repository provides a complete **educational resource and working implementation** for conducting pricing experiments. While the examples use [Paid.ai](https://paid.ai)'s infrastructure, the concepts and patterns apply to any billing platform (Stripe, Chargebee, Paddle, etc.). It includes:

- 📚 **Comprehensive Guide**: Detailed explanation of A/B testing concepts and implementation strategies
- 🏗️ **Modular Monolith Architecture**: TypeScript-based server with clear module boundaries
- 🖥️ **Production-Ready Server**: Express.js backend with OpenAPI specification
- 🎨 **Modern UI Library**: Next.js component library with shadcn/ui patterns ([`/ui`](ui/))
- 🔍 **API Documentation Scraper**: Tool for researching API documentation ([`/scraper`](scraper/))

**Note:** The examples in this repository use Paid.ai as a demonstration platform, but the patterns and architecture can be adapted to work with any billing infrastructure (Stripe, Chargebee, Paddle, Lago, etc.).

## 🏗️ Modular Monolith Architecture

The Last Price server follows a **modular monolith** pattern for clean code organization while maintaining deployment simplicity:

```
last-price/
├── server.ts              # Main entry point
├── packages/              # Business logic modules
│   ├── elo/              # A/B Testing engine
│   └── jale/             # Pricing optimization engine
├── services/             # Infrastructure layer (database, signals)
├── api-delegates/        # HTTP route handlers
├── models/               # TypeScript type definitions
├── utils/                # Shared utilities
├── migrations/           # Database schema
├── ui/                   # Component library (for Oja and other UIs)
└── demo-app/             # Example demo app (one of many possible demos)
```

**Key Benefits:**
- 🎯 **Clear Boundaries**: Each module has a specific responsibility
- 🧪 **Testable**: Mock dependencies at module boundaries
- 🔒 **Type Safe**: Full TypeScript with strict checking
- 📈 **Scalable**: Extract modules to microservices if needed
- 🚀 **Simple Deployment**: Single server process

**[📖 Read the Architecture Documentation →](ARCHITECTURE.md)**

### System Components

**Last Price Platform** - The core A/B testing and pricing optimization platform that provides:
- REST APIs for managing experiments and pricing
- Database for storing experiment data
- Integration with billing platforms (e.g., Paid.ai)
- Optimization algorithms (Elo, Jale)

**Oja** - The administrative UI for Last Price (planned/to be implemented):
- Web interface for managing experiments
- Dashboard for viewing analytics
- Settings for configuring integrations
- Built using the UI component library

**Demo Apps** - Example applications that demonstrate Last Price usage:
- `demo-app/` - Pricing experiment showcase
- Other demos (e.g., "coffee pouring simulator", etc.) can be added to show different use cases
- These are separate applications that integrate with Last Price via APIs

**Your Applications** - Business owners, developers, and agent creators build their own apps:
- Custom software that uses Last Price for pricing experiments
- Integration via Last Price REST APIs
- Optional: Use Oja UI for administration alongside their own apps

## 🎨 UI Component Library

This repository now includes a **production-ready UI component library** built with [shadcn/ui](https://ui.shadcn.com/) patterns and [Tailwind CSS v4](https://tailwindcss.com/). The component library provides a modern, accessible, and fully responsive interface for pricing experiments and analytics visualization.

**[📚 View UI Component Library Documentation →](UI_COMPONENT_LIBRARY.md)**

> **Note**: The `/shadcn-ui` submodule contains a [shadcn/ui reference repository](https://github.com/omoladeodetara/ui.git) that serves as inspiration for the UI components in the `/ui` directory. It's included as a Git submodule to allow easy access to shadcn/ui patterns and examples when developing or updating components.

### Quick Start

```bash
cd ui
npm install
npm run dev
# Open http://localhost:3000
```

### Key Features

- ✨ **Modern Stack**: Next.js 16 + TypeScript + Tailwind CSS v4
- 🎨 **shadcn/ui Components**: Button, Card, Badge, Input, Label, and more
- 🌓 **Dark Mode**: Automatic dark mode based on system preferences
- 📱 **Fully Responsive**: Mobile-first design
- ♿ **Accessible**: WCAG 2.1 AA compliant
- 🧩 **Domain Components**: PricingCard, AnalyticsDashboard

## Introduction: From Market Haggling to Data-Driven Pricing

In bustling Nigerian markets, the phrase "what is your last price?" marks the culmination of a negotiation dance—a final offer after careful back-and-forth between buyer and seller. This cultural wisdom recognizes that the right price isn't static; it emerges through testing, observation, and adaptation. Much like a market vendor who adjusts their pricing based on customer reactions, modern SaaS businesses use A/B testing to discover their "last price"—the optimal pricing strategy that maximizes both customer satisfaction and revenue.

Just as vendors observe when customers "walk away" to refine their approach, companies track churn metrics. Where vendors rely on intuition honed through thousands of interactions, businesses leverage data analytics to understand patterns. The marketplace haggle and the A/B test share the same fundamental truth: discovering the right price is an iterative process of proposing, observing, and refining.

This guide explores how to conduct this discovery process systematically using modern billing infrastructure—bringing the marketplace wisdom of "last price" negotiation into the digital age through rigorous experimentation and data-driven decision making. The examples use Paid.ai, but the architecture and patterns apply to any billing platform.

## What is Paid.ai?

Paid.ai is an AI platform focused on monetization and billing infrastructure for the AI agent economy. The company provides solutions for SaaS businesses to transition from traditional seat-based pricing to usage-based models tailored for AI agents.

**Funding**: Paid.ai raised $21 million in a seed round led by Lightspeed, FUSE, and EQT, with participation from Sequoia Capital and strategic angel investors.

**Vision**: The company aims to help SaaS companies "break free from the seat-based trap," anticipating that up to 50% of the workforce will consist of AI agents by 2030 (as projected by Gartner, see [Gartner: AI Agents and the Future of Work, 2023](https://www.gartner.com/en/newsroom/press-releases/2023-09-12-gartner-predicts-50-percent-of-workforce-could-be-ai-agents-by-2030)). This shift requires new approaches to pricing and billing.

### Platform Features

1. **Usage-Based Pricing**: Infrastructure for tracking and billing based on API calls, compute usage, or other metrics rather than per-seat pricing
2. **Real-Time Metering**: Track usage events as they happen with the Signals API
3. **Flexible Billing**: Support for various pricing models and billing cycles
4. **Webhooks**: Get notified of billing events for integration with your systems
5. **Analytics Dashboard**: Visualize usage patterns and revenue metrics
6. **Payment Gateway Integration**: Connect with Stripe and other payment processors

### Use Cases

- **AI Agent Platforms**: Bill customers based on agent activity rather than number of seats
- **API Products**: Charge based on API call volume and complexity  
- **Infrastructure Services**: Price based on actual resource consumption
- **SaaS Modernization**: Transition legacy seat-based products to usage-based models

For more information, visit the [Paid.ai website](https://paid.ai) or their [community](https://paid.ai/community).

### Alternative Billing Platforms

*Just as a marketplace has many vendors offering similar goods, the billing infrastructure space offers several solutions to consider:*

While this guide focuses on Paid.ai, here are other platforms that provide usage-based billing and monetization infrastructure:

1. **[Stripe Billing](https://stripe.com/billing)**: Industry-standard subscription management with extensive payment processing capabilities and global reach. *Choose Stripe Billing for comprehensive payment processing needs and global scalability.*
2. **[Chargebee](https://www.chargebee.com/)**: Advanced subscription and revenue operations platform with sophisticated billing workflows. *Consider Chargebee for complex subscription management and revenue automation.*
3. **[Paddle](https://www.paddle.com/)**: Merchant of record solution with built-in tax handling, making global selling simpler. *Use Paddle if you need simplified global tax compliance and merchant of record services.*
4. **[Lago](https://www.getlago.com/)**: Open-source usage-based billing platform offering full control and customization. *Consider Lago for open-source flexibility and self-hosting requirements.*
5. **[Orb](https://www.withorb.com/)**: Modern usage-based billing infrastructure similar to Paid.ai, focused on flexible pricing models. *Choose Orb for developer-friendly APIs and advanced usage-based pricing.*
6. **[Metronome](https://metronome.com/)**: Enterprise-grade usage-based billing designed for complex B2B pricing scenarios. *Use Metronome for large-scale, enterprise B2B billing with complex pricing needs.*

Each platform has unique strengths—evaluate based on your specific needs for pricing flexibility, integration complexity, and scale requirements.

## Building an A/B Testing Solution (Example: Paid.ai)

*Like a market vendor testing different price points with different customers, A/B testing reveals what pricing strategy truly resonates.*

This section demonstrates how to build a pricing A/B testing solution using Paid.ai as an example.

**Does Paid.ai support A/B testing?**

Paid.ai does not currently offer built-in A/B testing functionality. The platform focuses on billing infrastructure, usage tracking, and monetization rather than experimentation features. However, you can build a custom A/B testing solution that integrates with Paid.ai's APIs to test different pricing strategies.

To enable A/B testing for pricing experiments, you can build a custom system that integrates with Paid.ai's existing APIs. This is a separate service in your application that leverages Paid.ai's billing infrastructure through their REST APIs:

*Think of this as setting up your own marketplace stall—you control the prices offered, while Paid.ai handles the transaction infrastructure.*

### Prerequisites and Architecture Approach

**Prerequisites:**
- Paid.ai account with API access
- Familiarity with [Paid.ai's Signals API](https://docs.paid.ai/signals-api) for tracking usage and billing events (Signals API enables real-time event tracking such as API calls, resource consumption, and other usage metrics; see [Signals API documentation](https://docs.paid.ai/signals-api) for details)
- Webhook endpoint to receive billing events
- Database to store experiment assignments and results

**Architecture Approach:**

*Just as a vendor remembers which customers responded to which prices, your system needs to track experiment assignments and outcomes.*

Your custom A/B testing system should include:

1. **Variant Assignment Logic**: Randomly assign users to control or experimental pricing tiers
2. **Signals API Integration**: Track pricing-related events using Paid.ai's Signals API
3. **Webhook Integration**: Listen for subscription and payment events from Paid.ai
4. **Analytics Dashboard**: Analyze conversion rates, revenue, and other metrics per variant

### Key Implementation Steps

#### 1. Emit A/B Test Signals

*Like a vendor noting which price point a customer accepted or rejected, you emit signals to track user behavior.*

Use Paid.ai's Signals API to track which pricing variant a user experienced and whether they converted:

**Note**: The following code examples are illustrative. In production, add comprehensive input validation, error handling, webhook signature verification, and implement placeholder functions like `getExperimentVariant()` and your analytics tracking system.

```javascript
async function emitABTestSignal(orderId, variant, conversionEvent, experimentId) {
  if (typeof experimentId !== 'string' || experimentId.trim() === '') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('Invalid orderId: must be a non-empty string');
  }
  
  if (!['control', 'experiment'].includes(variant)) {
    throw new Error('Invalid variant: must be "control" or "experiment"');
  }
  
  if (typeof conversionEvent !== 'boolean') {
    throw new Error('Invalid conversionEvent: must be a boolean');
  }
  
  try {
    const response = await fetch('https://api.paid.ai/v1/signals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId,
        event_type: 'ab_test',
        properties: {
          variant: variant,  // 'control' or 'experiment'
          experiment_id: experimentId,
          conversion: conversionEvent
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to emit signal: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error emitting A/B test signal:', error);
    throw error;
  }
}

// Example: Track when user sees pricing page
await emitABTestSignal('order_123', 'experiment', false, 'pricing_test_001');

// Example: Track when user subscribes
await emitABTestSignal('order_123', 'experiment', true, 'pricing_test_001');
```

#### 2. Handle Paid.ai Webhooks

*When a transaction completes—like when a customer hands over payment—your webhook receives the notification.*

Set up a webhook endpoint to receive subscription and payment events from Paid.ai, linking them to your A/B test experiments:

```javascript
app.post('/webhooks/paid', async (req, res) => {
  const event = req.body;
  
  // Validate event data exists
  if (!event || !event.data) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }
  
  // NOTE: The fields `customerId` and `experimentId` are assumed to be custom fields
  // added to Paid.ai webhook payloads via your own integration or mapping layer.
  // Standard Paid.ai webhooks may use different field names (e.g., `customer`, `subscription`).
  // Update this validation to match your actual webhook payload structure.
  if (!event.data.customerId || !event.data.experimentId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Event-specific validation
  if (event.type === 'subscription.created' && !event.data.amount) {
    return res.status(400).json({ error: 'Missing amount for subscription' });
  }
  
  // Process webhook with validated data
  try {
    // Look up the customer's experiment variant
    const variant = await getExperimentVariant(event.data.customerId, event.data.experimentId);
    
    // Record the conversion in your analytics system
    await abTesting.trackConversion(
      event.data.customerId,
      event.data.experimentId,
      {
        variant: variant,
        revenue: event.data.amount,
        timestamp: new Date()
      }
    );
    
    res.status(200).send('OK');
  } catch (error) {
    // In production, use proper error logging/monitoring (e.g., Sentry, Datadog) instead of just console.error
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Sample Implementation Architecture

*Your A/B testing marketplace stall:*

```
1. User visits your app
   ↓
2. Assign to variant (control/experiment)
   ↓
3. Show corresponding pricing
   ↓
4. Emit signal to Paid.ai (variant shown)
   ↓
5. User proceeds to checkout/payment (Paid.ai hosted checkout or custom payment form)
   ↓
6. User subscribes via Paid.ai
   ↓
7. Paid.ai webhook fires → Your endpoint
   ↓
8. Record conversion with variant
   ↓
9. Analyze results to find your "last price"
```

### Analyzing Results

*After many market days, a vendor knows which prices work best. Similarly, analyze your data to find the winning strategy.*

Compare key metrics across variants:
- **Conversion Rate**: Percentage of users who subscribe
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**
- **Churn Rate**: Users who "walk away" from each price point
- **Statistical Significance**: Ensure results are reliable, not just chance

> **Best Practice:** Before drawing conclusions, ensure each variant has a sufficient sample size (e.g., at least 100 conversions per variant) and run your test for a full billing cycle or until you reach statistical significance. This helps avoid decisions based on insufficient data and ensures your results are robust.

The variant that maximizes your target metric (usually revenue or conversions while maintaining acceptable churn) becomes your "last price"—your optimal pricing strategy.

### Resources for Integration

- [Paid.ai API Documentation](https://docs.paid.ai)
- [Signals API Reference](https://docs.paid.ai/api-reference/signals)
- [Webhooks Guide](https://docs.paid.ai/webhooks)
- [Authentication](https://docs.paid.ai/authentication)

## UI Component Library & Oja Admin Interface

This repository includes a complete **UI component library** that provides the foundation for building modern, accessible pricing and analytics interfaces using **shadcn/ui** patterns and **Tailwind CSS**.

### Component Library (`/ui`)

The `/ui` directory contains:

- **Production-ready React components** with TypeScript
- **shadcn/ui component patterns** (Button, Card, Badge, Input, Label)
- **Domain-specific components**:
  - `PricingCard` - Display pricing variants for A/B tests
  - `AnalyticsDashboard` - Visualize experiment results
- **Tailwind CSS v4** with custom design tokens
- **Dark mode support** (automatic based on system preferences)
- **Fully responsive** mobile-first design
- **Accessible** WCAG 2.1 AA compliant

### Running the UI Component Demo

```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Oja - Administrative UI (Planned)

**Oja** is the planned administrative web interface for managing the Last Price platform. It will provide:

- **Experiment Management** - Create, configure, and monitor pricing experiments
- **Analytics Dashboard** - View comprehensive experiment results and metrics
- **Tenant Administration** - Manage multi-tenant settings (BYOK vs Managed mode)
- **API Configuration** - Configure integrations with billing platforms
- **Usage Monitoring** - Track platform usage and performance

Oja will be built using the `/ui` component library and will serve as the primary management interface for users who prefer a graphical interface over API-only interaction. Business owners, developers, and agent creators can choose to:

1. **Use Oja UI** - Manage experiments through the web interface
2. **Use APIs directly** - Integrate Last Price into their own applications
3. **Use both** - Administer via Oja while their apps use the APIs

### Demo Applications vs. Oja

- **Oja** = Administrative UI for Last Price platform
- **Demo Apps** = Example applications showing how to integrate Last Price
  - `demo-app/` - Pricing experiment showcase
  - Future demos - "coffee pouring simulator", agent marketplace, etc.

Demo apps are separate applications that business owners would build for their specific use cases, integrating with Last Price via APIs.

### Documentation

- **[Complete UI Documentation](UI_COMPONENT_LIBRARY.md)** - Comprehensive guide to all components
- **[UI README](ui/README.md)** - Setup and usage instructions
- Component source code in `/ui/src/components/`

### Example Usage

```tsx
import { PricingCard } from "@/components/pricing-card"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

// Display pricing for A/B test variant
<PricingCard
  plan="Premium"
  price={39.99}
  features={["Feature 1", "Feature 2"]}
  variant="experiment"
  onConvert={() => handleSubscribe()}
/>

// Show experiment results
<AnalyticsDashboard results={experimentData} />
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone the repository with submodules
git clone --recurse-submodules https://github.com/omoladeodetara/last-price.git
cd last-price

# Or if you already cloned without submodules, initialize them:
git submodule update --init

# Install dependencies
npm install

# Setup database
sudo -u postgres psql -c "CREATE DATABASE lastprice;"
sudo -u postgres psql -d lastprice -f migrations/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your Paid.ai API key and database credentials

# Build TypeScript
npm run build

# Start development server
npm run dev
```

The server will start at http://localhost:3000

### Available Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /api-docs` (Swagger UI)
- **Tenants**: `POST /api/tenants`, `GET /api/tenants`, etc.
- **Experiments**: `GET /api/experiments/:id/pricing`, `POST /api/experiments/:id/convert`
- **Optimization**: `POST /api/jale/optimize`
- **Webhooks**: `POST /webhooks/paid`

### Running the Demo App

The demo app is an example application that demonstrates how to integrate Last Price into a real-world scenario. It showcases pricing experiment features and can serve as a reference implementation for building your own applications.

```bash
cd demo-app
npm install
npm run dev
# Open http://localhost:3002
```

**Note:** This is one of several demo applications. Additional demos (such as a "coffee pouring simulator" or other domain-specific examples) can be created to demonstrate different use cases. Each demo is a separate application that uses the Last Price platform APIs.

## Conclusion: Traditional Wisdom Meets Modern Analytics

The Nigerian marketplace teaches us that finding the right price is never a guess—it's discovered through patient negotiation, keen observation, and willingness to adapt. Modern A/B testing embodies this same wisdom at scale. Where a vendor adjusts prices based on customer reactions throughout the day, businesses now adjust pricing strategies based on thousands of data points collected through systematic experimentation.

Modern billing infrastructure platforms provide the tools to conduct these pricing experiments with the rigor they deserve—tracking every signal, processing every transaction, and providing the data needed to discover your "last price." Whether you use Paid.ai, Stripe, Chargebee, or another platform, the principle remains the same: the best price isn't guessed, it's discovered through continuous learning and adaptation.

*"Wetin be your last price?"—the question that drives discovery, whether asked in a Lagos market or through an A/B test dashboard.*

## OpenAPI Specifications

This repository includes OpenAPI 3.0 specifications for API-first development:

| Specification | Location | Description |
|--------------|----------|-------------|
| Last Price API | [`openapi.yaml`](openapi.yaml) | Main server API (tenants, experiments, pricing) |
| Paid.ai API | [`paid-api/openapi.yaml`](paid-api/openapi.yaml) | Paid.ai platform API reference |

Use these specifications to:
- Generate API clients in your preferred language
- Generate server stubs for new implementations
- Validate API requests and responses
- Explore the API via Swagger UI at `/api-docs`

**Development Server:**
```bash
npm run dev
# Open http://localhost:3000/api-docs for interactive API documentation
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

**Key guideline**: When adding API functionality, prefer generating code from OpenAPI specifications rather than hand-writing endpoint implementations.
