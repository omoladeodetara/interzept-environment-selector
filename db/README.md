# Database Schema

This directory contains the PostgreSQL database schema for the Last Price multi-tenant pricing optimization system.

## Overview

The schema supports a multi-tenant architecture with the following key features:

- **Tenant Isolation**: All experiments and data are scoped to tenants
- **BYOK Support**: Tenants can bring their own Paid.ai API keys (BYOK mode) or use the platform's managed service
- **A/B Testing**: Complete tracking of experiments, variant assignments, views, and conversions
- **Usage Tracking**: Monitor API usage and signals per tenant for billing
- **Recommendations**: Store AI-generated pricing recommendations from jale

## Tables

### Core Tables

- **tenants**: Tenant accounts with mode (managed/BYOK), plan tier, and Paid.ai configuration
- **experiments**: A/B testing experiments with variants and status
- **assignments**: User-to-variant assignments for consistent experiment experience
- **views**: Pricing page impressions (views) per variant
- **conversions**: Subscription/purchase conversions with revenue tracking

### Supporting Tables

- **usage**: Daily aggregated usage metrics for billing and rate limiting
- **recommendations**: AI-generated pricing recommendations from jale

### Materialized View

- **experiment_metrics**: Pre-calculated metrics (views, conversions, revenue) per experiment for fast analytics

## Setup

### Prerequisites

- PostgreSQL 12 or higher
- `pgcrypto` extension for UUID generation

### Installation

1. Create a new database:

```bash
createdb lastprice
```

2. Apply the schema:

```bash
psql -d lastprice -f schema.sql
```

### Environment Variables

Configure your application with the following database connection settings:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/lastprice
# or individual components:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lastprice
DB_USER=app_user
DB_PASSWORD=secure_password
```

## Schema Diagram

```
┌──────────────┐
│   tenants    │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼────────┐
│ experiments   │
└──────┬────────┘
       │
       ├────────┐
       │ 1:N    │ 1:N
       │        │
┌──────▼──────┐ └──────▼─────────┐
│ assignments │   │     views      │
└─────────────┘   └────────────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│  conversions    │
└─────────────────┘
```

## Indexes

The schema includes optimized indexes for:

- Fast tenant lookups
- Experiment filtering by status
- User assignment queries
- Time-series analytics (views/conversions over time)
- Variant performance analysis

## Security Considerations

### API Key Encryption

**IMPORTANT**: In production, the `paid_api_key` field in the `tenants` table MUST be encrypted at rest. The schema stores these as TEXT but you should:

1. Use PostgreSQL encryption functions (pgcrypto)
2. Encrypt keys before storage using application-level encryption
3. Store encryption keys in a secure key management service (AWS KMS, Azure Key Vault, etc.)

Example encryption approach:

```sql
-- Encrypt before insert
INSERT INTO tenants (name, email, mode, paid_api_key)
VALUES ('Company', 'email@example.com', 'byok', 
        pgp_sym_encrypt('actual_api_key', 'encryption_passphrase'));

-- Decrypt on read
SELECT 
  id, 
  name, 
  pgp_sym_decrypt(paid_api_key::bytea, 'encryption_passphrase') as api_key
FROM tenants;
```

### Webhook Secrets

The `webhook_secret` field should also be encrypted and used for HMAC signature verification of incoming webhooks.

### Row-Level Security

For enhanced multi-tenant isolation, consider enabling PostgreSQL Row-Level Security (RLS):

```sql
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON experiments
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

## Migrations

For schema changes, use a migration tool like:

- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [db-migrate](https://github.com/db-migrate/node-db-migrate)
- [Flyway](https://flywaydb.org/)

Create migration files in `db/migrations/` directory:

```
db/
├── schema.sql           # Initial schema
├── migrations/
│   ├── 001_initial.sql
│   ├── 002_add_recommendations.sql
│   └── 003_add_usage_indexes.sql
└── README.md
```

## Maintenance

### Refresh Materialized View

The `experiment_metrics` materialized view should be refreshed periodically (e.g., every 5 minutes):

```sql
SELECT refresh_experiment_metrics();
```

Set up a cron job or scheduled task:

```bash
# Refresh every 5 minutes
*/5 * * * * psql -d lastprice -c "SELECT refresh_experiment_metrics();"
```

### Cleanup Old Data

Periodically archive or delete old experiment data:

```sql
-- Archive completed experiments older than 90 days
DELETE FROM experiments 
WHERE status = 'completed' 
  AND end_date < now() - INTERVAL '90 days';
```

### Backup Strategy

Regular backups are critical. Use `pg_dump` for backup:

```bash
# Full backup
pg_dump -d lastprice -F c -f lastprice_backup_$(date +%Y%m%d).dump

# Schema only
pg_dump -d lastprice --schema-only -f lastprice_schema.sql

# Data only
pg_dump -d lastprice --data-only -f lastprice_data.sql
```

## Performance Tuning

### Analyze Tables

Keep statistics up to date:

```sql
ANALYZE tenants;
ANALYZE experiments;
ANALYZE assignments;
ANALYZE views;
ANALYZE conversions;
```

### Monitor Query Performance

Use `EXPLAIN ANALYZE` to identify slow queries:

```sql
EXPLAIN ANALYZE
SELECT * FROM experiments 
WHERE tenant_id = 'uuid' AND status = 'active';
```

### Connection Pooling

Use a connection pooler like [PgBouncer](https://www.pgbouncer.org/) for production deployments to manage database connections efficiently.

## Testing

### Sample Data

The schema includes seed data for development:

- Demo tenant (managed mode): `demo@example.com`
- BYOK tenant: `byok@example.com`

### Test Queries

Verify the schema:

```sql
-- Count tenants by mode
SELECT mode, COUNT(*) FROM tenants GROUP BY mode;

-- Active experiments per tenant
SELECT t.name, COUNT(e.id) as active_experiments
FROM tenants t
LEFT JOIN experiments e ON t.id = e.tenant_id AND e.status = 'active'
GROUP BY t.name;

-- Conversion rates by variant
SELECT 
  e.name as experiment,
  c.variant,
  COUNT(DISTINCT v.user_id) as views,
  COUNT(DISTINCT c.user_id) as conversions,
  CAST(COUNT(DISTINCT c.user_id) AS DECIMAL) / NULLIF(COUNT(DISTINCT v.user_id), 0) as conversion_rate
FROM experiments e
JOIN views v ON e.id = v.experiment_id
LEFT JOIN conversions c ON e.id = c.experiment_id AND v.user_id = c.user_id
GROUP BY e.name, c.variant;
```

## License

This schema is part of the Last Price project and is licensed under the MIT License.
