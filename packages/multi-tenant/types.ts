/**
 * Multi-Tenant Types
 */

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

// Error types
export class TenantError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

export class ValidationError extends TenantError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends TenantError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
