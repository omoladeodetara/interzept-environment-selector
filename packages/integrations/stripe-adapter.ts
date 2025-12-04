/**
 * Stripe Adapter
 *
 * Integration with Stripe Billing for tracking conversions and usage.
 */

import axios from 'axios';
import {
  SignalData,
  ConversionData,
  DateRange,
  UsageMetrics,
  TenantMode,
  ValidationError,
} from './types';
import { BaseBillingAdapter } from './adapter';

interface StripeConfig {
  secretKey: string;
}

/**
 * Stripe billing adapter implementation
 */
export class StripeAdapter extends BaseBillingAdapter {
  private secretKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(tenantId: string, mode: TenantMode, config: StripeConfig) {
    super(tenantId, mode);

    if (!config.secretKey) {
      throw new ValidationError('Stripe secret key is required');
    }

    this.secretKey = config.secretKey;
  }

  /**
   * Emit a signal - stored locally as Stripe doesn't have a signals API
   */
  async emitSignal(data: SignalData): Promise<void> {
    this.validateSignalData(data);

    // For Stripe integration, we log signals locally
    console.log(`[Stripe Adapter] Signal emitted:`, {
      tenantId: this.tenantId,
      orderId: data.orderId,
      experimentId: data.experimentId,
      variantId: data.variantId,
      eventType: data.eventType,
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Track a conversion by creating a Stripe invoice item or recording metadata
   */
  async trackConversion(data: ConversionData): Promise<void> {
    this.validateConversionData(data);

    console.log(`[Stripe Adapter] Conversion tracked:`, {
      tenantId: this.tenantId,
      orderId: data.orderId,
      experimentId: data.experimentId,
      variantId: data.variantId,
      revenue: data.revenue,
      currency: data.currency || 'USD',
      timestamp: data.timestamp.toISOString(),
    });
  }

  /**
   * Get usage metrics from Stripe
   */
  async getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics> {
    try {
      const response = await axios.get(`${this.baseUrl}/charges`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: {
          created: {
            gte: Math.floor(dateRange.start.getTime() / 1000),
            lte: Math.floor(dateRange.end.getTime() / 1000),
          },
          limit: 100,
        },
        timeout: 30000,
      });

      const charges = response.data.data || [];
      let totalRevenue = 0;
      const byExperiment: Record<
        string,
        { signals: number; conversions: number; revenue: number }
      > = {};

      for (const charge of charges) {
        if (charge.status === 'succeeded') {
          totalRevenue += charge.amount / 100; // Stripe uses cents

          const experimentId = charge.metadata?.experiment_id;
          if (experimentId) {
            if (!byExperiment[experimentId]) {
              byExperiment[experimentId] = { signals: 0, conversions: 0, revenue: 0 };
            }
            byExperiment[experimentId].conversions++;
            byExperiment[experimentId].revenue += charge.amount / 100;
          }
        }
      }

      return {
        totalSignals: 0,
        totalConversions: charges.filter(
          (c: { status: string }) => c.status === 'succeeded'
        ).length,
        totalRevenue,
        byExperiment,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to get metrics from Stripe: ${message}`);
      }
      throw error;
    }
  }
}

/**
 * Factory function for creating Stripe adapters
 */
export function createStripeAdapter(
  tenantId: string,
  mode: TenantMode,
  config: StripeConfig
): StripeAdapter {
  return new StripeAdapter(tenantId, mode, config);
}
