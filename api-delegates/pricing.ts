/**
 * Pricing API Delegate
 * 
 * Handles pricing-related endpoints including Jale integration
 */

import { Router, Request, Response } from 'express';
import * as db from '@services/database';
import * as jale from '@packages/jale';
import config from '@utils/config';

const router = Router();

/**
 * POST /api/jale/optimize
 * Get pricing recommendation from Jale optimization service
 */
router.post('/jale/optimize', async (req: Request, res: Response) => {
  try {
    const { experimentId, objective, candidates, lookbackDays } = req.body;
    
    // Validate required experimentId
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    // Call jale recommendation service
    const result = await jale.recommendPrice({ 
      experimentId, 
      objective, 
      candidates, 
      lookbackDays 
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/jale/optimize:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/jale/propose-variant
 * Propose a new variant for an experiment
 */
router.post('/jale/propose-variant', async (req: Request, res: Response) => {
  try {
    const { experimentId, tenantId, price, label, metadata } = req.body;
    
    // Validate required fields
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ 
        error: 'Invalid or missing price (must be a positive number)' 
      });
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
    
    // Generate variant label if not provided, ensuring uniqueness
    let variantLabel = label;
    if (!variantLabel) {
      // Find next available variant number that doesn't conflict with existing names
      const existingNames = new Set(experiment.variants.map((v: any) => v.name));
      let counter = experiment.variants.length + 1;
      do {
        variantLabel = `variant_${counter}`;
        counter++;
      } while (existingNames.has(variantLabel));
    }
    
    // Create new variant object
    const newVariant = {
      name: variantLabel,
      price,
      weight: 0.0, // New variants start with 0 weight until activated
      metadata: metadata || {}
    };
    
    // Add to experiment variants
    const updatedVariants = [...experiment.variants, newVariant];
    
    // Update experiment in database
    const updatedExperiment = await db.updateExperiment(experiment.id, {
      variants: updatedVariants
    });
    
    res.json({
      success: true,
      experimentId: experiment.key,
      variant: newVariant,
      message: `Variant '${variantLabel}' proposed successfully`,
      experiment: {
        id: updatedExperiment!.id,
        key: updatedExperiment!.key,
        variants: updatedExperiment!.variants
      }
    });
  } catch (error: any) {
    console.error('Error in /api/jale/propose-variant:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

export default router;
