/**
 * Pricing Optimizer Client
 * 
 * Main entry point for the pricing optimizer SDK.
 * Provides a unified interface for both BYOK and Managed modes.
 */

import {
  TenantMode,
  ProviderType,
  Experiment,
  ExperimentVariant,
  ExperimentResults,
  PricingRecommendation,
  BusinessGoals,
  BillingAdapter,
} from './core/types';
import {
  createExperiment,
  getExperiment,
  listExperiments,
  activateExperiment,
  stopExperiment,
  assignVariant,
  recordView,
  recordConversion,
  getExperimentResults,
} from './core/experiment-manager';
import { generateRecommendation } from './core/recommendation-engine';
import { createPaidAiAdapter } from './integrations/paid-ai-adapter';
import { createStripeAdapter } from './integrations/stripe-adapter';
import { createManualAdapter } from './integrations/manual-adapter';
import { createTenant, getTenant } from './multi-tenant/tenant-manager';
import { trackTenantUsage } from './multi-tenant/usage-tracker';

export interface PricingOptimizerConfig {
  tenantId?: string;
  tenantName?: string;
  mode: TenantMode;
  apiKey?: string;
  provider?: {
    type: ProviderType;
    apiKey?: string;
    baseUrl?: string;
    secretKey?: string;
  };
}

export class PricingOptimizer {
  private tenantId: string;
  private mode: TenantMode;
  private adapter: BillingAdapter;

  constructor(config: PricingOptimizerConfig) {
    // Create or get tenant
    if (config.tenantId) {
      this.tenantId = config.tenantId;
      // Verify tenant exists
      getTenant(this.tenantId);
    } else {
      // Require tenantName for new tenants to ensure identifiable names
      if (!config.tenantName) {
        throw new Error(
          'tenantName is required when creating a new tenant. ' +
          'Provide a descriptive name (e.g., company name, project name) for easier identification in logs and dashboards.'
        );
      }
      
      const tenant = createTenant(config.tenantName, {
        mode: config.mode,
        defaultProvider: config.provider?.type || 'paid-ai',
      });
      this.tenantId = tenant.id;
    }

    this.mode = config.mode;

    // Create appropriate adapter
    this.adapter = this.createAdapter(config);
  }

  private createAdapter(config: PricingOptimizerConfig): BillingAdapter {
    const providerType = config.provider?.type || 'paid-ai';

    switch (providerType) {
      case 'paid-ai':
        if (config.mode === 'byok') {
          if (!config.provider?.apiKey) {
            throw new Error('API key is required for BYOK mode with Paid.ai');
          }
          return createPaidAiAdapter(this.tenantId, 'byok', {
            apiKey: config.provider.apiKey,
            baseUrl: config.provider.baseUrl,
          });
        } else {
          const platformKey = process.env.PAID_API_KEY;
          if (!platformKey) {
            throw new Error('PAID_API_KEY environment variable is required for managed mode');
          }
          return createPaidAiAdapter(this.tenantId, 'managed', {
            apiKey: platformKey,
            baseUrl: process.env.PAID_API_BASE_URL,
          });
        }

      case 'stripe':
        const stripeKey = config.mode === 'byok'
          ? config.provider?.secretKey
          : process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          throw new Error('Stripe secret key is required');
        }
        return createStripeAdapter(this.tenantId, config.mode, { secretKey: stripeKey });

      case 'manual':
        return createManualAdapter(this.tenantId, config.mode);

      default:
        return createManualAdapter(this.tenantId, config.mode);
    }
  }

  /**
   * Create a new pricing experiment
   */
  async createExperiment(options: {
    name: string;
    description?: string;
    variants: Array<{ name: string; price: number; weight?: number }>;
  }): Promise<Experiment> {
    await trackTenantUsage(this.tenantId, 'api_call', { action: 'createExperiment' });
    
    return createExperiment(this.tenantId, {
      name: options.name,
      description: options.description,
      variants: options.variants,
    });
  }

  /**
   * Get experiment by ID
   */
  async getExperiment(experimentId: string): Promise<Experiment> {
    return getExperiment(experimentId, this.tenantId);
  }

  /**
   * List all experiments
   */
  async listExperiments(options?: {
    status?: 'draft' | 'active' | 'paused' | 'completed';
    limit?: number;
    offset?: number;
  }): Promise<{ experiments: Experiment[]; total: number }> {
    return listExperiments(this.tenantId, options);
  }

  /**
   * Start an experiment
   */
  async startExperiment(experimentId: string): Promise<Experiment> {
    await trackTenantUsage(this.tenantId, 'api_call', { action: 'startExperiment' });
    return activateExperiment(experimentId, this.tenantId);
  }

  /**
   * Stop an experiment
   */
  async stopExperiment(experimentId: string): Promise<Experiment> {
    return stopExperiment(experimentId, this.tenantId);
  }

  /**
   * Assign a user to a variant and track the view
   */
  async assignVariant(
    experimentId: string,
    userId: string
  ): Promise<ExperimentVariant | null> {
    const variant = assignVariant(experimentId, userId);
    
    if (variant) {
      // Record the view
      recordView(experimentId, variant.id);
      
      // Emit signal
      await this.adapter.emitSignal({
        orderId: userId,
        experimentId,
        variantId: variant.id,
        eventType: 'view',
        timestamp: new Date(),
      });

      await trackTenantUsage(this.tenantId, 'signal', { 
        action: 'view',
        experimentId,
        variantId: variant.id,
      });
    }

    return variant;
  }

  /**
   * Track a conversion
   */
  async trackConversion(
    experimentId: string,
    userId: string,
    variantId: string,
    revenue: number
  ): Promise<void> {
    // Record in local metrics
    recordConversion(experimentId, variantId, revenue);

    // Send to external adapter
    await this.adapter.trackConversion({
      orderId: userId,
      experimentId,
      variantId,
      revenue,
      timestamp: new Date(),
    });

    await trackTenantUsage(this.tenantId, 'signal', {
      action: 'conversion',
      experimentId,
      variantId,
      revenue,
    });
  }

  /**
   * Get experiment results
   */
  async getResults(experimentId: string): Promise<ExperimentResults> {
    return getExperimentResults(experimentId, this.tenantId);
  }

  /**
   * Get pricing recommendation based on experiment results
   */
  async getRecommendation(
    experimentId: string,
    businessGoals?: BusinessGoals
  ): Promise<PricingRecommendation> {
    const results = await this.getResults(experimentId);
    return generateRecommendation(results, businessGoals || { objective: 'revenue' });
  }

  /**
   * Get tenant ID
   */
  getTenantId(): string {
    return this.tenantId;
  }

  /**
   * Get current mode
   */
  getMode(): TenantMode {
    return this.mode;
  }
}

// Export everything
export * from './core';
export * from './integrations';
export * from './multi-tenant';
