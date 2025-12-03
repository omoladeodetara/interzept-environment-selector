# Jale - Pricing Engine Module

Jale is the pricing optimization and recommendation engine for the Last Price platform. It analyzes experiment results and recommends optimal pricing strategies.

## Features

- **Elasticity Computation**: Calculate price elasticity from A/B test data
- **Revenue Simulation**: Simulate expected revenue for candidate prices
- **Linear Interpolation**: Estimate conversion rates for untested price points
- **Multi-Objective Optimization**: Optimize for revenue, conversion rate, or profit

## Usage

```typescript
import * as jale from '@packages/jale';

// Get pricing recommendation
const recommendation = await jale.recommendPrice({
  experimentId: 'pricing_experiment_001',
  objective: 'revenue', // or 'conversion', 'profit'
  candidates: [29.99, 34.99, 39.99, 44.99], // optional
  lookbackDays: 30
});

console.log(`Recommended price: $${recommendation.recommendedPrice}`);
console.log(`Expected revenue: $${recommendation.expectedRevenue}`);
console.log(`Confidence: ${recommendation.confidence}`);
```

## API

### `recommendPrice(options)`

Analyzes experiment data and recommends optimal pricing.

**Options:**
- `experimentId` (required): Experiment to analyze
- `objective`: Optimization goal ('revenue', 'conversion', 'profit')
- `candidates`: Array of price points to evaluate
- `lookbackDays`: Historical data range

**Returns:**
```typescript
{
  recommendedPrice: number,
  expectedRevenue: number,
  confidence: number,
  simulation: Array<{
    price: number,
    estimatedCv: number,
    expectedRevenue: number
  }>
}
```

## Algorithm

1. **Data Collection**: Fetch experiment variants and results from Elo
2. **Observed Points**: Extract price-conversion rate pairs from actual data
3. **Candidate Generation**: Expand candidate set with ±10% variations
4. **Simulation**: Estimate conversion rates using linear interpolation
5. **Optimization**: Select best price based on objective function

## Production Considerations

- Implement advanced demand curve modeling (log-linear, polynomial)
- Add confidence intervals using bootstrap methods
- Incorporate external factors (seasonality, competition, market trends)
- Support for segmented pricing (by customer, region, etc.)
- Multi-armed bandit algorithms for continuous optimization
