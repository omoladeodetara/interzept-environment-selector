# Pricing Guide

This document outlines the pricing tiers and billing logic for the Pricing Optimizer platform.

## Pricing Tiers

### Free Tier

**Price:** $0/month

**Included:**
- 1,000 signals per month
- 1 active experiment
- Basic analytics
- Community support

**Best for:** Individuals trying out the platform, small side projects

**Limitations:**
- No overage allowed (hard limit)
- Manual tracking only
- 7-day data retention

---

### Starter Tier

**Price:** $29/month

**Included:**
- 10,000 signals per month
- 5 active experiments
- Advanced analytics
- Email support
- API access
- 30-day data retention

**Overage Rate:** $0.10 per 1,000 additional signals

**Best for:** Small businesses starting with pricing optimization

**Features:**
- Real-time dashboards
- Experiment history
- Basic recommendations

---

### Pro Tier

**Price:** $99/month

**Included:**
- 100,000 signals per month
- Unlimited experiments
- Full analytics suite
- Priority support
- API access
- Webhooks
- Custom integrations
- 90-day data retention

**Overage Rate:** $0.05 per 1,000 additional signals

**Best for:** Growing businesses with significant traffic

**Features:**
- Everything in Starter, plus:
- AI-powered recommendations
- Price elasticity analysis
- Statistical significance testing
- Segment analysis
- Export capabilities

---

### Enterprise Tier

**Price:** $499/month (or custom)

**Included:**
- 1,000,000 signals per month
- Unlimited experiments
- Full analytics suite
- Dedicated support
- API access
- Webhooks
- Custom integrations
- Unlimited data retention
- SLA guarantees

**Overage Rate:** $0.02 per 1,000 additional signals

**Best for:** Large organizations with high traffic

**Features:**
- Everything in Pro, plus:
- BYOK (Bring Your Own Key) support
- Custom contracts
- Dedicated account manager
- Custom integrations
- On-premise deployment option
- SOC 2 compliance reports

---

## Billing Model

### Usage-Based Components

1. **Signals**: Each time a user is assigned to a variant or a conversion is tracked
2. **API Calls**: Each API request to the pricing optimizer

### Billing Cycle

- Monthly billing on the same day each month
- Usage tracked from billing cycle start
- Invoice generated at cycle end

### Overage Calculation

```
Overage = Total Signals - Plan Limit
Overage Charge = (Overage / 1000) × Overage Rate
```

**Example:** Starter plan user with 15,000 signals
```
Overage = 15,000 - 10,000 = 5,000 signals
Overage Charge = (5,000 / 1,000) × $0.10 = $0.50
Total Bill = $29.00 + $0.50 = $29.50
```

---

## BYOK vs Managed Mode

### Managed Mode

In Managed Mode, the platform handles all billing infrastructure:

- You pay us, we handle Paid.ai/Stripe integration
- Usage-based pricing as described above
- No additional API key management

**Advantages:**
- Simple setup
- Consolidated billing
- No vendor relationship to manage

### BYOK Mode

In BYOK (Bring Your Own Key) Mode:

- Use your own Paid.ai API key
- Direct billing relationship with Paid.ai
- Platform only handles experiment logic

**Advantages:**
- Full data control
- Direct vendor relationship
- Potential cost savings at scale
- Custom integration options

**Requirements:**
- Pro or Enterprise tier
- Valid Paid.ai API key
- Accept Paid.ai terms of service

---

## Plan Comparison

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| **Monthly Signals** | 1,000 | 10,000 | 100,000 | 1,000,000 |
| **Active Experiments** | 1 | 5 | Unlimited | Unlimited |
| **Data Retention** | 7 days | 30 days | 90 days | Unlimited |
| **Analytics** | Basic | Advanced | Full | Full |
| **AI Recommendations** | ❌ | ❌ | ✅ | ✅ |
| **Elasticity Analysis** | ❌ | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ✅ | ✅ | ✅ |
| **Webhooks** | ❌ | ❌ | ✅ | ✅ |
| **BYOK Support** | ❌ | ❌ | ❌ | ✅ |
| **Custom Integrations** | ❌ | ❌ | ✅ | ✅ |
| **Dedicated Support** | ❌ | ❌ | ❌ | ✅ |
| **SLA** | ❌ | ❌ | ❌ | ✅ |
| **Overage Rate** | N/A | $0.10/1K | $0.05/1K | $0.02/1K |
| **Price** | $0 | $29/mo | $99/mo | $499/mo |

---

## FAQ

### Can I upgrade or downgrade at any time?

**Upgrade:** Immediate, prorated credit for unused portion of current plan.

**Downgrade:** Takes effect at next billing cycle. Must be within new plan limits.

### What happens if I exceed my limit?

**Free Tier:** API returns 403 error. Upgrade required.

**Paid Tiers:** Overage charges applied at tier rate.

### Do unused signals roll over?

No, signal allocations reset each billing cycle.

### Can I get a volume discount?

Yes, contact sales for custom Enterprise pricing for volumes over 1M signals/month.

### Is there a free trial of Pro features?

Yes, new accounts get 14 days of Pro features. No credit card required.

### How is a "signal" counted?

A signal is counted when:
- A user is assigned to an experiment variant (view)
- A conversion is tracked

Each event = 1 signal.

---

## Custom Enterprise Pricing

For organizations with specific requirements, we offer custom Enterprise packages:

- Custom signal volumes
- Multi-tenant management
- White-label options
- On-premise deployment
- Custom SLAs
- Volume discounts

Contact sales@example.com for a custom quote.
