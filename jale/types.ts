/**
 * Core Types for Jale Pricing Engine
 * 
 * Defines all interfaces and types used across the pricing optimizer system.
 */

// ==================== Tenant Types ====================

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';
export type TenantMode = 'managed' | 'byok';
export type ProviderType = 'paid-ai' | 'stripe' | 'manual';

export interface TenantConfig {
  id: string;
  name: string;
  plan: PlanType;
  mode: TenantMode;
  
  // For BYOK mode
  paidApiKey?: string;
  paidApiBaseUrl?: string;
  
  // For Managed mode
  usageLimit: number;
  currentUsage: number;
  
  // Common settings
  defaultProvider: ProviderType;
  webhookUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Experiment Types ====================

export type ExperimentStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface ExperimentVariant {
  id: string;
  name: string;
  price: number;
  weight: number; // Traffic allocation (0-100)
  metadata?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  startDate?: Date;
  endDate?: Date;
  targetSampleSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentResults {
  experimentId: string;
  variants: {
    [variantId: string]: VariantMetrics;
  };
  summary: {
    totalViews: number;
    totalConversions: number;
    totalRevenue: number;
    winningVariant?: string;
    statisticalSignificance?: number;
  };
}

export interface VariantMetrics {
  variantId: string;
  variantName: string;
  price: number;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerView: number;
}

// ==================== Recommendation Types ====================

export interface PricingRecommendation {
  currentPrice: number;
  recommendedPrice: number;
  confidence: number; // 0-100
  reasoning: string[];
  expectedImpact: {
    revenueChange: number; // percentage
    conversionChange: number; // percentage
    elasticity: number;
  };
  nextSteps: string[];
}

export interface BusinessGoals {
  objective: 'revenue' | 'conversion' | 'profit' | 'market_share';
  minPrice?: number;
  maxPrice?: number;
  targetMargin?: number;
  competitorPrices?: number[];
}

// ==================== Analytics Types ====================

export interface ElasticityAnalysis {
  elasticity: number;
  interpretation: 'elastic' | 'inelastic' | 'unit_elastic';
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  sampleSize: number;
}

export interface DashboardData {
  activeExperiments: number;
  completedExperiments: number;
  totalRevenue: number;
  avgConversionRate: number;
  revenueImpact: number;
  topPerformingExperiment?: {
    id: string;
    name: string;
    revenueImpact: number;
  };
  recentExperiments: Experiment[];
}

// ==================== Billing Adapter Types ====================

export interface SignalData {
  orderId: string;
  experimentId: string;
  variantId: string;
  eventType: 'view' | 'conversion' | 'custom';
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface ConversionData {
  orderId: string;
  experimentId: string;
  variantId: string;
  revenue: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface UsageMetrics {
  totalSignals: number;
  totalConversions: number;
  totalRevenue: number;
  byExperiment: {
    [experimentId: string]: {
      signals: number;
      conversions: number;
      revenue: number;
    };
  };
}

export interface BillingAdapter {
  emitSignal(data: SignalData): Promise<void>;
  trackConversion(data: ConversionData): Promise<void>;
  getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics>;
  
  // Identifies if using customer's key or platform key
  mode: TenantMode;
}

// ==================== API Types ====================

export interface CreateExperimentRequest {
  name: string;
  description?: string;
  variants: Array<{
    name: string;
    price: number;
    weight?: number;
  }>;
}

export interface UpdateExperimentRequest {
  name?: string;
  description?: string;
  status?: ExperimentStatus;
}

export interface AddVariantRequest {
  name: string;
  price: number;
  weight?: number;
}

export interface AnalyzeRequest {
  experimentId?: string;
  currentPrice: number;
  businessGoals?: BusinessGoals;
}

export interface IntegrationConfig {
  mode: TenantMode;
  provider: ProviderType;
  paidApiKey?: string;
  paidApiBaseUrl?: string;
}

export interface ValidateKeyResponse {
  valid: boolean;
  error?: string;
}

// ==================== Usage & Billing Types ====================

export interface UsageRecord {
  id: string;
  tenantId: string;
  usageType: 'signal' | 'api_call';
  count: number;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface TenantUsageSummary {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  signals: number;
  apiCalls: number;
  totalUsage: number;
  limit: number;
  overage: number;
  overageCharges: number;
}

// ==================== Error Types ====================

export class PricingOptimizerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'PricingOptimizerError';
  }
}

export class ValidationError extends PricingOptimizerError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends PricingOptimizerError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends PricingOptimizerError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends PricingOptimizerError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}
