/**
 * Experiments API Delegate
 * 
 * Handles HTTP routing and validation for experiment endpoints
 */

import { Router, Request, Response } from 'express';
import * as db from '@services/database';
import * as elo from '@packages/elo';
import * as signals from '@services/signals';
import config from '@utils/config';

const router = Router();

/**
 * Helper function to lookup experiment by ID or key
 */
async function lookupExperiment(experimentId: string, tenantId?: string): Promise<any> {
  if (tenantId) {
    // Validate tenant exists before looking up experiment
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return await db.getExperimentByKey(tenantId, experimentId);
  } else {
    return await db.getExperiment(experimentId);
  }
}

/**
 * GET /api/experiments/:experimentId/pricing
 * Get pricing with variant assignment (tenant-aware)
 */
router.get('/:experimentId/pricing', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const { userId, tenantId } = req.query;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    
    // Lookup experiment (supports both UUID and key)
    let experiment;
    if (tenantId) {
      const tenant = await db.getTenant(tenantId as string);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      experiment = await db.getExperimentByKey(tenantId as string, experimentId);
    } else {
      experiment = await db.getExperiment(experimentId);
    }
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get or create assignment
    let assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      // Assign variant using deterministic algorithm
      const variant = await elo.assignVariant(userId, experimentId);
      assignment = await db.createAssignment(experiment.id, userId, variant);
    }
    
    // Get variant details from experiment
    let variantData = experiment.variants.find((v: any) => v.name === assignment!.variant);
    
    if (!variantData) {
      // Fallback to first variant if not found
      variantData = experiment.variants[0];
    }
    
    // Record view
    await db.recordView(experiment.id, userId, assignment.variant);
    
    // Emit signal to Paid.ai (non-blocking)
    if (tenantId) {
      const tenant = await db.getTenant(tenantId as string);
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
        .catch(error => {
          console.error('Failed to emit pricing view signal:', error.message);
        });
    } else {
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId)
        .catch(error => {
          console.error('Failed to emit pricing view signal:', error.message);
        });
    }
    
    res.json({
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      pricing: {
        plan: variantData.name.charAt(0).toUpperCase() + variantData.name.slice(1),
        price: variantData.price,
        features: ['Feature A', 'Feature B', 'Feature C'] // Customize as needed
      }
    });
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/pricing:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/experiments/:experimentId/convert
 * Record conversion (tenant-aware)
 */
router.post('/:experimentId/convert', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const { userId, tenantId, revenue } = req.body;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Validate revenue if provided
    if (revenue !== undefined && (typeof revenue !== 'number' || revenue < 0 || !isFinite(revenue))) {
      return res.status(400).json({ error: 'Revenue must be a positive number' });
    }
    
    // Lookup experiment
    let experiment;
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      experiment = await db.getExperimentByKey(tenantId, experimentId);
    } else {
      experiment = await db.getExperiment(experimentId);
    }
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get assignment
    const assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'No variant assignment found for this user and experiment' 
      });
    }
    
    // Get variant price if revenue not provided
    const variantData = experiment.variants.find((v: any) => v.name === assignment.variant);
    const conversionRevenue = revenue || variantData?.price || 0;
    
    // Record conversion
    await db.recordConversion(
      experiment.id,
      userId,
      assignment.variant,
      conversionRevenue
    );
    
    // Emit conversion signal to Paid.ai (non-blocking)
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      signals.emitConversionSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
        .catch(error => {
          console.error('Failed to emit conversion signal:', error.message);
        });
    } else {
      signals.emitConversionSignal(userId, assignment.variant, experimentId)
        .catch(error => {
          console.error('Failed to emit conversion signal:', error.message);
        });
    }
    
    res.json({
      success: true,
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      revenue: conversionRevenue
    });
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/convert:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/experiments/:experimentId/definition
 * Get experiment definition and variants
 */
router.get('/:experimentId/definition', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    const { tenantId } = req.query;
    
    const experiment = await lookupExperiment(experimentId, tenantId as string | undefined);
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Return experiment definition with variants
    res.json({
      experimentId: experiment.key,
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      status: experiment.status,
      variants: experiment.variants,
      targetSampleSize: experiment.target_sample_size,
      startDate: experiment.start_date,
      endDate: experiment.end_date,
      metadata: experiment.metadata
    });
  } catch (error: any) {
    // Handle tenant not found error
    if (error.message === 'Tenant not found') {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    console.error('Error in /api/experiments/:experimentId/definition:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/experiments/:experimentId/results
 * Get experiment results
 */
router.get('/:experimentId/results', async (req: Request, res: Response) => {
  try {
    const { experimentId } = req.params;
    
    // Try to lookup experiment (supports both UUID and key with tenant context)
    let experiment = await db.getExperiment(experimentId);
    
    if (!experiment) {
      // Try old format lookup
      const results = await elo.getExperimentResults(experimentId);
      return res.json(results);
    }
    
    // Get results from database
    const results = await db.getExperimentResults(experiment.id);
    
    res.json(results);
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/results:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

export default router;
