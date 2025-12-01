-- Database schema for Last Price multi-tenant pricing optimization system
-- This schema supports both BYOK (Bring Your Own Key) and Managed modes for Paid.ai integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
-- Stores tenant information with support for BYOK and Managed modes
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('managed', 'byok')),
  paid_api_key TEXT, -- Encrypted API key for BYOK mode (nullable for managed)
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  webhook_secret TEXT, -- Secret for webhook signature verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast email lookups
CREATE INDEX idx_tenants_email ON tenants(email);

-- Index for mode filtering
CREATE INDEX idx_tenants_mode ON tenants(mode);

-- ============================================================================
-- EXPERIMENTS TABLE
-- ============================================================================
-- Stores A/B testing experiments with tenant isolation
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL, -- Experiment identifier (e.g., 'pricing_test_001')
  name TEXT NOT NULL,
  description TEXT,
  variants JSONB NOT NULL, -- Array of variant objects with name, price, weight
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_sample_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, key)
);

-- Index for fast tenant lookups
CREATE INDEX idx_experiments_tenant_id ON experiments(tenant_id);

-- Index for status filtering
CREATE INDEX idx_experiments_status ON experiments(status);

-- Index for active experiments by tenant
CREATE INDEX idx_experiments_tenant_active ON experiments(tenant_id, status) WHERE status = 'active';

-- ============================================================================
-- ASSIGNMENTS TABLE
-- ============================================================================
-- Stores user-to-variant assignments for experiments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- External user identifier
  variant TEXT NOT NULL, -- Assigned variant name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (experiment_id, user_id)
);

-- Index for fast experiment lookups
CREATE INDEX idx_assignments_experiment_id ON assignments(experiment_id);

-- Index for user lookups
CREATE INDEX idx_assignments_user_id ON assignments(user_id);

-- Composite index for variant analysis
CREATE INDEX idx_assignments_experiment_variant ON assignments(experiment_id, variant);

-- ============================================================================
-- VIEWS TABLE
-- ============================================================================
-- Tracks pricing page views (impressions)
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast experiment lookups
CREATE INDEX idx_views_experiment_id ON views(experiment_id);

-- Index for time-series analysis
CREATE INDEX idx_views_timestamp ON views(timestamp);

-- Index for variant analysis
CREATE INDEX idx_views_experiment_variant ON views(experiment_id, variant);

-- ============================================================================
-- CONVERSIONS TABLE
-- ============================================================================
-- Stores conversion events (subscriptions, purchases)
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  revenue NUMERIC(10, 2) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_order_id TEXT, -- External order ID from Paid.ai
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast experiment lookups
CREATE INDEX idx_conversions_experiment_id ON conversions(experiment_id);

-- Index for time-series analysis
CREATE INDEX idx_conversions_timestamp ON conversions(timestamp);

-- Index for variant analysis
CREATE INDEX idx_conversions_experiment_variant ON conversions(experiment_id, variant);

-- Index for revenue calculations
CREATE INDEX idx_conversions_revenue ON conversions(experiment_id, variant, revenue);

-- Index for Paid.ai order tracking
CREATE INDEX idx_conversions_paid_order_id ON conversions(paid_order_id) WHERE paid_order_id IS NOT NULL;

-- ============================================================================
-- USAGE TABLE
-- ============================================================================
-- Tracks usage metrics for billing and rate limiting
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- 'api_calls', 'signals', 'experiments', etc.
  value NUMERIC NOT NULL,
  period DATE NOT NULL, -- Billing period (daily aggregation)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, metric, period)
);

-- Index for tenant usage lookups
CREATE INDEX idx_usage_tenant_id ON usage(tenant_id);

-- Index for period-based queries
CREATE INDEX idx_usage_period ON usage(period);

-- Composite index for billing queries
CREATE INDEX idx_usage_tenant_period ON usage(tenant_id, period);

-- ============================================================================
-- RECOMMENDATIONS TABLE (optional)
-- ============================================================================
-- Stores AI-generated pricing recommendations from jale
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recommended_price NUMERIC(10, 2) NOT NULL,
  expected_revenue NUMERIC(10, 2),
  confidence NUMERIC(3, 2), -- 0.00 to 1.00
  objective TEXT NOT NULL CHECK (objective IN ('revenue', 'conversion', 'profit', 'market_share')),
  simulation JSONB, -- Full simulation results from jale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for experiment recommendations
CREATE INDEX idx_recommendations_experiment_id ON recommendations(experiment_id);

-- Index for tenant recommendations
CREATE INDEX idx_recommendations_tenant_id ON recommendations(tenant_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for experiments
CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Materialized view for experiment metrics (performance optimization)
CREATE MATERIALIZED VIEW experiment_metrics AS
SELECT
  e.id AS experiment_id,
  e.tenant_id,
  e.key AS experiment_key,
  e.name AS experiment_name,
  e.status,
  COUNT(DISTINCT a.user_id) AS total_assignments,
  COUNT(DISTINCT v.id) AS total_views,
  COUNT(DISTINCT c.id) AS total_conversions,
  COALESCE(SUM(c.revenue), 0) AS total_revenue,
  CASE 
    WHEN COUNT(DISTINCT v.id) > 0 
    THEN CAST(COUNT(DISTINCT c.id) AS NUMERIC) / NULLIF(COUNT(DISTINCT v.id), 0)
    ELSE 0
  END AS conversion_rate,
  CASE
    WHEN COUNT(DISTINCT c.id) > 0
    THEN COALESCE(SUM(c.revenue), 0) / COUNT(DISTINCT c.id)
    ELSE 0
  END AS average_order_value
FROM experiments e
LEFT JOIN assignments a ON e.id = a.experiment_id
LEFT JOIN views v ON e.id = v.experiment_id
LEFT JOIN conversions c ON e.id = c.experiment_id
GROUP BY e.id, e.tenant_id, e.key, e.name, e.status;

-- Index on materialized view
CREATE INDEX idx_experiment_metrics_tenant_id ON experiment_metrics(tenant_id);
CREATE INDEX idx_experiment_metrics_experiment_id ON experiment_metrics(experiment_id);

-- Refresh function for the materialized view
CREATE OR REPLACE FUNCTION refresh_experiment_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY experiment_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (for development)
-- ============================================================================

-- Example tenant (managed mode)
INSERT INTO tenants (name, email, mode, plan) 
VALUES ('Demo Company', 'demo@example.com', 'managed', 'starter')
ON CONFLICT (email) DO NOTHING;

-- Example tenant (BYOK mode) - API key should be encrypted in production
INSERT INTO tenants (name, email, mode, plan, paid_api_key) 
VALUES ('BYOK Company', 'byok@example.com', 'byok', 'pro', 'sk_test_example_key_encrypted')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant necessary permissions to the application database user
-- Replace 'app_user' with your actual database user

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
