# AI API Platform Demo

> **Customer Archetype**: API Provider  
> **Use Case**: Usage-based & token pricing experiments  
> **Example Company**: "AI Writer API"

## 🎯 Problem This Solves

"Should we charge $0.002 per token or $0.01 per request? What's the optimal free tier limit?"

## 📱 Demo Features

- **Pricing Calculator**: Interactive calculator showing cost for different usage levels
- **API Dashboard**: Developer dashboard with usage metrics
- **Tier Selection**: Free, Developer, Pro, Enterprise tiers
- **Token Counter**: Real-time token usage display

## 🔌 Last Price Integration Points

| Page | Experiment | What's Tested |
|------|------------|---------------|
| `/pricing` | `api-pricing-model` | Per-token vs per-request |
| `/pricing` | `free-tier-limit` | 1K vs 10K free requests |
| `/checkout` | `enterprise-pricing` | $499 vs $999/month |

## 🏃 Running

```bash
cd demos/ai-api-platform
pnpm install
pnpm dev
# Open http://localhost:3002
```

## 📁 Structure

```
ai-api-platform/
├── app/
│   ├── page.tsx           # Landing page
│   ├── pricing/           # Pricing calculator
│   ├── dashboard/         # API usage dashboard
│   ├── docs/              # API documentation
│   └── playground/        # API playground
├── components/
│   ├── pricing-calculator.tsx
│   ├── usage-chart.tsx
│   └── code-example.tsx
└── lib/
    └── api-client.ts
```

## 🎭 User Journey

1. Developer lands on homepage
2. Views pricing page → **Last Price assigns variant**
3. Uses pricing calculator to estimate costs
4. Signs up for free tier
5. Upgrades to paid tier → **Last Price tracks conversion**

## Status: 📋 Scaffold

This demo needs implementation. See `_template/` for starting point.
