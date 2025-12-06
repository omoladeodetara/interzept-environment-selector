# Demo App - Pricing Experiment Showcase

An example application demonstrating how to integrate the Last Price platform into a real-world pricing experiment scenario.

## Overview

This demo application is **one of several possible demo applications** that showcase the Last Price Pricing Optimizer's features. It serves as a reference implementation for developers building their own applications that use Last Price.

**Important:** This is NOT the administrative UI for Last Price. The administrative UI (Oja) is a separate application. This demo app represents how business owners, developers, and agent creators would build their own applications that integrate with Last Price via APIs.

### What This Demo Showcases

- **Dashboard** - Overview of experiments and key metrics
- **Experiments** - Create, view, and manage A/B pricing tests
- **Recommendations** - AI-powered pricing suggestions
- **Settings** - Configure BYOK vs Managed mode

### Use Cases for Demo Apps

Demo applications like this one serve multiple purposes:

1. **Reference Implementation** - Show developers how to integrate Last Price APIs
2. **Use Case Examples** - Demonstrate specific scenarios (e.g., SaaS pricing, coffee shop simulator, agent marketplace, etc.)
3. **Testing & Validation** - Validate Last Price features in realistic contexts
4. **Educational** - Help new users understand the platform capabilities

## Relationship to Last Price Architecture

```
┌─────────────────────────────────────────────┐
│         Last Price Platform                  │
│   (Core APIs, DB, Optimization Engine)       │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────────┐
        │                     │                   │
   ┌────▼────┐         ┌──────▼──────┐    ┌──────▼──────┐
   │   Oja   │         │  demo-app   │    │  Your App   │
   │ (Admin  │         │  (Example)  │    │  (Custom)   │
   │   UI)   │         │             │    │             │
   └─────────┘         └─────────────┘    └─────────────┘
```

- **Last Price Platform**: Core platform providing APIs and services
- **Oja**: Administrative UI for managing Last Price (to be implemented separately)
- **demo-app**: This example application (one of many possible demos)
- **Your App**: Your own custom application that integrates with Last Price

## Getting Started

### Prerequisites

- Node.js 18+
- The pricing-optimizer API running at `http://localhost:3001`

### Installation

```bash
cd demo-app
npm install
```

### Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The app runs at `http://localhost:3002`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Pages

### Home (`/`)

- Dashboard overview with key metrics
- Recent experiments list
- Feature highlights

### Experiments (`/experiments`)

- List all experiments
- Filter by status (draft, active, completed)
- Create new experiments

### Experiment Details (`/experiments/[id]`)

- View experiment configuration
- See variant performance metrics
- Track statistical significance

### Create Experiment (`/experiments/new`)

- Step-by-step experiment wizard
- Configure variants and weights
- Set experiment metadata

### Recommendations (`/recommendations`)

- View AI-powered pricing recommendations
- See expected revenue/conversion impact
- Follow recommended next steps

### Settings (`/settings`)

- Toggle between BYOK and Managed mode
- Configure API keys (BYOK)
- View plan and usage information
- Billing overview

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui patterns
- **State**: React 19

## Structure

```
demo-app/
├── app/
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx              # Homepage/dashboard
│   ├── experiments/
│   │   ├── page.tsx          # List experiments
│   │   ├── new/page.tsx      # Create experiment
│   │   └── [id]/page.tsx     # Experiment details
│   ├── recommendations/
│   │   └── page.tsx          # Pricing recommendations
│   └── settings/
│       └── page.tsx          # Settings & billing
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api-client.ts         # API client for backend
│   ├── sample-data.ts        # Demo sample data
│   └── utils.ts              # Utility functions
└── package.json
```
