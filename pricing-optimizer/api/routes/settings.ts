/**
 * Settings API Routes
 * 
 * Configure BYOK vs Managed mode and integration settings.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import {
  getTenant,
  updateTenant,
  switchMode,
} from '../../multi-tenant/tenant-manager';
import {
  storeApiKey,
  getApiKey,
  removeApiKey,
  maskApiKey,
  getEffectiveApiConfig,
} from '../../multi-tenant/key-manager';
import {
  getTenantUsageSummary,
  getTenantUsageTrend,
  isApproachingLimit,
} from '../../multi-tenant/usage-tracker';
import {
  calculateMonthlyBill,
  estimateMonthlyCost,
  getAllPlans,
  recommendPlan,
  canUpgradeTo,
  canDowngradeTo,
} from '../../multi-tenant/billing';
import { ValidationError, NotFoundError } from '../../core/types';

const router = Router();

/**
 * GET /api/settings/integration
 * Get current integration configuration
 */
router.get('/integration', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const tenant = getTenant(tenantId);

    const keyData = getApiKey(tenantId);
    const effectiveConfig = getEffectiveApiConfig(tenantId);

    res.json({
      mode: tenant.mode,
      provider: tenant.defaultProvider,
      webhookUrl: tenant.webhookUrl,
      apiKey: keyData ? maskApiKey(keyData.apiKey) : null,
      baseUrl: keyData?.baseUrl || null,
      effectiveMode: effectiveConfig.mode,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting integration settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/integration
 * Update integration configuration (switch between BYOK and Managed)
 */
router.put('/integration', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { mode, apiKey, baseUrl, provider, webhookUrl } = req.body;

    if (mode === 'byok') {
      if (!apiKey) {
        throw new ValidationError('API key is required for BYOK mode');
      }
      storeApiKey(tenantId, apiKey, baseUrl);
    } else if (mode === 'managed') {
      removeApiKey(tenantId);
    }

    // Update other settings
    const updates: Record<string, unknown> = {};
    if (mode) updates.mode = mode;
    if (provider) updates.defaultProvider = provider;
    if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;

    const tenant = updateTenant(tenantId, updates);

    res.json({
      message: 'Integration settings updated',
      mode: tenant.mode,
      provider: tenant.defaultProvider,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error updating integration settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/settings/validate-key
 * Validate a customer's Paid.ai API key
 */
router.post('/validate-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, baseUrl } = req.body;

    if (!apiKey) {
      throw new ValidationError('API key is required');
    }

    const url = baseUrl || 'https://api.paid.ai/v1';

    try {
      // Try to call the health endpoint with the provided key
      await axios.get(`${url}/health`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      res.json({
        valid: true,
        message: 'API key is valid',
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          res.json({
            valid: false,
            error: 'Invalid API key',
          });
          return;
        }
        if (error.response?.status === 404) {
          // Health endpoint might not exist, try a different approach
          res.json({
            valid: true,
            message: 'API key format appears valid (health endpoint not found)',
          });
          return;
        }
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Unable to validate API key' });
  }
});

/**
 * GET /api/settings/usage
 * Get usage information for the tenant
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { days } = req.query;

    const tenant = getTenant(tenantId);
    const numDays = days ? parseInt(days as string, 10) : 30;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - numDays);

    const usageSummary = getTenantUsageSummary(tenantId, startDate, now);
    const usageTrend = getTenantUsageTrend(tenantId, numDays);
    const limitStatus = isApproachingLimit(tenantId);

    res.json({
      plan: tenant.plan,
      currentUsage: tenant.currentUsage,
      usageLimit: tenant.usageLimit,
      percentUsed: limitStatus.percentUsed,
      approaching: limitStatus.approaching,
      summary: usageSummary,
      trend: usageTrend,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/settings/billing
 * Get billing information for the tenant
 */
router.get('/billing', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const tenant = getTenant(tenantId);

    // Get current billing period (this month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const bill = calculateMonthlyBill(tenantId, periodStart, periodEnd);
    const plans = getAllPlans();

    res.json({
      currentPlan: tenant.plan,
      billingPeriod: bill.billingPeriod,
      currentBill: {
        baseCost: bill.baseCost,
        overageCharges: bill.overageCharges,
        totalAmount: bill.totalAmount,
        lineItems: bill.lineItems,
      },
      availablePlans: plans,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting billing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/settings/billing/estimate
 * Estimate costs for a given usage level
 */
router.post('/billing/estimate', async (req: Request, res: Response) => {
  try {
    const { projectedUsage, plan } = req.body;

    if (typeof projectedUsage !== 'number' || projectedUsage < 0) {
      throw new ValidationError('projectedUsage must be a non-negative number');
    }

    if (plan) {
      const estimate = estimateMonthlyCost(plan, projectedUsage);
      res.json(estimate);
    } else {
      const recommendation = recommendPlan(projectedUsage);
      res.json(recommendation);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error estimating costs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/settings/billing/upgrade
 * Check if upgrade to a plan is allowed
 */
router.post('/billing/upgrade', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { targetPlan } = req.body;

    if (!targetPlan) {
      throw new ValidationError('targetPlan is required');
    }

    const result = canUpgradeTo(tenantId, targetPlan);
    res.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error checking upgrade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/settings/billing/downgrade
 * Check if downgrade to a plan is allowed
 */
router.post('/billing/downgrade', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { targetPlan } = req.body;

    if (!targetPlan) {
      throw new ValidationError('targetPlan is required');
    }

    const result = canDowngradeTo(tenantId, targetPlan);
    res.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error checking downgrade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
