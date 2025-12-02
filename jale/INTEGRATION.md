# Jale Integration Guide

This document describes how the jale pricing calculator integrates with the ab-testing-server (elo).

## Overview

Jale is the pricing calculator/agent layer that:
- Fetches experiment variants and historical data from elo
- Computes elasticity curves and revenue simulations
- Recommends optimal pricing
- Proposes new variants back to elo

## Integration Endpoints

### 1. Get Experiment Definition

Fetches experiment configuration including all variants with prices and weights.

```bash
GET /api/experiments/:experimentId/definition?tenantId=<uuid>
```

**Response:**
```json
{
  "experimentId": "pricing_test_001",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Pricing Experiment 1",
  "status": "active",
  "variants": [
    { "name": "control", "price": 29.99, "weight": 0.5 },
    { "name": "experiment", "price": 39.99, "weight": 0.5 }
  ],
  "targetSampleSize": 1000
}
```

### 2. Get Experiment Results

Fetches historical conversion and revenue data.

```bash
GET /api/experiments/:experimentId/results
```

**Response:**
```json
{
  "experimentId": "pricing_test_001",
  "control": {
    "views": 1000,
    "conversions": 120,
    "revenue": "3598.80",
    "conversionRate": "12.00%",
    "arpu": "29.99"
  },
  "experiment": {
    "views": 1000,
    "conversions": 100,
    "revenue": "3999.00",
    "conversionRate": "10.00%",
    "arpu": "39.99"
  }
}
```

### 3. Optimize Pricing

Runs elasticity and revenue simulation to recommend optimal price.

```bash
POST /api/jale/optimize
Content-Type: application/json

{
  "experimentId": "pricing_test_001",
  "objective": "revenue",
  "candidates": [19.99, 29.99, 39.99, 49.99],
  "lookbackDays": 30
}
```

**Response:**
```json
{
  "recommendedPrice": 35.99,
  "expectedRevenue": 1799.50,
  "confidence": 0.5,
  "simulation": [
    { "price": 29.99, "estimatedCv": 0.12, "expectedRevenue": 3598.80 },
    { "price": 35.99, "estimatedCv": 0.10, "expectedRevenue": 3599.00 },
    { "price": 39.99, "estimatedCv": 0.08, "expectedRevenue": 3199.20 }
  ]
}
```

### 4. Propose New Variant

Proposes a new variant to be added to an experiment.

```bash
POST /api/jale/propose-variant
Content-Type: application/json

{
  "experimentId": "pricing_test_001",
  "tenantId": "123e4567-e89b-12d3-a456-426614174001",
  "price": 34.99,
  "label": "optimized",
  "metadata": {
    "source": "jale",
    "confidence": 0.85
  }
}
```

**Response:**
```json
{
  "success": true,
  "experimentId": "pricing_test_001",
  "variant": {
    "name": "optimized",
    "price": 34.99,
    "weight": 0.0,
    "metadata": { "source": "jale", "confidence": 0.85 }
  },
  "message": "Variant 'optimized' proposed successfully"
}
```

## Integration Flow

```
1. Business creates experiment via oja UI
   ↓
2. Jale fetches variants: GET /api/experiments/:id/definition
   ↓
3. Jale fetches historical data: GET /api/experiments/:id/results
   ↓
4. Jale runs optimization: POST /api/jale/optimize
   ↓
5. Jale proposes new variant: POST /api/jale/propose-variant
   ↓
6. Business reviews and activates variant in oja UI
```

## Tenant Modes

### BYOK (Bring Your Own Key)
- Tenant provides their own Paid.ai API key
- Use `tenantId` query parameter for lookups
- Signals are emitted using tenant's API key

### Managed
- Platform manages Paid.ai integration
- Use experiment UUID directly
- Signals are emitted using platform key

## Example: Using Jale from Node.js

```javascript
const jale = require('./jale');

// Get recommendation
const result = await jale.recommendPrice({
  experimentId: 'pricing_test_001',
  objective: 'revenue',
  lookbackDays: 30
});

console.log(`Recommended price: $${result.recommendedPrice}`);
console.log(`Expected revenue: $${result.expectedRevenue}`);
console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);

// Propose the recommended price as a new variant
const response = await fetch('http://localhost:3000/api/jale/propose-variant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentId: 'pricing_test_001',
    price: result.recommendedPrice,
    label: 'jale_optimized',
    metadata: {
      source: 'jale',
      confidence: result.confidence
    }
  })
});

const variant = await response.json();
console.log(`Created variant: ${variant.variant.name}`);
```

## Testing

Run the test suite to verify integration:

```bash
cd ab-testing-server
npm test
```

All 21 tests should pass, including:
- 6 tests for jale/optimize endpoint
- 4 tests for experiment definition endpoint
- 11 tests for propose-variant endpoint

## OpenAPI Documentation

Full API documentation is available via Swagger UI:

```bash
npm start
# Open http://localhost:3000/api-docs
```

The OpenAPI specification includes complete request/response schemas for all jale integration endpoints.
