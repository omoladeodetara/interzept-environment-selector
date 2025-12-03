/**
 * Tenant API Delegate
 * 
 * Handles HTTP routing and validation for tenant management endpoints
 */

import { Router, Request, Response } from 'express';
import * as db from '@services/database';
import config from '@utils/config';

const router = Router();

/**
 * Mask API key for display
 * Shows only prefix (e.g., 'sk_') and last 4 characters for security
 */
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***';
  }
  // Extract common prefix pattern (e.g., 'sk_live_', 'sk_test_')
  const prefixMatch = apiKey.match(/^(sk_[a-zA-Z0-9]*_?)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  return prefix + '***...' + apiKey.slice(-4);
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * POST /api/tenants
 * Create a new tenant
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, mode, paidApiKey, plan = 'free', metadata = {} } = req.body;
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    
    if (!email || typeof email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    if (!mode || !['managed', 'byok'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be either "managed" or "byok"' });
    }
    
    // For BYOK mode, API key is required
    if (mode === 'byok' && (!paidApiKey || typeof paidApiKey !== 'string')) {
      return res.status(400).json({ error: 'paidApiKey is required for BYOK mode' });
    }
    
    // Validate plan if provided
    if (plan && !['free', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be one of: free, starter, pro, enterprise' });
    }
    
    const tenant = await db.createTenant({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mode,
      paidApiKey: mode === 'byok' ? paidApiKey : null,
      plan,
      metadata
    });
    
    // Mask the API key in response
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    res.status(201).json(tenant);
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to create tenant'
    });
  }
});

/**
 * GET /api/tenants
 * List all tenants (with optional filters)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { mode, plan, limit = '20', offset = '0' } = req.query;
    
    // Validate query parameters
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({ error: 'Offset must be a non-negative number' });
    }
    
    if (mode && !['managed', 'byok'].includes(mode as string)) {
      return res.status(400).json({ error: 'Mode must be either "managed" or "byok"' });
    }
    
    if (plan && !['free', 'starter', 'pro', 'enterprise'].includes(plan as string)) {
      return res.status(400).json({ error: 'Plan must be one of: free, starter, pro, enterprise' });
    }
    
    const result = await db.listTenants({
      mode: mode as string | undefined,
      plan: plan as string | undefined,
      limit: limitNum,
      offset: offsetNum
    });
    
    // Mask API keys in all tenants
    result.tenants = result.tenants.map(tenant => ({
      ...tenant,
      paid_api_key: tenant.paid_api_key ? maskApiKey(tenant.paid_api_key) : null
    }));
    
    res.json(result);
  } catch (error: any) {
    console.error('Error listing tenants:', error);
    res.status(500).json({ 
      error: 'Failed to list tenants',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/tenants/:tenantId
 * Get a specific tenant
 */
router.get('/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    // Validate UUID format
    if (!isValidUUID(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID format' });
    }
    
    const tenant = await db.getTenant(tenantId);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Mask API key
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    res.json(tenant);
  } catch (error: any) {
    console.error('Error getting tenant:', error);
    res.status(500).json({ 
      error: 'Failed to get tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/tenants/:tenantId
 * Update a tenant
 */
router.patch('/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;
    
    // Validate UUID format
    if (!isValidUUID(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID format' });
    }
    
    // Validate fields if provided
    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    
    if (updates.mode !== undefined && !['managed', 'byok'].includes(updates.mode)) {
      return res.status(400).json({ error: 'Mode must be either "managed" or "byok"' });
    }
    
    if (updates.plan !== undefined && !['free', 'starter', 'pro', 'enterprise'].includes(updates.plan)) {
      return res.status(400).json({ error: 'Plan must be one of: free, starter, pro, enterprise' });
    }
    
    // Sanitize updates
    const sanitizedUpdates: any = {};
    if (updates.name) sanitizedUpdates.name = updates.name.trim();
    if (updates.mode) sanitizedUpdates.mode = updates.mode;
    if (updates.plan) sanitizedUpdates.plan = updates.plan;
    if (updates.metadata) sanitizedUpdates.metadata = updates.metadata;
    if (updates.paidApiKey) {
      sanitizedUpdates.paid_api_key = updates.paidApiKey;
    }
    
    const tenant = await db.updateTenant(tenantId, sanitizedUpdates);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Mask API key
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    res.json(tenant);
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ 
      error: 'Failed to update tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/tenants/:tenantId
 * Delete a tenant
 */
router.delete('/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    // Validate UUID format
    if (!isValidUUID(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID format' });
    }
    
    const deleted = await db.deleteTenant(tenantId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ 
      error: 'Failed to delete tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/tenants/:tenantId/experiments
 * Create an experiment for a tenant
 */
router.post('/:tenantId/experiments', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { key, name, description, variants, targetSampleSize } = req.body;
    
    // Validate UUID format
    if (!isValidUUID(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID format' });
    }
    
    // Validate tenant exists
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Validate required fields
    if (!key || typeof key !== 'string' || !/^[a-z0-9_]+$/.test(key)) {
      return res.status(400).json({ error: 'Key is required and must contain only lowercase letters, numbers, and underscores' });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }
    
    if (!Array.isArray(variants) || variants.length < 2) {
      return res.status(400).json({ error: 'At least 2 variants are required' });
    }
    
    // Validate each variant
    for (const variant of variants) {
      if (!variant.name || typeof variant.name !== 'string') {
        return res.status(400).json({ error: 'Each variant must have a name' });
      }
      if (variant.price === undefined || typeof variant.price !== 'number' || variant.price < 0) {
        return res.status(400).json({ error: 'Each variant must have a non-negative price' });
      }
    }
    
    const experiment = await db.createExperiment({
      tenantId,
      key: key.toLowerCase(),
      name: name.trim(),
      description: description || null,
      variants,
      targetSampleSize: targetSampleSize || null
    });
    
    res.status(201).json(experiment);
  } catch (error: any) {
    console.error('Error creating experiment:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Failed to create experiment',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/tenants/:tenantId/experiments
 * List experiments for a tenant
 */
router.get('/:tenantId/experiments', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.query;
    
    // Validate UUID format
    if (!isValidUUID(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant ID format' });
    }
    
    // Validate tenant exists
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Validate status if provided
    if (status && !['draft', 'active', 'paused', 'completed'].includes(status as string)) {
      return res.status(400).json({ error: 'Status must be one of: draft, active, paused, completed' });
    }
    
    const experiments = await db.listExperiments(tenantId, { status: status as string | undefined });
    
    res.json({ experiments });
  } catch (error: any) {
    console.error('Error listing experiments:', error);
    res.status(500).json({ 
      error: 'Failed to list experiments',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

export default router;
