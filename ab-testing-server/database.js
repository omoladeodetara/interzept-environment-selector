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

const { Pool } = require('pg');

// Database configuration from environment variables
const config = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lastprice',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
};

// Create connection pool
const pool = new Pool(config.connectionString ? { connectionString: config.connectionString } : {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  password: config.password,
  max: config.max,
  idleTimeoutMillis: config.idleTimeoutMillis,
  connectionTimeoutMillis: config.connectionTimeoutMillis,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// ============================================================================
// TENANT OPERATIONS
// ============================================================================

/**
 * Create a new tenant
 * @param {Object} tenant - Tenant data
 * @param {string} tenant.name - Tenant name
 * @param {string} tenant.email - Tenant email
 * @param {string} tenant.mode - Mode (managed or byok)
 * @param {string} [tenant.paidApiKey] - Paid.ai API key (for BYOK mode)
 * @param {string} [tenant.plan] - Plan tier (free, starter, pro, enterprise)
 * @param {Object} [tenant.metadata] - Additional metadata
 * @returns {Promise<Object>} Created tenant
 */
async function createTenant({ name, email, mode, paidApiKey = null, plan = 'free', metadata = {} }) {
  // SECURITY NOTE: In production, encrypt paidApiKey before storage
  // Example using pgcrypto:
  //   const encryptedKey = paidApiKey ? `pgp_sym_encrypt('${paidApiKey}', '${process.env.ENCRYPTION_KEY}')` : null;
  // Or use application-level encryption with a library like crypto or a KMS service
  
  const query = `
    INSERT INTO tenants (name, email, mode, paid_api_key, plan, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [name, email, mode, paidApiKey, plan, metadata];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Tenant with this email already exists');
    }
    throw error;
  }
}

/**
 * Get tenant by ID
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object|null>} Tenant or null if not found
 */
async function getTenant(tenantId) {
  const query = 'SELECT * FROM tenants WHERE id = $1';
  const result = await pool.query(query, [tenantId]);
  return result.rows[0] || null;
}

/**
 * Get tenant by email
 * @param {string} email - Tenant email
 * @returns {Promise<Object|null>} Tenant or null if not found
 */
async function getTenantByEmail(email) {
  const query = 'SELECT * FROM tenants WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * List tenants with optional filters
 * @param {Object} options - Query options
 * @param {string} [options.mode] - Filter by mode
 * @param {string} [options.plan] - Filter by plan
 * @param {number} [options.limit=20] - Results per page
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object>} Tenants and pagination info
 */
async function listTenants({ mode, plan, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tenants WHERE 1=1';
  const values = [];
  let paramCount = 0;
  
  if (mode) {
    values.push(mode);
    query += ` AND mode = $${++paramCount}`;
  }
  
  if (plan) {
    values.push(plan);
    query += ` AND plan = $${++paramCount}`;
  }
  
  query += ' ORDER BY created_at DESC';
  query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  values.push(limit, offset);
  
  const [tenantsResult, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query('SELECT COUNT(*) FROM tenants')
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

/**
 * Update tenant
 * @param {string} tenantId - Tenant UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated tenant or null if not found
 */
async function updateTenant(tenantId, updates) {
  const allowedFields = ['name', 'mode', 'paid_api_key', 'plan', 'metadata', 'webhook_secret'];
  const setClause = [];
  const values = [];
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

/**
 * Delete tenant
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteTenant(tenantId) {
  const query = 'DELETE FROM tenants WHERE id = $1';
  const result = await pool.query(query, [tenantId]);
  return result.rowCount > 0;
}

// ============================================================================
// EXPERIMENT OPERATIONS
// ============================================================================

/**
 * Create an experiment
 * @param {Object} experiment - Experiment data
 * @param {string} experiment.tenantId - Tenant UUID
 * @param {string} experiment.key - Experiment key
 * @param {string} experiment.name - Experiment name
 * @param {string} [experiment.description] - Description
 * @param {Array} experiment.variants - Array of variant objects
 * @param {number} [experiment.targetSampleSize] - Target sample size
 * @returns {Promise<Object>} Created experiment
 */
async function createExperiment({ tenantId, key, name, description = null, variants, targetSampleSize = null }) {
  const query = `
    INSERT INTO experiments (tenant_id, key, name, description, variants, target_sample_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [tenantId, key, name, description, JSON.stringify(variants), targetSampleSize];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Experiment with this key already exists for this tenant');
    }
    throw error;
  }
}

/**
 * Get experiment by ID
 * @param {string} experimentId - Experiment UUID
 * @returns {Promise<Object|null>} Experiment or null if not found
 */
async function getExperiment(experimentId) {
  const query = 'SELECT * FROM experiments WHERE id = $1';
  const result = await pool.query(query, [experimentId]);
  return result.rows[0] || null;
}

/**
 * Get experiment by tenant and key
 * @param {string} tenantId - Tenant UUID
 * @param {string} experimentKey - Experiment key
 * @returns {Promise<Object|null>} Experiment or null if not found
 */
async function getExperimentByKey(tenantId, experimentKey) {
  const query = 'SELECT * FROM experiments WHERE tenant_id = $1 AND key = $2';
  const result = await pool.query(query, [tenantId, experimentKey]);
  return result.rows[0] || null;
}

/**
 * List experiments for a tenant
 * @param {string} tenantId - Tenant UUID
 * @param {Object} options - Query options
 * @param {string} [options.status] - Filter by status
 * @returns {Promise<Array>} Array of experiments
 */
async function listExperiments(tenantId, { status } = {}) {
  let query = 'SELECT * FROM experiments WHERE tenant_id = $1';
  const values = [tenantId];
  
  if (status) {
    values.push(status);
    query += ` AND status = $2`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, values);
  return result.rows;
}

/**
 * Update experiment
 * @param {string} experimentId - Experiment UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated experiment or null if not found
 */
async function updateExperiment(experimentId, updates) {
  const allowedFields = ['name', 'description', 'status', 'variants', 'start_date', 'end_date', 'target_sample_size', 'metadata'];
  const setClause = [];
  const values = [];
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

/**
 * Delete experiment
 * @param {string} experimentId - Experiment UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteExperiment(experimentId) {
  const query = 'DELETE FROM experiments WHERE id = $1';
  const result = await pool.query(query, [experimentId]);
  return result.rowCount > 0;
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

/**
 * Create or get user assignment
 * @param {string} experimentId - Experiment UUID
 * @param {string} userId - User identifier
 * @param {string} variant - Assigned variant
 * @returns {Promise<Object>} Assignment record
 */
async function createAssignment(experimentId, userId, variant) {
  const query = `
    INSERT INTO assignments (experiment_id, user_id, variant)
    VALUES ($1, $2, $3)
    ON CONFLICT (experiment_id, user_id) DO UPDATE SET variant = EXCLUDED.variant
    RETURNING *
  `;
  
  const result = await pool.query(query, [experimentId, userId, variant]);
  return result.rows[0];
}

/**
 * Get user assignment for experiment
 * @param {string} experimentId - Experiment UUID
 * @param {string} userId - User identifier
 * @returns {Promise<Object|null>} Assignment or null if not found
 */
async function getAssignment(experimentId, userId) {
  const query = 'SELECT * FROM assignments WHERE experiment_id = $1 AND user_id = $2';
  const result = await pool.query(query, [experimentId, userId]);
  return result.rows[0] || null;
}

// ============================================================================
// VIEW TRACKING
// ============================================================================

/**
 * Record a pricing view
 * @param {string} experimentId - Experiment UUID
 * @param {string} userId - User identifier
 * @param {string} variant - Variant shown
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {Promise<Object>} View record
 */
async function recordView(experimentId, userId, variant, metadata = {}) {
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

/**
 * Record a conversion
 * @param {string} experimentId - Experiment UUID
 * @param {string} userId - User identifier
 * @param {string} variant - Variant for this conversion
 * @param {number} revenue - Revenue amount
 * @param {string} [paidOrderId=null] - External order ID
 * @param {Object} [metadata={}] - Additional metadata
 * @returns {Promise<Object>} Conversion record
 */
async function recordConversion(experimentId, userId, variant, revenue, paidOrderId = null, metadata = {}) {
  const query = `
    INSERT INTO conversions (experiment_id, user_id, variant, revenue, paid_order_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await pool.query(query, [experimentId, userId, variant, revenue, paidOrderId, metadata]);
  return result.rows[0];
}

// ============================================================================
// EXPERIMENT RESULTS
// ============================================================================

/**
 * Get experiment results with metrics by variant
 * @param {string} experimentId - Experiment UUID
 * @returns {Promise<Object>} Results object with control and experiment metrics
 */
async function getExperimentResults(experimentId) {
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
  const results = {
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

/**
 * Record usage metric for tenant
 * @param {string} tenantId - Tenant UUID
 * @param {string} metric - Metric name (e.g., 'api_calls', 'signals')
 * @param {number} value - Metric value
 * @param {Date} [period] - Period date (defaults to today)
 * @returns {Promise<Object>} Usage record
 */
async function recordUsage(tenantId, metric, value, period = new Date()) {
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

/**
 * Get usage for tenant
 * @param {string} tenantId - Tenant UUID
 * @param {Object} options - Query options
 * @param {Date} [options.startDate] - Start date
 * @param {Date} [options.endDate] - End date
 * @param {string} [options.metric] - Filter by metric
 * @returns {Promise<Array>} Usage records
 */
async function getUsage(tenantId, { startDate, endDate, metric } = {}) {
  let query = 'SELECT * FROM usage WHERE tenant_id = $1';
  const values = [tenantId];
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

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
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
async function close() {
  await pool.end();
}

// Export all functions
module.exports = {
  // Tenant operations
  createTenant,
  getTenant,
  getTenantByEmail,
  listTenants,
  updateTenant,
  deleteTenant,
  
  // Experiment operations
  createExperiment,
  getExperiment,
  getExperimentByKey,
  listExperiments,
  updateExperiment,
  deleteExperiment,
  
  // Assignment operations
  createAssignment,
  getAssignment,
  
  // Tracking operations
  recordView,
  recordConversion,
  
  // Results
  getExperimentResults,
  
  // Usage tracking
  recordUsage,
  getUsage,
  
  // Utility
  testConnection,
  close,
  
  // Export pool for advanced use cases
  pool
};
