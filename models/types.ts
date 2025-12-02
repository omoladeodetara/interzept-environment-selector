/**
 * Core type definitions for Last Price platform
 */

export interface Tenant {
  id: string;
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paid_api_key: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  metadata: Record<string, any>;
  webhook_secret: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Experiment {
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: Variant[];
  target_sample_size: number | null;
  start_date: Date | null;
  end_date: Date | null;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Variant {
  name: string;
  price: number;
  weight?: number;
  metadata?: Record<string, any>;
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
  metadata: Record<string, any>;
  created_at: Date;
}

export interface Conversion {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  revenue: number;
  metadata: Record<string, any>;
  paid_order_id: string | null;
  created_at: Date;
}

export interface Usage {
  id: string;
  tenant_id: string;
  metric: string;
  value: number;
  period: string;
  created_at: Date;
}

export interface ExperimentResults {
  experimentId: string;
  control: VariantMetrics | null;
  experiment: VariantMetrics | null;
  [key: string]: string | VariantMetrics | null;
}

export interface VariantMetrics {
  views: number;
  conversions: number;
  revenue: string;
  conversionRate: string;
  arpu: string;
}

export interface PricingRecommendation {
  recommendedPrice: number;
  expectedRevenue: number;
  confidence: number;
  simulation: PriceSimulation[];
}

export interface PriceSimulation {
  price: number;
  estimatedCv: number;
  expectedRevenue: number;
}

export interface Config {
  nodeEnv: string;
  port: number;
  paidApiKey: string;
  paidApiBaseUrl: string;
  enableWebhookVerification: boolean;
  webhookSecret: string;
  experimentDefaults: {
    controlWeight: number;
    experimentWeight: number;
  };
}
