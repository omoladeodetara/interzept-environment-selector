# Elo - A/B Testing Module

Elo is the A/B testing engine for the Last Price platform. It handles variant assignment, experiment tracking, and results aggregation.

## Features

- **Deterministic Variant Assignment**: Consistent assignment of users to variants using cryptographic hashing
- **In-Memory Tracking**: Fast tracking of views, conversions, and revenue (production should use persistent storage)
- **Statistical Analysis**: Conversion rate and ARPU calculations

## Usage

```typescript
import * as elo from '@packages/elo';

// Assign a user to a variant
const variant = elo.assignVariant('user123', 'experiment_001');

// Track a conversion
elo.trackConversion('user123', 'experiment_001', {
  revenue: 39.99,
  timestamp: new Date()
});

// Get experiment results
const results = elo.getExperimentResults('experiment_001');
```

## API

### `assignVariant(userId, experimentId, weights?)`

Assigns a user to a variant ('control' or 'experiment') using deterministic hashing.

### `getExperimentVariant(userId, experimentId)`

Retrieves the variant assignment for a user.

### `trackConversion(userId, experimentId, conversionData)`

Tracks a conversion event with optional revenue.

### `getExperimentResults(experimentId)`

Returns aggregated results including views, conversions, revenue, conversion rates, and ARPU.

## Production Considerations

- Replace in-memory storage with Redis or PostgreSQL
- Implement proper statistical significance testing
- Add support for multi-variant experiments (A/B/n)
- Implement stratified sampling for better distribution
