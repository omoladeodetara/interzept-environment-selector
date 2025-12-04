/**
 * Integration Types
 *
 * Common types for billing and analytics integrations.
 */

export type TenantMode = 'managed' | 'byok';
export type ProviderType = 'paid-ai' | 'stripe' | 'manual';

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
  mode: TenantMode;
}

// Error types
export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class ValidationError extends IntegrationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}
