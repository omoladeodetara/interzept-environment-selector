/**
 * Last Price API Client - Shared across all demo apps
 * 
 * This client handles communication with the Last Price platform for:
 * - Variant assignment (A/B testing)
 * - Conversion tracking
 * - Price fetching
 */

const LASTPRICE_API_URL = process.env.NEXT_PUBLIC_LASTPRICE_API_URL || 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_LASTPRICE_TENANT_ID || '';

export interface Variant {
  name: string;
  price: number;
  weight: number;
}

export interface AssignmentResult {
  userId: string;
  experimentId: string;
  variant: string;
  price: number;
  assignedAt: string;
}

export interface ConversionData {
  revenue?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface ExperimentConfig {
  id: string;
  key: string;
  name: string;
  variants: Variant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
}

class LastPriceClient {
  private baseUrl: string;
  private tenantId: string;

  constructor(baseUrl?: string, tenantId?: string) {
    this.baseUrl = baseUrl || LASTPRICE_API_URL;
    this.tenantId = tenantId || TENANT_ID;
  }

  /**
   * Assign a user to an experiment variant
   * Call this when a user views a pricing page
   */
  async assignVariant(
    userId: string,
    experimentId: string
  ): Promise<AssignmentResult> {
    const response = await fetch(
      `${this.baseUrl}/api/experiments/${experimentId}/assign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign variant: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Track a conversion event
   * Call this when a user completes a purchase
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    data?: ConversionData
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/experiments/${experimentId}/convert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
        },
        body: JSON.stringify({
          userId,
          revenue: data?.revenue,
          currency: data?.currency || 'USD',
          metadata: data?.metadata,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track conversion: ${response.statusText}`);
    }
  }

  /**
   * Track a page view event
   * Call this when a user views a pricing page (for analytics)
   */
  async trackView(userId: string, experimentId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/experiments/${experimentId}/view`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId,
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to track view: ${response.statusText}`);
    }
  }

  /**
   * Get experiment configuration
   * Useful for displaying experiment details in developer tools
   */
  async getExperiment(experimentId: string): Promise<ExperimentConfig> {
    const response = await fetch(
      `${this.baseUrl}/api/experiments/${experimentId}`,
      {
        headers: {
          'X-Tenant-ID': this.tenantId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get experiment: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get price for a user in an experiment
   * Combines assignment + price lookup in one call
   */
  async getPrice(userId: string, experimentId: string): Promise<number> {
    const assignment = await this.assignVariant(userId, experimentId);
    return assignment.price;
  }
}

// Singleton instance for easy imports
export const lastPriceClient = new LastPriceClient();

// Export class for custom configurations
export { LastPriceClient };

// React hook for client-side usage
export function useLastPrice() {
  return lastPriceClient;
}
