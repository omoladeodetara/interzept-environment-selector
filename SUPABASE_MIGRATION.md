# Supabase Migration Guide

## Migration Status

✅ **Completed:**
- Schema migrated to Supabase migrations
- Supabase client library installed (`@supabase/supabase-js`)
- New Supabase client service created (`packages/services/supabase.ts`)
- Environment variables updated in `.env.example`
- Tenant operations partially migrated to Supabase client

⚠️ **In Progress:**
- Complete migration of all database operations in `packages/services/database.ts`
- Update `packages/elo/database.ts` to use Supabase

## What Changed

### 1. Database Schema
- **Old**: `db/schema.sql` and `migrations/schema.sql`
- **New**: `supabase/migrations/20241206000000_initial_schema.sql`
- Schema is now automatically applied when starting Supabase

### 2. Database Connection
- **Old**: PostgreSQL connection with `pg` library using connection pools
- **New**: Supabase client with REST API (PostgREST)

### 3. Environment Variables
```bash
# Old (deprecated)
DATABASE_URL=postgres://user:password@localhost:5432/lastprice
DB_HOST=localhost
DB_PORT=5432
# ... etc

# New
SUPABASE_URL=http://127.0.0.1:55321
SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### 4. Database Operations

**Old Pattern:**
```typescript
import { Pool } from 'pg';
const pool = new Pool(config);
const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
```

**New Pattern:**
```typescript
import { supabaseAdmin } from './supabase';
const { data, error } = await supabaseAdmin
  .from('tenants')
  .select('*')
  .eq('id', id)
  .single();
```

## Migration Steps Completed

### ✅ Step 1: Migrate Schema
```bash
cp db/schema.sql supabase/migrations/20241206000000_initial_schema.sql
pnpm dlx supabase start
```

### ✅ Step 2: Install Supabase Client
```bash
pnpm add @supabase/supabase-js -w
```

### ✅ Step 3: Create Supabase Client Service
Created `packages/services/supabase.ts` with:
- Public client for RLS-protected operations
- Admin client for server-side operations (bypasses RLS)
- Helper function for direct PostgreSQL connections

### ✅ Step 4: Update Environment Configuration
Updated `.env.example` with Supabase configuration

## Next Steps

### 1. Complete Database Service Migration

The file `packages/services/database.ts` needs all functions updated to use Supabase:

**Migrated Functions:**
- ✅ `createTenant`
- ✅ `getTenant`
- ✅ `getTenantByEmail`

**Needs Migration:**
- ⏳ `listTenants`
- ⏳ `updateTenant`
- ⏳ `deleteTenant`
- ⏳ All experiment operations
- ⏳ All assignment operations
- ⏳ All view/conversion tracking
- ⏳ All usage tracking

### 2. Update ELO Module

The file `packages/elo/database.ts` is a duplicate that also needs migration.

### 3. Remove Old PostgreSQL Files

After confirming everything works:
```bash
# Remove old schema files (keep for reference initially)
# rm db/schema.sql
# rm migrations/schema.sql

# Remove pg dependency
# pnpm remove pg -w
```

### 4. Update Tests

Update test files to use Supabase test database or mock the Supabase client.

## Benefits of Supabase

1. **Built-in REST API**: No need to write SQL queries manually
2. **Real-time Subscriptions**: Subscribe to database changes
3. **Row Level Security**: Fine-grained access control
4. **Auto-generated Types**: Type-safe database operations
5. **Studio UI**: Visual database management
6. **Edge Functions**: Deploy serverless functions with Deno
7. **Authentication**: Built-in auth system
8. **Storage**: File storage with CDN

## Local Development

```bash
# Start Supabase
pnpm dlx supabase start

# Access Studio
open http://127.0.0.1:55323

# Check status
pnpm dlx supabase status

# Reset database (applies migrations)
pnpm dlx supabase db reset

# Stop Supabase
pnpm dlx supabase stop
```

## Production Deployment

1. Create a Supabase project at https://supabase.com
2. Update environment variables with production values
3. Push migrations: `pnpm dlx supabase db push`
4. Deploy your application with new environment variables

## Rollback Plan

If you need to rollback to PostgreSQL:
1. The old schema files are preserved in `db/` and `migrations/`
2. Restore old environment variables
3. The `pg` library is still available as a dependency
4. Old database service code can be restored from git history

## Questions?

- Check Supabase docs: https://supabase.com/docs
- Local Studio: http://127.0.0.1:55323
- Database URL: `postgresql://postgres:postgres@127.0.0.1:55322/postgres`
