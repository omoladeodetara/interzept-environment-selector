# API Reference

Complete API documentation for the Pricing Optimizer.

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require authentication using a Bearer token:

```http
Authorization: Bearer <token>
```

### Get a Token

First, create a tenant and receive a token:

```http
POST /api/tenants
Content-Type: application/json

{
  "name": "My Company",
  "plan": "starter",
  "mode": "managed"
}
```

Response:
```json
{
  "tenant": {
    "id": "abc-123",
    "name": "My Company",
    "plan": "starter",
    "mode": "managed",
    "usageLimit": 10000,
    "currentUsage": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Tenant created successfully"
}
```

---

## Public Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "mode": "hybrid"
}
```

### Create Tenant

```http
POST /api/tenants
Content-Type: application/json

{
  "name": "Company Name",
  "plan": "free" | "starter" | "pro" | "enterprise",
  "mode": "managed" | "byok",
  "provider": "paid-ai" | "stripe" | "manual"
}
```

### Generate Token (Existing Tenant)

```http
POST /api/auth/token
Content-Type: application/json

{
  "tenantId": "abc-123"
}
```

---

## Experiments API

### Create Experiment

```http
POST /api/experiments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pricing Test Q1",
  "description": "Test new pricing structure",
  "variants": [
    { "name": "control", "price": 29.99, "weight": 50 },
    { "name": "premium", "price": 39.99, "weight": 50 }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "exp-abc-123",
  "tenantId": "tenant-xyz",
  "name": "Pricing Test Q1",
  "description": "Test new pricing structure",
  "status": "draft",
  "variants": [
    { "id": "var-1", "name": "control", "price": 29.99, "weight": 50 },
    { "id": "var-2", "name": "premium", "price": 39.99, "weight": 50 }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### List Experiments

```http
GET /api/experiments?status=active&limit=10&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: draft, active, paused, completed |
| limit | number | Results per page (default: 10) |
| offset | number | Pagination offset (default: 0) |

### Get Experiment

```http
GET /api/experiments/:id
Authorization: Bearer <token>
```

### Update Experiment

```http
PATCH /api/experiments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description"
}
```

### Delete Experiment

```http
DELETE /api/experiments/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete active experiments.

### Add Variant

```http
POST /api/experiments/:id/variants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "discount",
  "price": 24.99,
  "weight": 20
}
```

### Activate Experiment

```http
POST /api/experiments/:id/activate
Authorization: Bearer <token>
```

### Stop Experiment

```http
POST /api/experiments/:id/stop
Authorization: Bearer <token>
```

### Get Results

```http
GET /api/experiments/:id/results
Authorization: Bearer <token>
```

**Response:**
```json
{
  "experimentId": "exp-abc-123",
  "variants": {
    "var-1": {
      "variantId": "var-1",
      "variantName": "control",
      "price": 29.99,
      "views": 1000,
      "conversions": 100,
      "revenue": 2999.00,
      "conversionRate": 0.10,
      "averageOrderValue": 29.99,
      "revenuePerView": 2.999
    },
    "var-2": {
      "variantId": "var-2",
      "variantName": "premium",
      "price": 39.99,
      "views": 1000,
      "conversions": 80,
      "revenue": 3199.20,
      "conversionRate": 0.08,
      "averageOrderValue": 39.99,
      "revenuePerView": 3.199
    }
  },
  "summary": {
    "totalViews": 2000,
    "totalConversions": 180,
    "totalRevenue": 6198.20,
    "winningVariant": "var-2",
    "statisticalSignificance": 0.87
  }
}
```

---

## Recommendations API

### Analyze Pricing

```http
POST /api/recommendations/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "experimentId": "exp-abc-123",
  "businessGoals": {
    "objective": "revenue",
    "minPrice": 20.00,
    "maxPrice": 50.00
  }
}
```

**Alternative (without experiment):**
```json
{
  "currentPrice": 29.99,
  "proposedPrice": 34.99,
  "estimatedElasticity": -1.5
}
```

**Response:**
```json
{
  "currentPrice": 29.99,
  "recommendedPrice": 34.99,
  "confidence": 75,
  "reasoning": [
    "Demand is inelastic (E=-0.60), meaning customers are less price-sensitive.",
    "Based on your 'revenue' objective, the $39.99 price point performed best.",
    "We recommend $34.99 based on elasticity analysis."
  ],
  "expectedImpact": {
    "revenueChange": 8.5,
    "conversionChange": -3.2,
    "elasticity": -0.60
  },
  "nextSteps": [
    "Update pricing to $34.99 and monitor conversion rates.",
    "Set up alerts for significant changes in conversion rate."
  ]
}
```

### Get Recommendation by Experiment

```http
GET /api/recommendations/:experimentId?objective=revenue&minPrice=20&maxPrice=50
Authorization: Bearer <token>
```

### Simulate Price Change

```http
POST /api/recommendations/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPrice": 29.99,
  "newPrice": 39.99,
  "currentConversions": 100,
  "currentViews": 1000,
  "estimatedElasticity": -1.5
}
```

---

## Analytics API

### Dashboard Overview

```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "activeExperiments": 3,
  "completedExperiments": 12,
  "totalRevenue": 45678.90,
  "avgConversionRate": 8.5,
  "revenueImpact": 12.3,
  "topPerformingExperiment": {
    "id": "exp-abc",
    "name": "Premium Pricing Test",
    "revenueImpact": 5678.90
  },
  "recentExperiments": [...]
}
```

### Experiment Analytics

```http
GET /api/analytics/experiments/:id
Authorization: Bearer <token>
```

### Elasticity Analysis

```http
GET /api/analytics/elasticity?experimentId=exp-abc-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "elasticity": -0.85,
  "interpretation": "inelastic",
  "confidenceInterval": {
    "lower": -0.95,
    "upper": -0.75
  },
  "sampleSize": 2000
}
```

### Compare Experiments

```http
POST /api/analytics/compare
Authorization: Bearer <token>
Content-Type: application/json

{
  "experimentIds": ["exp-1", "exp-2", "exp-3"]
}
```

---

## Settings API

### Get Integration Settings

```http
GET /api/settings/integration
Authorization: Bearer <token>
```

**Response:**
```json
{
  "mode": "managed",
  "provider": "paid-ai",
  "webhookUrl": null,
  "apiKey": "sk_t****abcd",
  "baseUrl": "https://api.paid.ai/v1",
  "effectiveMode": "managed"
}
```

### Update Integration Settings

```http
PUT /api/settings/integration
Authorization: Bearer <token>
Content-Type: application/json

{
  "mode": "byok",
  "apiKey": "sk_customer_api_key",
  "baseUrl": "https://api.paid.ai/v1",
  "provider": "paid-ai",
  "webhookUrl": "https://myapp.com/webhook"
}
```

### Validate API Key

```http
POST /api/settings/validate-key
Authorization: Bearer <token>
Content-Type: application/json

{
  "apiKey": "sk_test_key",
  "baseUrl": "https://api.paid.ai/v1"
}
```

### Get Usage

```http
GET /api/settings/usage?days=30
Authorization: Bearer <token>
```

### Get Billing

```http
GET /api/settings/billing
Authorization: Bearer <token>
```

### Estimate Costs

```http
POST /api/settings/billing/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectedUsage": 50000,
  "plan": "pro"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success with no body) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

Rate limits are enforced per tenant based on plan:

| Plan | Requests per Minute |
|------|---------------------|
| Free | 60 |
| Starter | 300 |
| Pro | 1000 |
| Enterprise | 5000 |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 297
X-RateLimit-Reset: 1705315800
```

When exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "error": "Rate limit exceeded. Try again in 45 seconds."
}
```
