/**
 * Database service for Last Price multi-tenant system
 * 
 * This module provides database access using PostgreSQL with the pg library.
 * It handles tenant management, experiments, assignments, views, conversions, and usage tracking.
 */

import { Pool, QueryResult } from 'pg';
import {
  Tenant,
  Experiment,
  Assignment,
  View,
  Conversion,
  Usage,
  Variant,
  ExperimentResults
} from '@models/types';

// Database configuration from environment variables
const config = {
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
const poolConfig = config.connectionString
  ? {
      connectionString: config.connectionString,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    }
  : {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    };

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// ============================================================================
// TENANT OPERATIONS
// ============================================================================

export async function createTenant(tenant: {
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paidApiKey?: string | null;
  plan?: string;
  metadata?: Record<string, any>;
}): Promise<Tenant> {
  const { name, email, mode, paidApiKey = null, plan = 'free', metadata = {} } = tenant;
  
  const query = `
    INSERT INTO tenants (name, email, mode, paid_api_key, plan, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [name, email, mode, paidApiKey, plan, metadata];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Tenant with this email already exists');
    }
    throw error;
  }
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const query = 'SELECT * FROM tenants WHERE id = $1';
  const result = await pool.query(query, [tenantId]);
  return result.rows[0] || null;
}

export async function getTenantByEmail(email: string): Promise<Tenant | null> {
  const query = 'SELECT * FROM tenants WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

export async function listTenants(options: {
  mode?: string;
  plan?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ tenants: Tenant[]; pagination: { total: number; limit: number; offset: number } }> {
  const { mode, plan, limit = 20, offset = 0 } = options;
  
  let whereClause = 'WHERE 1=1';
  const whereValues: any[] = [];
  let paramCount = 0;
  
  if (mode) {
    whereValues.push(mode);
    whereClause += ` AND mode = $${++paramCount}`;
  }
  
  if (plan) {
    whereValues.push(plan);
    whereClause += ` AND plan = $${++paramCount}`;
  }
  
  // Main query
  let query = `SELECT * FROM tenants ${whereClause} ORDER BY created_at DESC`;
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  const queryValues = [...whereValues, limit, offset];
  
  // Count query with same filters
  const countQuery = `SELECT COUNT(*) FROM tenants ${whereClause}`;
  
  const [tenantsResult, countResult] = await Promise.all([
    pool.query(query, queryValues),
    pool.query(countQuery, whereValues)
  ]);
  
  return {
    tenants: tenantsResult.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    }
  };
}

export async function updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  const allowedFields = ['name', 'mode', 'paid_api_key', 'plan', 'metadata', 'webhook_secret'];
  const setClause: string[] = [];
  const values: any[] = [];
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
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function deleteTenant(tenantId: string): Promise<boolean> {
  const query = 'DELETE FROM tenants WHERE id = $1';
  const result = await pool.query(query, [tenantId]);
  return result.rowCount! > 0;
}

// ============================================================================
// EXPERIMENT OPERATIONS
// ============================================================================

export async function createExperiment(experiment: {
  tenantId: string;
  key: string;
  name: string;
  description?: string | null;
  variants: Variant[];
  targetSampleSize?: number | null;
}): Promise<Experiment> {
  const { tenantId, key, name, description = null, variants, targetSampleSize = null } = experiment;
  
  const query = `
    INSERT INTO experiments (tenant_id, key, name, description, variants, target_sample_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [tenantId, key, name, description, JSON.stringify(variants), targetSampleSize];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Experiment with this key already exists for this tenant');
    }
    throw error;
  }
}

export async function getExperiment(experimentId: string): Promise<Experiment | null> {
  const query = 'SELECT * FROM experiments WHERE id = $1';
  const result = await pool.query(query, [experimentId]);
  return result.rows[0] || null;
}

export async function getExperimentByKey(tenantId: string, experimentKey: string): Promise<Experiment | null> {
  const query = 'SELECT * FROM experiments WHERE tenant_id = $1 AND key = $2';
  const result = await pool.query(query, [tenantId, experimentKey]);
  return result.rows[0] || null;
}

export async function listExperiments(tenantId: string, options: { status?: string } = {}): Promise<Experiment[]> {
  const { status } = options;
  
  let query = 'SELECT * FROM experiments WHERE tenant_id = $1';
  const values: any[] = [tenantId];
  
  if (status) {
    values.push(status);
    query += ` AND status = $2`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, values);
  return result.rows;
}

export async function updateExperiment(experimentId: string, updates: Partial<Experiment>): Promise<Experiment | null> {
  const allowedFields = ['name', 'description', 'status', 'variants', 'start_date', 'end_date', 'target_sample_size', 'metadata'];
  const setClause: string[] = [];
  const values: any[] = [];
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
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function deleteExperiment(experimentId: string): Promise<boolean> {
  const query = 'DELETE FROM experiments WHERE id = $1';
  const result = await pool.query(query, [experimentId]);
  return result.rowCount! > 0;
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

export async function createAssignment(experimentId: string, userId: string, variant: string): Promise<Assignment> {
  const query = `
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES ($1, $2, $3)
    ON CONFLICT (experiment_id, user_id) DO UPDATE SET variant = EXCLUDED.variant
    RETURNING *
  `;
  
  const result = await pool.query(query, [experimentId, userId, variant]);
  return result.rows[0];
}

export async function getAssignment(experimentId: string, userId: string): Promise<Assignment | null> {
  const query = 'SELECT * FROM assignments WHERE experiment_id = $1 AND user_id = $2';
  const result = await pool.query(query, [experimentId, userId]);
  return result.rows[0] || null;
}

// ============================================================================
// VIEW TRACKING
// ============================================================================

export async function recordView(
  experimentId: string,
  userId: string,
  variant: string,
  metadata: Record<string, any> = {}
): Promise<View> {
  const query = `
    INSERT INTO views (experiment_id, user_id, variant, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await pool.query(query, [experimentId, userId, variant, metadata]);
  return result.rows[0];
}

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

export async function recordConversion(
  experimentId: string,
  userId: string,
  variant: string,
  revenue: number,
  metadata: Record<string, any> = {},
  paidOrderId: string | null = null
): Promise<Conversion> {
  const query = `
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, metadata, paid_order_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await pool.query(query, [experimentId, userId, variant, revenue, metadata, paidOrderId]);
  return result.rows[0];
}

// ============================================================================
// EXPERIMENT RESULTS
// ============================================================================

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
  
  const result = await pool.query(query, [experimentId]);
  
  // Transform results into control/experiment structure
  const results: ExperimentResults = {
    experimentId,
    control: null,
    experiment: null
  };
  
  for (const row of result.rows) {
    const metrics = {
      views: parseInt(row.views),
      conversions: parseInt(row.conversions),
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

export async function recordUsage(
  tenantId: string,
  metric: string,
  value: number,
  period: Date = new Date()
): Promise<Usage> {
  const periodDate = period.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const query = `
    INSERT INTO usage (tenant_id, metric, value, period)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (tenant_id, metric, period)
    DO UPDATE SET value = usage.value + EXCLUDED.value
    RETURNING *
  `;
  
  const result = await pool.query(query, [tenantId, metric, value, periodDate]);
  return result.rows[0];
}

export async function getUsage(
  tenantId: string,
  options: { startDate?: Date; endDate?: Date; metric?: string } = {}
): Promise<Usage[]> {
  const { startDate, endDate, metric } = options;
  
  let query = 'SELECT * FROM usage WHERE tenant_id = $1';
  const values: any[] = [tenantId];
  let paramCount = 1;
  
  if (startDate) {
    values.push(startDate.toISOString().split('T')[0]);
    query += ` AND period >= $${++paramCount}`;
  }
  
  if (endDate) {
    values.push(endDate.toISOString().split('T')[0]);
    query += ` AND period <= $${++paramCount}`;
  }
  
  if (metric) {
    values.push(metric);
    query += ` AND metric = $${++paramCount}`;
  }
  
  query += ' ORDER BY period DESC, metric';
  
  const result = await pool.query(query, values);
  return result.rows;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function close(): Promise<void> {
  await pool.end();
}

export { pool };
