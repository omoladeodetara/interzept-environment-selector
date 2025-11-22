# Paid.ai A/B Testing Server

A production-ready server for implementing A/B testing on pricing experiments using Paid.ai's APIs and webhooks, with comprehensive OpenAPI 3.0 specification.

## Overview

This implementation provides the A/B testing solution described in the main [README.md](../README.md) of this repository. It's a complete, runnable server with:

- **Variant Assignment**: Deterministic assignment of users to control/experiment groups
- **Signal Emission**: Tracks user behavior using Paid.ai's Signals API
- **Webhook Handling**: Processes Paid.ai webhook events for conversions
- **Analytics**: Tracks and reports experiment results
- **OpenAPI Specification**: Full API documentation with Swagger UI

## Architecture

```
User Request
    ↓
GET /api/pricing
    ↓
Assign to Variant (A/B Testing Logic)
    ↓
Return Pricing + Emit Signal to Paid.ai
    ↓
User Converts
    ↓
POST /api/convert (or Paid.ai Webhook)
    ↓
Track Conversion + Emit Signal
    ↓
GET /api/experiments/:id/results
    ↓
View Analytics
```

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- Paid.ai account with API access
- A text editor or IDE

## Installation

1. **Clone or navigate to the ab-testing-server directory:**
   ```bash
   cd ab-testing-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Paid.ai API key:
   ```
   PAID_API_KEY=your_actual_paid_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

   **Note**: You can obtain your Paid.ai API key from the [Paid.ai dashboard](https://dashboard.paid.ai).

## Dependencies and Telemetry

This project uses `swagger-ui-express` for API documentation, which includes `@scarf/scarf` - a package download analytics service used by the swagger-ui-dist maintainers.

**What is Scarf.sh?**
- Analytics service that tracks package download statistics
- Helps open-source maintainers understand package adoption
- Collects basic telemetry about package usage

**To disable Scarf analytics**, add to your `.env` file:
```
SCARF_ANALYTICS=false
```

No other telemetry or analytics services are included in this server.

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000` (or the PORT specified in your `.env` file).

## API Documentation

This server includes a complete **OpenAPI 3.0 specification** with interactive Swagger UI documentation.

**Access the API documentation:**
- Open `http://localhost:3000/api-docs` in your browser
- View the `openapi.yaml` file for the complete specification
- Use the interactive UI to test API endpoints directly

The OpenAPI specification provides:
- Detailed endpoint descriptions
- Request/response schemas
- Example values
- Parameter validation rules
- Error response formats

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

**Example:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Get Pricing (with A/B Test Assignment)
**GET** `/api/pricing?userId=user_123&experimentId=pricing_test_001`

Assigns a user to a variant and returns pricing information.

**Query Parameters:**
- `userId` (optional): User identifier. If not provided, a temporary ID is generated.
- `experimentId` (optional): Experiment identifier. Defaults to `pricing_test_001`.

**Example:**
```bash
curl "http://localhost:3000/api/pricing?userId=user_123&experimentId=pricing_test_001"
```

**Response (Control Variant):**
```json
{
  "userId": "user_123",
  "experimentId": "pricing_test_001",
  "variant": "control",
  "pricing": {
    "plan": "Standard",
    "price": 29.99,
    "features": ["Feature A", "Feature B", "Feature C"]
  }
}
```

**Response (Experiment Variant):**
```json
{
  "userId": "user_123",
  "experimentId": "pricing_test_001",
  "variant": "experiment",
  "pricing": {
    "plan": "Premium",
    "price": 39.99,
    "features": ["Feature A", "Feature B", "Feature C", "Feature D"]
  }
}
```

---

### 3. Simulate Conversion
**POST** `/api/convert`

Simulates a user conversion (subscription/purchase).

**Request Body:**
```json
{
  "userId": "user_123",
  "experimentId": "pricing_test_001"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","experimentId":"pricing_test_001"}'
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "experimentId": "pricing_test_001",
  "variant": "control",
  "revenue": 29.99
}
```

---

### 4. Get Experiment Results
**GET** `/api/experiments/:experimentId/results`

Retrieves analytics and statistics for an experiment.

**Example:**
```bash
curl http://localhost:3000/api/experiments/pricing_test_001/results
```

**Response:**
```json
{
  "experimentId": "pricing_test_001",
  "control": {
    "views": 45,
    "conversions": 12,
    "revenue": "359.88",
    "conversionRate": "26.67%",
    "arpu": "29.99"
  },
  "experiment": {
    "views": 48,
    "conversions": 15,
    "revenue": "599.85",
    "conversionRate": "31.25%",
    "arpu": "39.99"
  },
  "summary": {
    "totalViews": 93,
    "totalConversions": 27,
    "totalRevenue": "959.73",
    "conversionRateDiff": "4.58%",
    "revenuePerUserDiff": "10.00"
  }
}
```

---

### 5. Paid.ai Webhook Endpoint
**POST** `/webhooks/paid`

Receives webhook events from Paid.ai about subscriptions, payments, etc.

**Example Webhook Payload:**
```json
{
  "type": "subscription.created",
  "data": {
    "customer_id": "user_123",
    "amount": 29.99,
    "metadata": {
      "experiment_id": "pricing_test_001"
    }
  }
}
```

**Testing with curl:**
```bash
curl -X POST http://localhost:3000/webhooks/paid \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription.created",
    "data": {
      "customer_id": "user_123",
      "amount": 29.99,
      "metadata": {
        "experiment_id": "pricing_test_001"
      }
    }
  }'
```

---

### 6. Debug Assignments (Development Only)
**GET** `/api/debug/assignments`

Returns all current experiment assignments. Only available in development mode.

**Example:**
```bash
curl http://localhost:3000/api/debug/assignments
```

**Response:**
```json
{
  "count": 2,
  "assignments": [
    {
      "userId": "user_123",
      "experimentId": "pricing_test_001",
      "variant": "control"
    },
    {
      "userId": "user_456",
      "experimentId": "pricing_test_001",
      "variant": "experiment"
    }
  ]
}
```

## Complete Testing Workflow

Here's a complete example of testing the A/B testing flow:

```bash
# 1. Check server health
curl http://localhost:3000/health

# 2. User 1 views pricing (gets assigned to a variant)
curl "http://localhost:3000/api/pricing?userId=alice&experimentId=pricing_test_001"

# 3. User 1 converts (subscribes)
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","experimentId":"pricing_test_001"}'

# 4. User 2 views pricing (gets assigned to a variant)
curl "http://localhost:3000/api/pricing?userId=bob&experimentId=pricing_test_001"

# 5. User 2 converts
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"userId":"bob","experimentId":"pricing_test_001"}'

# 6. Check experiment results
curl http://localhost:3000/api/experiments/pricing_test_001/results

# 7. (Optional) View all assignments in dev mode
curl http://localhost:3000/api/debug/assignments
```

## Project Structure

```
ab-testing-server/
├── server.js           # Express server with API endpoints
├── ab-testing.js       # A/B test variant assignment and tracking
├── signals.js          # Paid.ai Signals API integration
├── config.js           # Configuration management
├── openapi.yaml        # OpenAPI 3.0 specification
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .env                # Your local configuration (not committed)
└── README.md           # This file
```

## Key Implementation Details

### Variant Assignment
- Uses consistent hashing to ensure the same user always gets the same variant
- 50/50 split by default (configurable in `config.js`)
- Assignments stored in-memory (use a database in production)

### Signal Emission
- Non-blocking: Signal emission failures don't fail the request
- Tracks both pricing views and conversions
- Includes experiment metadata for analytics

### Webhook Handling
- Validates incoming payloads
- Links webhook events to experiment assignments
- Gracefully handles missing data

### Error Handling
- Input validation on all endpoints
- Comprehensive error messages in development mode
- Graceful error handling to prevent data loss

## Production Considerations

### 1. Webhook Signature Verification
In production, always verify webhook signatures to ensure they're from Paid.ai:

```javascript
// Example signature verification (implement based on Paid.ai docs)
function verifyWebhookSignature(headers, body, secret) {
  const signature = headers['x-paid-signature'];
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return signature === computedSignature;
}
```

Add this to the webhook handler:
```javascript
if (!verifyWebhookSignature(req.headers, req.body, config.webhookSecret)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 2. Persistent Storage
Replace in-memory storage with a database:

**Recommended Options:**
- **Redis**: Fast, perfect for session data and experiment assignments
- **PostgreSQL**: Relational data, complex queries, analytics
- **MongoDB**: Flexible schema, good for event tracking

### 3. Rate Limiting
Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Authentication
Implement proper user authentication:
- Use JWT tokens or session cookies
- Validate user identity before variant assignment
- Secure webhook endpoints

### 5. Logging and Monitoring
Implement proper logging:
- Use structured logging (e.g., Winston, Pino)
- Send logs to a centralized service (e.g., Datadog, CloudWatch)
- Monitor error rates and performance

### 6. Environment Variables
Store secrets securely:
- Never commit `.env` files to version control
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys regularly

## Troubleshooting

### "Missing required environment variables: PAID_API_KEY"
**Solution**: Copy `.env.example` to `.env` and add your Paid.ai API key.

### "Failed to emit signal: 401 Unauthorized"
**Solution**: Check that your `PAID_API_KEY` in `.env` is correct and has the necessary permissions.

### "No variant assignment found for this user"
**Solution**: The user must first visit `/api/pricing` to get assigned a variant before converting.

### Webhook not receiving events
**Solution**: 
1. Ensure your server is publicly accessible (use ngrok for local testing)
2. Configure the webhook URL in your Paid.ai dashboard
3. Check Paid.ai webhook logs for delivery failures

## Using ngrok for Local Webhook Testing

To test webhooks locally, use ngrok to expose your local server:

```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Start ngrok
ngrok http 3000

# Use the provided HTTPS URL in your Paid.ai webhook configuration
# Example: https://abc123.ngrok.io/webhooks/paid
```

## Resources

- [Main README](../README.md) - Conceptual overview and architecture
- [Paid.ai Documentation](https://docs.paid.ai)
- [Paid.ai Signals API](https://docs.paid.ai/api-reference/signals)
- [Paid.ai Webhooks Guide](https://docs.paid.ai/webhooks)

## License

MIT

## Support

For issues specific to this server, please open an issue in this repository.
For Paid.ai platform issues, contact [Paid.ai support](https://paid.ai/support).
