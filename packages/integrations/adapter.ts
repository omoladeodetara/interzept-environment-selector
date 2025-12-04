/**
 * Billing Adapter Interface
 *
 * Common interface for all billing/analytics providers.
 * Implementations handle the specifics of each provider.
 */

import {
  BillingAdapter,
  SignalData,
  ConversionData,
  DateRange,
  UsageMetrics,
  TenantMode,
} from './types';

/**
 * Abstract base class for billing adapters
 */
export abstract class BaseBillingAdapter implements BillingAdapter {
  protected tenantId: string;
  public mode: TenantMode;

  constructor(tenantId: string, mode: TenantMode) {
    this.tenantId = tenantId;
    this.mode = mode;
  }

  abstract emitSignal(data: SignalData): Promise<void>;
  abstract trackConversion(data: ConversionData): Promise<void>;
  abstract getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics>;

  /**
   * Validate common signal data
   */
  protected validateSignalData(data: SignalData): void {
    if (!data.orderId || typeof data.orderId !== 'string') {
      throw new Error('Invalid orderId: must be a non-empty string');
    }
    if (!data.experimentId || typeof data.experimentId !== 'string') {
      throw new Error('Invalid experimentId: must be a non-empty string');
    }
    if (!data.variantId || typeof data.variantId !== 'string') {
      throw new Error('Invalid variantId: must be a non-empty string');
    }
    if (!['view', 'conversion', 'custom'].includes(data.eventType)) {
      throw new Error('Invalid eventType: must be view, conversion, or custom');
    }
  }

  /**
   * Validate common conversion data
   */
  protected validateConversionData(data: ConversionData): void {
    if (!data.orderId || typeof data.orderId !== 'string') {
      throw new Error('Invalid orderId: must be a non-empty string');
    }
    if (!data.experimentId || typeof data.experimentId !== 'string') {
      throw new Error('Invalid experimentId: must be a non-empty string');
    }
    if (!data.variantId || typeof data.variantId !== 'string') {
      throw new Error('Invalid variantId: must be a non-empty string');
    }
    if (typeof data.revenue !== 'number' || data.revenue < 0) {
      throw new Error('Invalid revenue: must be a non-negative number');
    }
  }
}

/**
 * Factory function type for creating adapters
 */
export type AdapterFactory = (
  tenantId: string,
  mode: TenantMode,
  config: Record<string, unknown>
) => BillingAdapter;
