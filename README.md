# fluff-fuzzy-succotash

**Note:** The API documentation scraper used for research is located in the [`/scraper`](scraper/) folder.

## Introduction: From Market Haggling to Data-Driven Pricing

In bustling Nigerian markets, the phrase "what is your last price?" marks the culmination of a negotiation dance—a final offer after careful back-and-forth between buyer and seller. This cultural wisdom recognizes that the right price isn't static; it emerges through testing, observation, and adaptation. Much like a market vendor who adjusts their pricing based on customer reactions, modern SaaS businesses use A/B testing to discover their "last price"—the optimal pricing strategy that maximizes both customer satisfaction and revenue.

Just as vendors observe when customers "walk away" to refine their approach, companies track churn metrics. Where vendors rely on intuition honed through thousands of interactions, businesses leverage data analytics to understand patterns. The marketplace haggle and the A/B test share the same fundamental truth: discovering the right price is an iterative process of proposing, observing, and refining.

This guide explores how Paid.ai's infrastructure enables modern businesses to conduct this discovery process systematically—bringing the marketplace wisdom of "last price" negotiation into the digital age through rigorous experimentation and data-driven decision making.

## What is Paid.ai?

Paid.ai is an AI platform focused on monetization and billing infrastructure for the AI agent economy. The company provides solutions for SaaS businesses to transition from traditional seat-based pricing to usage-based models tailored for AI agents.

**Funding**: Paid.ai raised $21 million in a seed round led by Lightspeed, FUSE, and EQT, with participation from Sequoia Capital and strategic angel investors.

**Vision**: The company aims to help SaaS companies "break free from the seat-based trap," anticipating that up to 50% of the workforce will consist of AI agents by 2030. This shift requires new approaches to pricing and billing.

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

## Building an A/B Testing Solution with Paid.ai

*Like a market vendor testing different price points with different customers, A/B testing reveals what pricing strategy truly resonates.*

**Does Paid.ai support A/B testing?**

Paid.ai does not currently offer built-in A/B testing functionality. The platform focuses on billing infrastructure, usage tracking, and monetization rather than experimentation features. However, you can build a custom A/B testing solution that integrates with Paid.ai's APIs to test different pricing strategies.

To enable A/B testing for pricing experiments, you can build a custom system that integrates with Paid.ai's existing APIs. This is a separate service in your application that leverages Paid.ai's billing infrastructure through their REST APIs:

*Think of this as setting up your own marketplace stall—you control the prices offered, while Paid.ai handles the transaction infrastructure.*

### Prerequisites and Architecture Approach

**Prerequisites:**
- Paid.ai account with API access
- Understanding of Paid.ai's Signals API for tracking events
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
  
  // Validate required fields
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
5. User subscribes via Paid.ai
   ↓
6. Paid.ai webhook fires → Your endpoint
   ↓
7. Record conversion with variant
   ↓
8. Analyze results to find your "last price"
```

*Like a vendor who gradually learns the optimal price through many transactions, you iterate toward the best pricing strategy.*

### Analyzing Results

*After many market days, a vendor knows which prices work best. Similarly, analyze your data to find the winning strategy.*

Compare key metrics across variants:
- **Conversion Rate**: Percentage of users who subscribe
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**
- **Churn Rate**: Users who "walk away" from each price point
- **Statistical Significance**: Ensure results are reliable, not just chance

The variant that maximizes your target metric (usually revenue or conversions while maintaining acceptable churn) becomes your "last price"—your optimal pricing strategy.

### Resources for Integration

- [Paid.ai API Documentation](https://docs.paid.ai)
- [Signals API Reference](https://docs.paid.ai/api-reference/signals)
- [Webhooks Guide](https://docs.paid.ai/webhooks)
- [Authentication](https://docs.paid.ai/authentication)

## Conclusion: Traditional Wisdom Meets Modern Analytics

The Nigerian marketplace teaches us that finding the right price is never a guess—it's discovered through patient negotiation, keen observation, and willingness to adapt. Modern A/B testing embodies this same wisdom at scale. Where a vendor adjusts prices based on customer reactions throughout the day, businesses now adjust pricing strategies based on thousands of data points collected through systematic experimentation.

Paid.ai provides the infrastructure to conduct these pricing experiments with the rigor they deserve—tracking every signal, processing every transaction, and providing the data needed to discover your "last price." Whether you're a market vendor or a SaaS founder, the principle remains: the best price isn't guessed, it's discovered through continuous learning and adaptation.

*"Wetin be your last price?"—the question that drives discovery, whether asked in a Lagos market or through an A/B test dashboard.*
