# Marketplace Demo

> **Customer Archetype**: Platform / Marketplace  
> **Use Case**: Commission & take rate experiments  
> **Example Company**: "SkillHub" (freelancer marketplace)

## 🎯 Problem This Solves

"What commission rate maximizes GMV? Should we charge buyers, sellers, or both?"

## 📱 Demo Features

- **Seller Dashboard**: Fee calculator, earnings display
- **Buyer Experience**: Service browsing with fee transparency
- **Listing Creation**: Create listings with fee preview
- **Transaction Flow**: Complete marketplace transaction

## 🔌 Last Price Integration Points

| Page | Experiment | What's Tested |
|------|------------|---------------|
| `/sell` | `seller-commission` | 10% vs 15% vs 20% take rate |
| `/checkout` | `buyer-fee` | No fee vs 5% service fee |
| `/pricing` | `premium-seller` | $29 vs $49/month for premium |
| `/list` | `listing-fee` | Free vs $5 listing fee |

## 🏃 Running

```bash
cd demos/marketplace
pnpm install
pnpm dev
# Open http://localhost:3004
```

## 📁 Structure

```
marketplace/
├── app/
│   ├── page.tsx           # Marketplace homepage
│   ├── browse/            # Browse services/products
│   ├── sell/              # Seller dashboard
│   ├── list/              # Create listing
│   ├── [listing]/         # Listing detail
│   └── checkout/          # Transaction flow
├── components/
│   ├── listing-card.tsx
│   ├── fee-calculator.tsx
│   ├── seller-stats.tsx
│   └── commission-display.tsx
└── lib/
    └── marketplace.ts
```

## 🎭 User Journeys

### Seller Journey
1. Signs up as seller
2. Views fee structure → **Last Price assigns commission variant**
3. Creates listing
4. Completes sale → **Last Price tracks GMV + commission**

### Buyer Journey
1. Browses listings
2. Views checkout with fees → **Last Price assigns buyer fee variant**
3. Completes purchase → **Last Price tracks conversion**

## Status: 📋 Scaffold

This demo needs implementation. See `_template/` for starting point.
