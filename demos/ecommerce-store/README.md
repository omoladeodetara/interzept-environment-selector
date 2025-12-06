# E-commerce Store Demo

> **Customer Archetype**: E-commerce / DTC Brand  
> **Use Case**: Product & bundle pricing experiments  
> **Example Company**: "ModernGoods"

## 🎯 Problem This Solves

"Does $49.99 convert better than $45? Should we bundle products? What discount level works best?"

## 📱 Demo Features

- **Product Pages**: Individual product with dynamic pricing
- **Bundle Deals**: Product bundles with tested prices
- **Cart & Checkout**: Full purchase flow
- **Discount Banners**: A/B tested promotional messaging

## 🔌 Last Price Integration Points

| Page | Experiment | What's Tested |
|------|------------|---------------|
| `/products/[id]` | `product-price-001` | $45 vs $49.99 |
| `/bundles` | `bundle-discount` | 15% vs 25% bundle savings |
| `/cart` | `free-shipping-threshold` | $50 vs $75 free shipping |
| `/` | `hero-discount` | 10% vs 20% first order discount |

## 🏃 Running

```bash
cd demos/ecommerce-store
pnpm install
pnpm dev
# Open http://localhost:3003
```

## 📁 Structure

```
ecommerce-store/
├── app/
│   ├── page.tsx           # Homepage with featured products
│   ├── products/          # Product listing & detail
│   ├── bundles/           # Bundle deals
│   ├── cart/              # Shopping cart
│   └── checkout/          # Checkout flow
├── components/
│   ├── product-card.tsx
│   ├── price-display.tsx
│   ├── cart-summary.tsx
│   └── promo-banner.tsx
└── lib/
    └── products.ts
```

## 🎭 User Journey

1. Customer browses products
2. Views product detail → **Last Price assigns price variant**
3. Adds to cart (price from experiment)
4. Completes checkout → **Last Price tracks conversion + revenue**

## Status: 📋 Scaffold

This demo needs implementation. See `_template/` for starting point.
