/**
 * API Client for Last Price Backend (Elo)
 * 
 * This client provides typed methods to interact with the ab-testing-server backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paid_api_key: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface CreateTenantRequest {
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paidApiKey?: string;
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface Variant {
  name: string;
  price: number;
  weight: number;
}

export interface Experiment {
  id: string;
  tenant_id: string;
  key: string;
  name: string;
  description: string | null;
  variants: Variant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  target_sample_size: number | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface CreateExperimentRequest {
  key: string;
  name: string;
  description?: string;
  variants: Variant[];
  status?: 'draft' | 'active';
}

export interface PricingResponse {
  userId: string;
  experimentId: string;
  variant: string;
  pricing: {
    plan: string;
    price: number;
    features: string[];
  };
}

export interface ConversionRequest {
  userId: string;
  tenantId?: string;
  revenue?: number;
}

export interface ConversionResponse {
  success: boolean;
  userId: string;
  experimentId: string;
  variant: string;
  revenue: number;
}

export interface ExperimentResults {
  experimentId: string;
  control?: {
    views: number;
    conversions: number;
    revenue: string;
    conversionRate: string;
    arpu: string;
  };
  experiment?: {
    views: number;
    conversions: number;
    revenue: string;
    conversionRate: string;
    arpu: string;
  };
}

export interface OptimizeRequest {
  experimentId: string;
  objective?: 'revenue' | 'conversion' | 'profit';
  candidates?: number[];
  lookbackDays?: number;
}

export interface OptimizeResponse {
  recommendedPrice: number;
  expectedRevenue: number;
  confidence: number;
  simulation: Array<{
    price: number;
    estimatedCv: number;
    expectedRevenue: number;
  }>;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // TENANT OPERATIONS
  // ============================================================================

  async listTenants(): Promise<{ tenants: Tenant[]; pagination: Pagination }> {
    const response = await fetch(`${this.baseUrl}/api/tenants`);
    if (!response.ok) {
      throw new Error(`Failed to list tenants: ${response.statusText}`);
    }
    return response.json();
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const response = await fetch(`${this.baseUrl}/api/tenants/${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to get tenant: ${response.statusText}`);
    }
    return response.json();
  }

  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await fetch(`${this.baseUrl}/api/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to create tenant');
    }
    return response.json();
  }

  // ============================================================================
  // EXPERIMENT OPERATIONS
  // ============================================================================

  async listExperiments(tenantId: string): Promise<Experiment[]> {
    const response = await fetch(`${this.baseUrl}/api/tenants/${tenantId}/experiments`);
    if (!response.ok) {
      throw new Error(`Failed to list experiments: ${response.statusText}`);
    }
    const data = await response.json();
    return data.experiments || [];
  }

  async createExperiment(tenantId: string, data: CreateExperimentRequest): Promise<Experiment> {
    const response = await fetch(`${this.baseUrl}/api/tenants/${tenantId}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to create experiment');
    }
    return response.json();
  }

  async getPricing(experimentId: string, userId: string, tenantId?: string): Promise<PricingResponse> {
    const params = new URLSearchParams({ userId });
    if (tenantId) {
      params.append('tenantId', tenantId);
    }
    const response = await fetch(`${this.baseUrl}/api/experiments/${experimentId}/pricing?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to get pricing: ${response.statusText}`);
    }
    return response.json();
  }

  async recordConversion(experimentId: string, data: ConversionRequest): Promise<ConversionResponse> {
    const response = await fetch(`${this.baseUrl}/api/experiments/${experimentId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to record conversion: ${response.statusText}`);
    }
    return response.json();
  }

  async getExperimentResults(experimentId: string, tenantId?: string): Promise<ExperimentResults> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await fetch(`${this.baseUrl}/api/experiments/${experimentId}/results${params}`);
    if (!response.ok) {
      throw new Error(`Failed to get experiment results: ${response.statusText}`);
    }
    return response.json();
  }

  // ============================================================================
  // JALE OPTIMIZATION
  // ============================================================================

  async optimize(data: OptimizeRequest): Promise<OptimizeResponse> {
    const response = await fetch(`${this.baseUrl}/api/jale/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to optimize');
    }
    return response.json();
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async health(): Promise<{ status: string; timestamp: string; database: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Also export the class for testing
export default ApiClient;
