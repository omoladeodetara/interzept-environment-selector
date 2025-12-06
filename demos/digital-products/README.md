# Digital Products Demo

> **Customer Archetype**: Content Creator / Educator  
> **Use Case**: Course, ebook, membership pricing  
> **Example Company**: "LearnFast Academy"

## 🎯 Problem This Solves

"Should my course be $199 or $299? What's the right price for my membership? Does a payment plan convert better?"

## 📱 Demo Features

- **Course Sales Page**: High-converting landing page with dynamic pricing
- **Membership Tiers**: Monthly vs annual pricing experiments
- **Bundle Offers**: Course bundles with tested prices
- **Payment Plans**: One-time vs installment pricing

## 🔌 Last Price Integration Points

| Page | Experiment | What's Tested |
|------|------------|---------------|
| `/course/[slug]` | `course-price` | $199 vs $249 vs $299 |
| `/membership` | `membership-annual` | $99/yr vs $149/yr |
| `/course/[slug]` | `payment-plan` | One-time vs 3x payments |
| `/bundle` | `bundle-value` | $399 vs $499 for all courses |

## 🏃 Running

```bash
cd demos/digital-products
pnpm install
pnpm dev
# Open http://localhost:3005
```

## 📁 Structure

```
digital-products/
├── app/
│   ├── page.tsx           # Homepage / creator landing
│   ├── course/            # Individual course pages
│   ├── membership/        # Membership signup
│   ├── bundle/            # Course bundles
│   └── checkout/          # Purchase flow
├── components/
│   ├── course-hero.tsx
│   ├── pricing-box.tsx
│   ├── testimonials.tsx
│   ├── curriculum.tsx
│   └── payment-options.tsx
└── lib/
    └── courses.ts
```

## 🎭 User Journey

1. Potential student lands on course page
2. Sees pricing section → **Last Price assigns price variant**
3. Views payment options (one-time vs payment plan)
4. Completes purchase → **Last Price tracks conversion + revenue**

## Pricing Psychology Features

- **Anchoring**: Show "was $499, now $299"
- **Urgency**: "Sale ends in 24 hours"
- **Social Proof**: "1,247 students enrolled"
- **Guarantee**: "30-day money-back guarantee"

All these elements can be A/B tested with Last Price!

## Status: 📋 Scaffold

This demo needs implementation. See `_template/` for starting point.
