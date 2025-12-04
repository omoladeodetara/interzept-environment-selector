# Setup Guide: Last Price Multi-Tenant System

This guide will walk you through setting up the complete multi-tenant pricing optimization system with database, API server, and client snippet.

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- Git

> **Important**: This repository uses Git submodules. When cloning, use `git clone --recurse-submodules` or run `git submodule update --init` after cloning to initialize the `/shadcn-ui` submodule which contains reference UI components.

## Architecture Overview

The system consists of:

1. **PostgreSQL Database**: Multi-tenant data storage
2. **ab-testing-server (elo)**: Tenant management, A/B testing, and experiment tracking
3. **jale**: Pricing optimization and recommendation engine
4. **Client Snippet**: JavaScript embed for websites

## Step 1: Database Setup

### Install PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Download and install from https://www.postgresql.org/download/windows/

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lastprice;

# Create user (optional, for security)
CREATE USER lastprice_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lastprice TO lastprice_user;

# Exit
\q
```

### Apply Schema

```bash
# From the repository root
cd db
psql -U postgres -d lastprice -f schema.sql
```

Verify the schema:

```bash
psql -U postgres -d lastprice -c "\dt"
```

You should see tables: `tenants`, `experiments`, `assignments`, `views`, `conversions`, `usage`, `recommendations`.

## Step 2: Configure Environment Variables

### ab-testing-server

```bash
cd ab-testing-server
cp .env.example .env
```

Edit `.env`:

```bash
# Paid.ai API Configuration
PAID_API_KEY=your_paid_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lastprice
DB_USER=postgres
DB_PASSWORD=your_password_here

# Or use DATABASE_URL (preferred for production)
# DATABASE_URL=postgres://user:password@localhost:5432/lastprice
```

## Step 3: Install Dependencies

### ab-testing-server

```bash
cd ab-testing-server
npm install
```

### jale

```bash
cd ../jale
npm install
```

## Step 4: Start the Server

```bash
cd ab-testing-server
npm start
```

You should see:

```
==================================================
🚀 A/B Testing Server Started
==================================================
Environment: development
Server running at: http://localhost:3000
Health check: http://localhost:3000/health
API Documentation: http://localhost:3000/api-docs
==================================================
```

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

## Step 5: Create Your First Tenant

### Using curl

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "admin@mycompany.com",
    "mode": "managed",
    "plan": "free"
  }'
```

### Using the API Documentation UI

1. Open http://localhost:3000/api-docs
2. Navigate to the `Tenants` section
3. Try out `POST /api/tenants`
4. Fill in the request body and execute

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Company",
  "email": "admin@mycompany.com",
  "mode": "managed",
  "plan": "free",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

Save the `id` - this is your `tenantId`.

## Step 6: Create an Experiment

```bash
curl -X POST http://localhost:3000/api/tenants/YOUR_TENANT_ID/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "key": "pricing_test_001",
    "name": "Premium Plan Pricing Test",
    "description": "Testing $29.99 vs $39.99 for premium plan",
    "variants": [
      { "name": "control", "price": 29.99, "weight": 50 },
      { "name": "experiment", "price": 39.99, "weight": 50 }
    ]
  }'
```

Response:

```json
{
  "id": "exp_abc123",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "key": "pricing_test_001",
  "name": "Premium Plan Pricing Test",
  "status": "draft",
  "variants": [
    { "name": "control", "price": 29.99, "weight": 50 },
    { "name": "experiment", "price": 39.99, "weight": 50 }
  ],
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

### Activate the Experiment

Update the experiment status to "active":

```bash
curl -X PATCH http://localhost:3000/api/tenants/YOUR_TENANT_ID/experiments/exp_abc123 \
  -H "Content-Type: application/json" \
  -d '{ "status": "active" }'
```

## Step 7: Test the Pricing API

Get pricing for a user:

```bash
curl "http://localhost:3000/api/experiments/pricing_test_001/pricing?userId=user_123&tenantId=YOUR_TENANT_ID"
```

Response:

```json
{
  "userId": "user_123",
  "experimentId": "pricing_test_001",
  "variant": "control",
  "pricing": {
    "plan": "Control",
    "price": 29.99,
    "features": ["Feature A", "Feature B", "Feature C"]
  }
}
```

## Step 8: Install the Client Snippet

### On Your Website

Add this to your HTML:

```html
<div id="pricing-container"></div>

<script src="path/to/snippet/lastprice.js"></script>
<script>
  LastPrice.configure({
    apiBase: 'http://localhost:3000',
    tenantId: 'YOUR_TENANT_ID',
    experimentId: 'pricing_test_001'
  });
  
  LastPrice.showPricing('#pricing-container');
</script>
```

### Record a Conversion

When a user subscribes:

```javascript
LastPrice.convert({
  revenue: 29.99,
  onSuccess: (response) => {
    console.log('Conversion recorded!', response);
  }
});
```

## Step 9: View Experiment Results

```bash
curl "http://localhost:3000/api/experiments/pricing_test_001/results?tenantId=YOUR_TENANT_ID"
```

Response:

```json
{
  "experimentId": "pricing_test_001",
  "control": {
    "views": 50,
    "conversions": 12,
    "revenue": "359.88",
    "conversionRate": "24.00%",
    "arpu": "29.99"
  },
  "experiment": {
    "views": 50,
    "conversions": 10,
    "revenue": "399.90",
    "conversionRate": "20.00%",
    "arpu": "39.99"
  }
}
```

## Step 10: Get Pricing Recommendations (jale)

```bash
curl -X POST http://localhost:3000/api/jale/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "experimentId": "pricing_test_001",
    "objective": "revenue",
    "lookbackDays": 30
  }'
```

Response:

```json
{
  "recommendedPrice": 35.99,
  "expectedRevenue": 1799.50,
  "confidence": 0.75,
  "simulation": [
    { "price": 29.99, "estimatedCv": 0.24, "expectedRevenue": 7197.60 },
    { "price": 35.99, "estimatedCv": 0.22, "expectedRevenue": 7917.80 },
    { "price": 39.99, "estimatedCv": 0.20, "expectedRevenue": 7998.00 }
  ]
}
```

## BYOK Mode Setup

For tenants who want to use their own Paid.ai API key:

### Create BYOK Tenant

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BYOK Company",
    "email": "admin@byokcompany.com",
    "mode": "byok",
    "paidApiKey": "sk_live_abc123...",
    "plan": "pro"
  }'
```

The system will automatically use the tenant's API key for all Paid.ai signal emissions.

## Production Deployment

### Environment Variables

```bash
NODE_ENV=production
DATABASE_URL=postgres://user:password@production-db:5432/lastprice
PAID_API_KEY=sk_live_...
ENABLE_WEBHOOK_VERIFICATION=true
WEBHOOK_SECRET=your_webhook_secret
```

### Security Checklist

- [ ] Enable webhook signature verification
- [ ] Encrypt API keys at rest (implement in `database.js`)
- [ ] Use HTTPS for all connections
- [ ] Set up rate limiting
- [ ] Configure proper CORS headers
- [ ] Use environment-specific credentials
- [ ] Enable database connection pooling
- [ ] Set up monitoring and alerting
- [ ] Configure backups for PostgreSQL
- [ ] Use a reverse proxy (Nginx/Caddy)

### Database Migrations

For production schema changes, use a migration tool:

```bash
npm install -g db-migrate
db-migrate create add_new_field
```

### Monitoring

Add health checks and monitoring:

- Database connection health
- API response times
- Error rates
- Signal emission success rates
- Experiment result quality

## Troubleshooting

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running:

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Tenant Already Exists

```
Error 409: Tenant with this email already exists
```

**Solution**: Use a different email or retrieve the existing tenant:

```bash
curl http://localhost:3000/api/tenants
```

### Experiment Not Found

```
Error 404: Experiment not found
```

**Solution**: Verify the experimentId and tenantId:

```bash
curl http://localhost:3000/api/tenants/YOUR_TENANT_ID/experiments
```

### Signal Emission Failures

Check the Paid.ai API key is valid:

```bash
curl https://api.paid.ai/health \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Next Steps

1. **Explore the API Documentation**: http://localhost:3000/api-docs
2. **Read the Database Schema**: `/db/README.md`
3. **Customize the Client Snippet**: `/snippet/README.md`
4. **Set up the UI Demo**: `/ui/README.md`
5. **Configure jale Optimization**: `/jale/README.md`

## Support

- GitHub Issues: https://github.com/your-org/last-price/issues
- Documentation: https://docs.lastprice.example.com
- Email: support@lastprice.example.com

## License

MIT License - see LICENSE file for details
