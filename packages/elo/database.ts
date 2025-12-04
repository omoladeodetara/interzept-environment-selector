/**
 * Database module for Last Price multi-tenant system
 * 
 * This module provides database access using PostgreSQL with the pg library.
 * It handles tenant management, experiments, assignments, views, conversions, and usage tracking.
 * 
 * Configuration:
 * - Set DATABASE_URL environment variable OR individual DB_* variables
 * - Example: DATABASE_URL=postgres://user:password@localhost:5432/lastprice
 */

import { Pool, PoolConfig, QueryResult } from 'pg';

// ============================================================================
// Types
// ============================================================================

export interface Tenant {
  id: string;
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paid_api_key: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  metadata: Record<string, unknown>;
  webhook_secret: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTenantInput {
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paidApiKey?: string | null;
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
  metadata?: Record<string, unknown>;
}

export interface ExperimentVariant {
  name: string;
  price: number;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  target_sample_size: number | null;
  start_date: Date | null;
  end_date: Date | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExperimentInput {
  tenantId: string;
  key: string;
  name: string;
  description?: string | null;
  variants: ExperimentVariant[];
  targetSampleSize?: number | null;
}

export interface Assignment {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  created_at: Date;
}

export interface View {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface Conversion {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  revenue: number;
  metadata: Record<string, unknown>;
  paid_order_id: string | null;
  created_at: Date;
}

export interface ExperimentResults {
  experimentId: string;
  control: VariantMetrics | null;
  experiment?: VariantMetrics | null;
  [key: string]: unknown;
}

export interface VariantMetrics {
  views: number;
  conversions: number;
  revenue: string;
  conversionRate: string;
  arpu: string;
}

export interface Usage {
  id: string;
  tenant_id: string;
  metric: string;
  value: number;
  period: string;
  created_at: Date;
}

export interface ListTenantsOptions {
  mode?: 'managed' | 'byok';
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
  limit?: number;
  offset?: number;
}

export interface ListTenantsResult {
  tenants: Tenant[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ============================================================================
// Database Configuration
// ============================================================================

interface DbConfig {
  connectionString?: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const dbConfig: DbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'lastprice',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
};

// Create connection pool with consistent configuration
const poolConfig: PoolConfig = dbConfig.connectionString
  ? {
      connectionString: dbConfig.connectionString,
      max: dbConfig.max,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
    }
  : {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      max: dbConfig.max,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
    };

export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// ============================================================================
// TENANT OPERATIONS
// ============================================================================

/**
 * Create a new tenant
 */
export async function createTenant({ 
  name, 
  email, 
  mode, 
  paidApiKey = null, 
  plan = 'free', 
  metadata = {} 
}: CreateTenantInput): Promise<Tenant> {
  const query = `
    INSERT INTO tenants (name, email, mode, paid_api_key, plan, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [name, email, mode, paidApiKey, plan, metadata];
  
  try {
    const result: QueryResult<Tenant> = await pool.query(query, values);
    return result.rows[0];
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('Tenant with this email already exists');
    }
    throw error;
  }
}

/**
 * Get tenant by ID
 */
export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const query = 'SELECT * FROM tenants WHERE id = $1';
  const result: QueryResult<Tenant> = await pool.query(query, [tenantId]);
  return result.rows[0] || null;
}

/**
 * Get tenant by email
 */
export async function getTenantByEmail(email: string): Promise<Tenant | null> {
  const query = 'SELECT * FROM tenants WHERE email = $1';
  const result: QueryResult<Tenant> = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * List tenants with optional filters
 */
export async function listTenants(options: ListTenantsOptions = {}): Promise<ListTenantsResult> {
  const { mode, plan, limit = 20, offset = 0 } = options;
  
  let whereClause = 'WHERE 1=1';
  const whereValues: unknown[] = [];
  let paramCount = 0;
  
  if (mode) {
    whereValues.push(mode);
    whereClause += ` AND mode = $${++paramCount}`;
  }
  
  if (plan) {
    whereValues.push(plan);
    whereClause += ` AND plan = $${++paramCount}`;
  }
  
  let query = `SELECT * FROM tenants ${whereClause} ORDER BY created_at DESC`;
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  const queryValues = [...whereValues, limit, offset];
  
  const countQuery = `SELECT COUNT(*) FROM tenants ${whereClause}`;
  
  const [tenantsResult, countResult] = await Promise.all([
    pool.query<Tenant>(query, queryValues),
    pool.query<{ count: string }>(countQuery, whereValues)
  ]);
  
  return {
    tenants: tenantsResult.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count, 10),
      limit,
      offset
    }
  };
}

/**
 * Update tenant
 */
export async function updateTenant(
  tenantId: string, 
  updates: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>
): Promise<Tenant | null> {
  const allowedFields = ['name', 'mode', 'paid_api_key', 'plan', 'metadata', 'webhook_secret'];
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramCount = 0;
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClause.push(`${key} = $${++paramCount}`);
      values.push(value);
    }
  }
  
  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(tenantId);
  const query = `
    UPDATE tenants
    SET ${setClause.join(', ')}, updated_at = now()
    WHERE id = $${++paramCount}
    RETURNING *
  `;
  
  const result: QueryResult<Tenant> = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete tenant
 */
export async function deleteTenant(tenantId: string): Promise<boolean> {
  const query = 'DELETE FROM tenants WHERE id = $1';
  const result = await pool.query(query, [tenantId]);
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// EXPERIMENT OPERATIONS
// ============================================================================

/**
 * Create an experiment
 */
export async function createExperiment({ 
  tenantId, 
  key, 
  name, 
  description = null, 
  variants, 
  targetSampleSize = null 
}: CreateExperimentInput): Promise<Experiment> {
  const query = `
    INSERT INTO experiments (tenant_id, key, name, description, variants, target_sample_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [tenantId, key, name, description, JSON.stringify(variants), targetSampleSize];
  
  try {
    const result: QueryResult<Experiment> = await pool.query(query, values);
    return result.rows[0];
  } catch (error: unknown) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error('Experiment with this key already exists for this tenant');
    }
    throw error;
  }
}

/**
 * Get experiment by ID
 */
export async function getExperiment(experimentId: string): Promise<Experiment | null> {
  const query = 'SELECT * FROM experiments WHERE id = $1';
  const result: QueryResult<Experiment> = await pool.query(query, [experimentId]);
  return result.rows[0] || null;
}

/**
 * Get experiment by tenant and key
 */
export async function getExperimentByKey(tenantId: string, experimentKey: string): Promise<Experiment | null> {
  const query = 'SELECT * FROM experiments WHERE tenant_id = $1 AND key = $2';
  const result: QueryResult<Experiment> = await pool.query(query, [tenantId, experimentKey]);
  return result.rows[0] || null;
}

/**
 * List experiments for a tenant
 */
export async function listExperiments(
  tenantId: string, 
  options: { status?: string } = {}
): Promise<Experiment[]> {
  let query = 'SELECT * FROM experiments WHERE tenant_id = $1';
  const values: unknown[] = [tenantId];
  
  if (options.status) {
    values.push(options.status);
    query += ` AND status = $2`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result: QueryResult<Experiment> = await pool.query(query, values);
  return result.rows;
}

/**
 * Update experiment
 */
export async function updateExperiment(
  experimentId: string, 
  updates: Partial<Omit<Experiment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<Experiment | null> {
  const allowedFields = ['name', 'description', 'status', 'variants', 'start_date', 'end_date', 'target_sample_size', 'metadata'];
  const setClause: string[] = [];
  const values: unknown[] = [];
  let paramCount = 0;
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClause.push(`${key} = $${++paramCount}`);
      values.push(key === 'variants' && typeof value === 'object' ? JSON.stringify(value) : value);
    }
  }
  
  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(experimentId);
  const query = `
    UPDATE experiments
    SET ${setClause.join(', ')}, updated_at = now()
    WHERE id = $${++paramCount}
    RETURNING *
  `;
  
  const result: QueryResult<Experiment> = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete experiment
 */
export async function deleteExperiment(experimentId: string): Promise<boolean> {
  const query = 'DELETE FROM experiments WHERE id = $1';
  const result = await pool.query(query, [experimentId]);
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

/**
 * Create or get user assignment
 */
export async function createAssignment(
  experimentId: string, 
  userId: string, 
  variant: string
): Promise<Assignment> {
  const query = `
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES ($1, $2, $3)
    ON CONFLICT (experiment_id, user_id) DO UPDATE SET variant = EXCLUDED.variant
    RETURNING *
  `;
  
  const result: QueryResult<Assignment> = await pool.query(query, [experimentId, userId, variant]);
  return result.rows[0];
}

/**
 * Get user assignment for experiment
 */
export async function getAssignment(experimentId: string, userId: string): Promise<Assignment | null> {
  const query = 'SELECT * FROM assignments WHERE experiment_id = $1 AND user_id = $2';
  const result: QueryResult<Assignment> = await pool.query(query, [experimentId, userId]);
  return result.rows[0] || null;
}

// ============================================================================
// VIEW TRACKING
// ============================================================================

/**
 * Record a pricing view
 */
export async function recordView(
  experimentId: string, 
  userId: string, 
  variant: string, 
  metadata: Record<string, unknown> = {}
): Promise<View> {
  const query = `
    INSERT INTO views (experiment_id, user_id, variant, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result: QueryResult<View> = await pool.query(query, [experimentId, userId, variant, metadata]);
  return result.rows[0];
}

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

/**
 * Record a conversion
 */
export async function recordConversion(
  experimentId: string, 
  userId: string, 
  variant: string, 
  revenue: number, 
  metadata: Record<string, unknown> = {}, 
  paidOrderId: string | null = null
): Promise<Conversion> {
  const query = `
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, metadata, paid_order_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result: QueryResult<Conversion> = await pool.query(query, [
    experimentId, userId, variant, revenue, metadata, paidOrderId
  ]);
  return result.rows[0];
}

// ============================================================================
// EXPERIMENT RESULTS
// ============================================================================

interface ResultRow {
  variant: string;
  views: string;
  conversions: string;
  revenue: string;
  conversion_rate: string;
  arpu: string;
}

/**
 * Get experiment results with metrics by variant
 */
export async function getExperimentResults(experimentId: string): Promise<ExperimentResults> {
  const query = `
    SELECT
      v.variant,
      COUNT(DISTINCT v.user_id) AS views,
      COUNT(DISTINCT c.user_id) AS conversions,
      COALESCE(SUM(c.revenue), 0) AS revenue,
      CASE
        WHEN COUNT(DISTINCT v.user_id) > 0
        THEN CAST(COUNT(DISTINCT c.user_id) AS DECIMAL) / COUNT(DISTINCT v.user_id)
        ELSE 0
      END AS conversion_rate,
      CASE
        WHEN COUNT(DISTINCT c.user_id) > 0
        THEN COALESCE(SUM(c.revenue), 0) / COUNT(DISTINCT c.user_id)
        ELSE 0
      END AS arpu
    FROM
      (SELECT DISTINCT experiment_id, user_id, variant FROM views WHERE experiment_id = $1) v
    LEFT JOIN
      conversions c ON v.experiment_id = c.experiment_id AND v.user_id = c.user_id
    GROUP BY v.variant
  `;
  
  const result: QueryResult<ResultRow> = await pool.query(query, [experimentId]);
  
  const results: ExperimentResults = {
    experimentId,
    control: null,
    experiment: null
  };
  
  for (const row of result.rows) {
    const metrics: VariantMetrics = {
      views: parseInt(row.views, 10),
      conversions: parseInt(row.conversions, 10),
      revenue: parseFloat(row.revenue).toFixed(2),
      conversionRate: (parseFloat(row.conversion_rate) * 100).toFixed(2) + '%',
      arpu: parseFloat(row.arpu).toFixed(2)
    };
    
    if (row.variant === 'control') {
      results.control = metrics;
    } else {
      results[row.variant] = metrics;
    }
  }
  
  return results;
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

/**
 * Record usage metric for tenant
 */
export async function recordUsage(
  tenantId: string, 
  metric: string, 
  value: number, 
  period: Date = new Date()
): Promise<Usage> {
  const periodDate = period.toISOString().split('T')[0];
  
  const query = `
    INSERT INTO usage (tenant_id, metric, value, period)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (tenant_id, metric, period)
    DO UPDATE SET value = usage.value + EXCLUDED.value
    RETURNING *
  `;
  
  const result: QueryResult<Usage> = await pool.query(query, [tenantId, metric, value, periodDate]);
  return result.rows[0];
}

/**
 * Get usage for tenant
 */
export async function getUsage(
  tenantId: string, 
  options: { startDate?: Date; endDate?: Date; metric?: string } = {}
): Promise<Usage[]> {
  let query = 'SELECT * FROM usage WHERE tenant_id = $1';
  const values: unknown[] = [tenantId];
  let paramCount = 1;
  
  if (options.startDate) {
    values.push(options.startDate.toISOString().split('T')[0]);
    query += ` AND period >= $${++paramCount}`;
  }
  
  if (options.endDate) {
    values.push(options.endDate.toISOString().split('T')[0]);
    query += ` AND period <= $${++paramCount}`;
  }
  
  if (options.metric) {
    values.push(options.metric);
    query += ` AND metric = $${++paramCount}`;
  }
  
  query += ' ORDER BY period DESC, metric';
  
  const result: QueryResult<Usage> = await pool.query(query, values);
  return result.rows;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Close database pool (for graceful shutdown)
 */
export async function close(): Promise<void> {
  await pool.end();
}
