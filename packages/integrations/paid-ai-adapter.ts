/**
 * Paid.ai Adapter
 *
 * Integration with Paid.ai's Signals API for both BYOK and Managed modes.
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

interface PaidAiConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Paid.ai billing adapter implementation
 */
export class PaidAiAdapter extends BaseBillingAdapter {
  private apiKey: string;
  private baseUrl: string;

  constructor(tenantId: string, mode: TenantMode, config: PaidAiConfig) {
    super(tenantId, mode);

    if (!config.apiKey) {
      throw new ValidationError('Paid.ai API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.paid.ai/v1';
  }

  /**
   * Emit a signal to Paid.ai
   */
  async emitSignal(data: SignalData): Promise<void> {
    this.validateSignalData(data);

    const payload = {
      order_id: data.orderId,
      event_type: 'ab_test',
      properties: {
        experiment_id: data.experimentId,
        variant_id: data.variantId,
        event_type: data.eventType,
        tenant_id: this.tenantId,
        mode: this.mode,
        timestamp: data.timestamp.toISOString(),
        ...data.properties,
      },
    };

    try {
      await axios.post(`${this.baseUrl}/signals`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to emit signal to Paid.ai: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Track a conversion event
   */
  async trackConversion(data: ConversionData): Promise<void> {
    this.validateConversionData(data);

    const payload = {
      order_id: data.orderId,
      event_type: 'conversion',
      properties: {
        experiment_id: data.experimentId,
        variant_id: data.variantId,
        revenue: data.revenue,
        currency: data.currency || 'USD',
        tenant_id: this.tenantId,
        mode: this.mode,
        timestamp: data.timestamp.toISOString(),
        ...data.metadata,
      },
    };

    try {
      await axios.post(`${this.baseUrl}/signals`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to track conversion to Paid.ai: ${message}`);
      }
      throw error;
    }
  }

  /**
   * Get usage metrics from Paid.ai
   */
  async getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics> {
    try {
      const response = await axios.get(`${this.baseUrl}/metrics`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          tenant_id: this.tenantId,
        },
        timeout: 30000,
      });

      const data = response.data;
      return {
        totalSignals: data.total_signals || 0,
        totalConversions: data.total_conversions || 0,
        totalRevenue: data.total_revenue || 0,
        byExperiment: data.by_experiment || {},
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If metrics endpoint doesn't exist, return empty metrics
        if (error.response?.status === 404) {
          return {
            totalSignals: 0,
            totalConversions: 0,
            totalRevenue: 0,
            byExperiment: {},
          };
        }
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to get metrics from Paid.ai: ${message}`);
      }
      throw error;
    }
  }
}

/**
 * Factory function for creating Paid.ai adapters
 */
export function createPaidAiAdapter(
  tenantId: string,
  mode: TenantMode,
  config: PaidAiConfig
): PaidAiAdapter {
  return new PaidAiAdapter(tenantId, mode, config);
}
