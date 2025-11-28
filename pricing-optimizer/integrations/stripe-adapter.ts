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
} from '../core/types';
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

  constructor(
    tenantId: string,
    mode: TenantMode,
    config: StripeConfig
  ) {
    super(tenantId, mode);

    if (!config.secretKey) {
      throw new ValidationError('Stripe secret key is required');
    }

    this.secretKey = config.secretKey;
  }

  /**
   * Emit a signal - stored locally as Stripe doesn't have a signals API
   * In production, this would store in your own database
   */
  async emitSignal(data: SignalData): Promise<void> {
    this.validateSignalData(data);

    // For Stripe integration, we log signals locally
    // as Stripe doesn't have a dedicated signals API
    console.log(`[Stripe Adapter] Signal emitted:`, {
      tenantId: this.tenantId,
      orderId: data.orderId,
      experimentId: data.experimentId,
      variantId: data.variantId,
      eventType: data.eventType,
      timestamp: data.timestamp.toISOString(),
    });

    // In production, store this in your database
  }

  /**
   * Track a conversion by creating a Stripe invoice item or recording metadata
   */
  async trackConversion(data: ConversionData): Promise<void> {
    this.validateConversionData(data);

    // For tracking purposes, we'll use Stripe's metadata on customers/subscriptions
    // This is a simplified implementation
    try {
      // In a real implementation, you would:
      // 1. Find or create the customer in Stripe
      // 2. Update customer/subscription metadata with experiment data
      // 3. Create invoice items or record usage if using usage-based billing

      console.log(`[Stripe Adapter] Conversion tracked:`, {
        tenantId: this.tenantId,
        orderId: data.orderId,
        experimentId: data.experimentId,
        variantId: data.variantId,
        revenue: data.revenue,
        currency: data.currency || 'USD',
        timestamp: data.timestamp.toISOString(),
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error?.message || error.message;
        throw new Error(`Failed to track conversion in Stripe: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Get usage metrics from Stripe
   */
  async getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics> {
    try {
      // Query Stripe for charges/invoices in the date range
      const response = await axios.get(`${this.baseUrl}/charges`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
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
      const byExperiment: Record<string, { signals: number; conversions: number; revenue: number }> = {};

      for (const charge of charges) {
        if (charge.status === 'succeeded') {
          totalRevenue += charge.amount / 100; // Stripe uses cents
          
          // Extract experiment info from metadata if present
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
        totalSignals: 0, // Stripe doesn't track signals
        totalConversions: charges.filter((c: { status: string }) => c.status === 'succeeded').length,
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

  /**
   * Validate Stripe API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
        timeout: 10000,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
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
  config: { secretKey: string }
): StripeAdapter {
  return new StripeAdapter(tenantId, mode, config);
}
