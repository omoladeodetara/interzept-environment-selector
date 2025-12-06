# Last Price Demo Applications

> **One platform, many use cases.** This directory contains demo applications showing how different businesses integrate Last Price for pricing experiments.

---

## 🎯 What Are These Demos?

Each demo is a **real product simulation** that uses Last Price APIs in the background. End users see a normal product - they don't know an experiment is running. This is exactly how your customers would integrate Last Price.

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAST PRICE PLATFORM                          │
│         (Elo A/B Engine + Jale Pricing Optimizer + Oja UI)      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ API
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  SaaS Product │     │  E-commerce   │     │  AI Platform  │
│  (CloudNote)  │     │ (ModernGoods) │     │  (AgentHub)   │
└───────────────┘     └───────────────┘     └───────────────┘
     Demo 1                Demo 2                Demo 3
```

---

## 📁 Demo Directory

| Folder | Product Name | Customer Type | Problem Solved | Status |
|--------|--------------|---------------|----------------|--------|
| `saas-pricing/` | **CloudNote** | SaaS Company | "Should Pro be $19 or $29/mo?" | ✅ Exists |
| `agenting-bank/` | **AgentBank** | AI/Fintech | "HTTP 402 for agent payments" | ✅ Exists |
| `ai-api-platform/` | **CloudAI** | API Provider | "Per-token or per-request pricing?" | 📋 Scaffold |
| `ecommerce-store/` | **ModernGoods** | E-commerce/DTC | "Does $49.99 beat $45?" | 📋 Scaffold |
| `marketplace/` | **SkillHub** | Marketplace | "What take rate maximizes GMV?" | 📋 Scaffold |
| `digital-products/` | **LearnFast** | Content Creator | "Should my course be $199 or $299?" | 📋 Scaffold |
| `_shared/` | — | Shared Code | Last Price client, hooks, utils | ✅ Ready |
| `_template/` | — | Starter | Copy this for new demos | ✅ Ready |

---

## 🚀 Quick Start

### Run an existing demo:
```bash
cd demos/saas-pricing
pnpm install
pnpm dev
```

### Run all demos:
```bash
# From repository root
turbo dev --filter='./demos/*'
```

### Create a new demo:
```bash
cp -r demos/_template demos/my-new-demo
cd demos/my-new-demo
# Edit package.json, then:
pnpm install
pnpm dev
```

---

## 🌐 Deployment

All demos are deployed together in **one Vercel project**: `last-price-demos`

- **Production URL**: `demos.lastprice.io`
- **Demo URLs**:
  - `demos.lastprice.io/saas-pricing`
  - `demos.lastprice.io/agenting-bank`
  - `demos.lastprice.io/ai-api`
  - `demos.lastprice.io/ecommerce`
  - `demos.lastprice.io/marketplace`
  - `demos.lastprice.io/digital-products`

See [`DEPLOYMENT.md`](../DEPLOYMENT.md) for full deployment guide.

---

## 🏗️ Demo Architecture

### Shared Code (`_shared/`)

All demos use the same Last Price integration code:

```typescript
// In any demo's pricing page:
import { usePricingExperiment } from '../../_shared/hooks';

function PricingPage() {
  const { price, variant, loading, trackConversion } = usePricingExperiment('exp_pricing_001');
  
  if (loading) return <PricingSkeleton />;
  
  return (
    <PricingCard 
      price={price}           // $19 or $29 depending on variant
      onPurchase={() => trackConversion(price)}
    />
  );
}
```

### Integration Flow

```
User visits pricing page
        │
        ▼
┌─────────────────────────────────────┐
│ usePricingExperiment('exp_001')     │
│   └── lastPriceClient.assignVariant │
│       └── POST /api/experiments/    │
│           {experimentId}/assign     │
└─────────────────────────────────────┘
        │
        ▼
Returns: { variant: 'B', price: 29.00 }
        │
        ▼
UI displays $29 (user doesn't know it's a test)
        │
        ▼
User clicks "Subscribe"
        │
        ▼
┌─────────────────────────────────────┐
│ trackConversion(29.00)              │
│   └── POST /api/experiments/        │
│       {experimentId}/convert        │
└─────────────────────────────────────┘
        │
        ▼
Last Price records conversion for analytics
```

---

## 📊 Customer Archetypes Deep Dive

### 1. SaaS Company → `saas-pricing/` (CloudNote)

**Who they are:** B2B or B2C software company with subscription plans.

**Their pricing questions:**
- Should Pro be $19, $29, or $39/month?
- Does annual billing at 20% off convert better than 15% off?
- Should we show monthly or annual price first?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/pricing` | `pro-plan-price` | $19 vs $29 vs $39 |
| `/pricing` | `annual-discount` | 15% vs 20% vs 25% off |
| `/pricing` | `default-billing` | Monthly-first vs Annual-first |
| `/checkout` | `trial-length` | 7-day vs 14-day trial |

**Key metrics:** MRR, conversion rate, trial-to-paid rate

---

### 2. AI/Fintech Platform → `agenting-bank/` (AgentBank)

**Who they are:** Platform enabling AI agents to make payments/transactions.

**Their pricing questions:**
- What transaction fee maximizes volume?
- Should we charge flat fee or percentage?
- What credit package sizes work best?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/topup` | `credit-package` | $10/$50/$100 vs $25/$75/$150 |
| `/api/transaction` | `transaction-fee` | 1% vs 2% vs flat $0.10 |
| `/pricing` | `agent-subscription` | Free+fees vs $29/mo flat |

**Key metrics:** Transaction volume, revenue per agent, retention

---

### 3. API Provider → `ai-api-platform/` (CloudAI)

**Who they are:** Company selling API access (AI, data, services).

**Their pricing questions:**
- Per-token or per-request pricing?
- What should the free tier limit be?
- What's the optimal enterprise price?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/pricing` | `pricing-model` | Per-token vs Per-request |
| `/pricing` | `free-tier` | 1K vs 10K vs 100K free requests |
| `/pricing` | `pro-price` | $49 vs $99 vs $199/mo |
| `/enterprise` | `enterprise-price` | $499 vs $999 vs custom |

**Key metrics:** API calls, upgrade rate, revenue per developer

---

### 4. E-commerce/DTC → `ecommerce-store/` (ModernGoods)

**Who they are:** Online store selling physical or digital products.

**Their pricing questions:**
- Does $49.99 convert better than $45?
- What discount drives first purchase?
- Should we offer free shipping at $50 or $75?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/product/[id]` | `product-price` | $45 vs $49.99 vs $55 |
| `/` | `first-purchase` | 10% vs 15% vs 20% off |
| `/cart` | `free-shipping` | $50 vs $75 threshold |
| `/product/[id]` | `bundle-offer` | None vs "Add 2nd for 25% off" |

**Key metrics:** AOV, conversion rate, revenue per visitor

---

### 5. Marketplace → `marketplace/` (SkillHub)

**Who they are:** Two-sided platform connecting buyers and sellers.

**Their pricing questions:**
- What seller commission maximizes GMV?
- Should buyers pay a service fee?
- What should premium listings cost?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/sell/signup` | `seller-commission` | 10% vs 15% vs 20% |
| `/checkout` | `buyer-fee` | 0% vs 3% vs 5% |
| `/sell/promote` | `featured-listing` | $5 vs $10 vs $20 |
| `/pro` | `pro-seller` | $29 vs $49 vs $99/mo |

**Key metrics:** GMV, take rate, seller retention, buyer NPS

---

### 6. Content Creator → `digital-products/` (LearnFast)

**Who they are:** Educator, creator, or info-product seller.

**Their pricing questions:**
- Should my course be $199 or $299?
- Does a payment plan increase conversions?
- What's the right membership price?

**Last Price integration points:**
| Page | Experiment | Variants |
|------|------------|----------|
| `/course/[slug]` | `course-price` | $149 vs $199 vs $299 |
| `/course/[slug]` | `payment-plan` | One-time vs 3x payments |
| `/membership` | `membership-price` | $9 vs $19 vs $29/mo |
| `/bundle` | `bundle-discount` | 20% vs 30% vs 40% off |

**Key metrics:** Revenue per visitor, refund rate, LTV

---

## 🎨 v0 Prompts for Building Demos

Use these prompts with [v0.dev](https://v0.dev) to quickly scaffold each demo:

### SaaS Pricing (CloudNote)
```
Create a modern SaaS pricing page for "CloudNote", a note-taking app. 

Include:
- 3 pricing tiers: Free, Pro ($X/mo), Team ($X/mo) - leave price as {price} variable
- Toggle for monthly/annual billing
- Feature comparison table
- "Start free trial" and "Subscribe" CTAs
- Trust badges and testimonials section

Style: Clean, minimal, similar to Notion or Linear pricing pages
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

### AI API Platform (CloudAI)
```
Create a developer-focused API pricing page for "CloudAI", an AI text generation API.

Include:
- Interactive pricing calculator (input: expected API calls, output: estimated cost)
- 3 tiers: Free (X requests), Developer ($X/mo), Enterprise (custom)
- Code snippets showing API usage
- Usage-based pricing explanation
- "Get API Key" CTA

Style: Developer-friendly like Stripe or OpenAI pricing
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

### E-commerce Store (ModernGoods)
```
Create a product page for "ModernGoods", a DTC home goods brand.

Include:
- Product image gallery
- Price display with {price} variable
- "Add to Cart" button
- Urgency element ("Only 3 left!")
- Related products section
- Reviews summary

Style: Clean, aspirational like Glossier or Away
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

### Marketplace (SkillHub)
```
Create a freelancer marketplace homepage for "SkillHub".

Include:
- Search bar for finding freelancers
- Category cards (Design, Development, Writing, etc.)
- Featured freelancer cards with hourly rate
- "Become a Seller" CTA showing commission rate as {commissionRate}%
- Trust/safety section

Style: Professional like Upwork or Fiverr
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

### Digital Products (LearnFast)
```
Create a course sales page for "LearnFast Academy" selling a course called "Master Python in 30 Days".

Include:
- Hero with course title and {price} variable
- Curriculum accordion
- Instructor bio
- Student testimonials
- Money-back guarantee badge
- Pricing box with payment options
- Urgency countdown timer

Style: High-converting like Teachable or Kajabi course pages
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

### Agenting Bank (AgentBank)
```
Create a fintech dashboard for "AgentBank", a banking platform for AI agents.

Include:
- Account balance display
- Recent transactions list
- "Top Up Credits" CTA with package options
- API usage chart
- Quick actions (Send, Request, Transfer)

Style: Modern fintech like Revolut or Mercury
Tech: Next.js, Tailwind CSS, shadcn/ui components
```

---

## 🔧 Development Guidelines

### Adding Last Price Integration

1. **Import shared client:**
   ```typescript
   import { usePricingExperiment } from '../../_shared/hooks';
   ```

2. **Wrap pricing display:**
   ```typescript
   const { price, loading } = usePricingExperiment('your-experiment-id');
   
   if (loading) return <Skeleton />;
   
   return <span>${price}</span>;
   ```

3. **Track conversions:**
   ```typescript
   const { trackConversion } = usePricingExperiment('your-experiment-id');
   
   const handlePurchase = async () => {
     await trackConversion(price);
     // Continue with purchase flow
   };
   ```

### Environment Variables

Each demo needs:
```env
NEXT_PUBLIC_LASTPRICE_API_URL=http://localhost:3000
NEXT_PUBLIC_LASTPRICE_TENANT_ID=your-tenant-id
NEXT_PUBLIC_EXPERIMENT_ID=your-experiment-id
```

### Port Assignments

| Demo | Port |
|------|------|
| `saas-pricing` | 3001 |
| `agenting-bank` | 3002 |
| `ai-api-platform` | 3003 |
| `ecommerce-store` | 3004 |
| `marketplace` | 3005 |
| `digital-products` | 3006 |
| `_template` | 3010 |

---

## 📈 Success Metrics by Demo

| Demo | Primary Metric | Secondary Metrics |
|------|---------------|-------------------|
| `saas-pricing` | MRR | Trial conversion, churn |
| `agenting-bank` | Transaction volume | Revenue per agent |
| `ai-api-platform` | API revenue | Calls per developer |
| `ecommerce-store` | Revenue per visitor | AOV, conversion rate |
| `marketplace` | GMV | Take rate, seller retention |
| `digital-products` | Course revenue | Refund rate, completion |

---

## 🤝 Contributing

1. Pick a scaffold demo to implement
2. Use the v0 prompt to generate initial UI
3. Add Last Price integration using `_shared/` utilities
4. Test with local Last Price server
5. Submit PR

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.
