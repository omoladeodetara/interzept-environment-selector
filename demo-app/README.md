# Demo App

A reference implementation demonstrating the Pricing Optimizer's features.

## Overview

This demo application showcases:

- **Dashboard** - Overview of experiments and key metrics
- **Experiments** - Create, view, and manage A/B pricing tests
- **Recommendations** - AI-powered pricing suggestions
- **Settings** - Configure BYOK vs Managed mode

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
