# Integration Guide

This guide explains how to integrate the Pricing Optimizer into your application using either BYOK (Bring Your Own Key) or Managed mode.

## Choosing Between BYOK and Managed Mode

### BYOK Mode (Bring Your Own Key)

**Best for:**
- Enterprise customers with existing Paid.ai accounts
- Organizations with strict data governance requirements
- Customers who want full control over their billing data

**How it works:**
- Customer provides their own Paid.ai API key
- All signals and conversions are sent directly to customer's Paid.ai account
- Customer manages their own billing relationship with Paid.ai
- Your platform tracks usage for rate limiting only

### Managed Mode

**Best for:**
- Smaller businesses or startups
- Customers who want a simple, integrated experience
- Quick onboarding without additional vendor relationships

**How it works:**
- Your platform's Paid.ai account is used
- Usage is tracked and billed to customers
- Simplified setup with no API key management

## Integration Steps

### Step 1: Create a Tenant Account

```typescript
// Using the REST API
const response = await fetch('https://your-api.com/api/tenants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Acme Corp',
    plan: 'starter',
    mode: 'managed' // or 'byok'
  })
});

const { tenant, token } = await response.json();
// Store the token for subsequent API calls
```

### Step 2: Configure Integration (BYOK Only)

For BYOK mode, the customer needs to provide their API key:

```typescript
await fetch('https://your-api.com/api/settings/integration', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'byok',
    apiKey: 'customer_paid_api_key',
    baseUrl: 'https://api.paid.ai/v1', // optional
    provider: 'paid-ai'
  })
});
```

### Step 3: Create an Experiment

```typescript
const experiment = await fetch('https://your-api.com/api/experiments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Homepage Pricing Test',
    description: 'Testing $29.99 vs $39.99 for premium plan',
    variants: [
      { name: 'control', price: 29.99, weight: 50 },
      { name: 'premium', price: 39.99, weight: 50 }
    ]
  })
}).then(r => r.json());
```

### Step 4: Activate the Experiment

```typescript
await fetch(`https://your-api.com/api/experiments/${experiment.id}/activate`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Step 5: Assign Variants to Users

When a user visits your pricing page:

```typescript
// Using the SDK
import { PricingOptimizer } from 'pricing-optimizer';

const optimizer = new PricingOptimizer({
  tenantId: tenant.id,
  mode: 'managed', // or 'byok' with apiKey
});

// Get variant for this user
const variant = await optimizer.assignVariant(experiment.id, userId);

// Display the appropriate pricing
displayPricing({
  price: variant.price,
  planName: variant.name
});
```

### Step 6: Track Conversions

When a user subscribes:

```typescript
await optimizer.trackConversion(
  experiment.id,
  userId,
  variant.id,
  variant.price // revenue
);
```

### Step 7: Get Results and Recommendations

```typescript
// Get experiment results
const results = await optimizer.getResults(experiment.id);

console.log(`Control: ${results.variants['control'].conversionRate}%`);
console.log(`Premium: ${results.variants['premium'].conversionRate}%`);

// Get AI recommendations
const recommendation = await optimizer.getRecommendation(experiment.id, {
  objective: 'revenue',
  minPrice: 25,
  maxPrice: 50
});

console.log(`Recommended price: $${recommendation.recommendedPrice}`);
console.log(`Expected revenue change: ${recommendation.expectedImpact.revenueChange}%`);
```

## Client-Side Integration

For web applications, implement variant assignment on the server to ensure consistency:

```typescript
// Server-side (Next.js API route example)
export async function GET(request: Request) {
  const userId = getUserId(request);
  
  const variant = await optimizer.assignVariant(experimentId, userId);
  
  return Response.json({
    price: variant.price,
    variantId: variant.id
  });
}
```

```typescript
// Client-side
const { price, variantId } = await fetch('/api/get-pricing').then(r => r.json());

// Display the price
document.getElementById('price').textContent = `$${price}`;

// Track conversion on checkout
async function onCheckout() {
  await fetch('/api/track-conversion', {
    method: 'POST',
    body: JSON.stringify({ variantId, revenue: price })
  });
}
```

## Webhook Integration

Set up webhooks to receive events from your billing provider:

```typescript
// Configure webhook URL
await fetch('https://your-api.com/api/settings/integration', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    webhookUrl: 'https://your-app.com/webhooks/pricing-optimizer'
  })
});
```

Handle incoming webhooks:

```typescript
// Your webhook handler
app.post('/webhooks/pricing-optimizer', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'experiment.completed':
      // Notify team about completed experiment
      break;
    case 'recommendation.ready':
      // New pricing recommendation available
      break;
  }
  
  res.sendStatus(200);
});
```

## Switching Between Modes

Customers can switch between BYOK and Managed modes:

### Switch to BYOK

```typescript
await fetch('https://your-api.com/api/settings/integration', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'byok',
    apiKey: 'customer_new_api_key'
  })
});
```

### Switch to Managed

```typescript
await fetch('https://your-api.com/api/settings/integration', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'managed'
  })
});
// API key is automatically removed
```

## Error Handling

Always handle potential errors:

```typescript
try {
  const variant = await optimizer.assignVariant(experimentId, userId);
  displayPricing(variant.price);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Fall back to default pricing
    displayPricing(defaultPrice);
  } else if (error.code === 'NOT_FOUND') {
    // Experiment not found or not active
    displayPricing(defaultPrice);
  } else {
    console.error('Pricing error:', error);
    displayPricing(defaultPrice);
  }
}
```

## Best Practices

1. **Always have a fallback price** in case the experiment service is unavailable

2. **Use server-side variant assignment** to prevent users from seeing price changes

3. **Wait for statistical significance** before making pricing decisions (usually 1000+ views per variant)

4. **Run experiments for at least one billing cycle** to capture full conversion patterns

5. **Monitor for anomalies** like sudden drops in conversion rates

6. **Document your experiments** with clear hypotheses and success criteria
