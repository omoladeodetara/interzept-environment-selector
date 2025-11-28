/**
 * Recommendations API Routes
 * 
 * AI-powered pricing recommendations based on experiment data.
 */

import { Router, Request, Response } from 'express';
import {
  generateRecommendation,
  quickAnalysis,
} from '../../core/recommendation-engine';
import { getExperimentResults } from '../../core/experiment-manager';
import { ValidationError, NotFoundError, BusinessGoals } from '../../core/types';

const router = Router();

/**
 * POST /api/recommendations/analyze
 * Analyze current pricing and get recommendations
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { experimentId, currentPrice, businessGoals } = req.body;

    if (experimentId) {
      // Get recommendation based on experiment results
      const results = getExperimentResults(experimentId, tenantId);
      const goals: BusinessGoals = businessGoals || { objective: 'revenue' };
      const recommendation = generateRecommendation(results, goals);
      
      res.json(recommendation);
    } else if (currentPrice !== undefined) {
      // Quick analysis without experiment data
      const proposedPrice = req.body.proposedPrice || currentPrice * 1.1;
      const elasticity = req.body.estimatedElasticity || -1.5;
      
      const analysis = quickAnalysis(currentPrice, proposedPrice, elasticity);
      res.json(analysis);
    } else {
      throw new ValidationError('Either experimentId or currentPrice is required');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error analyzing pricing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/recommendations/:experimentId
 * Get recommendations based on A/B test results
 */
router.get('/:experimentId', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { experimentId } = req.params;
    const { objective, minPrice, maxPrice, targetMargin } = req.query;

    const results = getExperimentResults(experimentId, tenantId);

    const businessGoals: BusinessGoals = {
      objective: (objective as BusinessGoals['objective']) || 'revenue',
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      targetMargin: targetMargin ? parseFloat(targetMargin as string) : undefined,
    };

    const recommendation = generateRecommendation(results, businessGoals);
    res.json(recommendation);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/recommendations/simulate
 * Simulate pricing changes without experiment data
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { currentPrice, newPrice, currentConversions, currentViews, estimatedElasticity } = req.body;

    if (!currentPrice || typeof currentPrice !== 'number') {
      throw new ValidationError('currentPrice is required and must be a number');
    }

    if (!newPrice || typeof newPrice !== 'number') {
      throw new ValidationError('newPrice is required and must be a number');
    }

    const elasticity = estimatedElasticity || -1.5;
    const conversions = currentConversions || 100;
    const views = currentViews || 1000;

    const priceChangePercent = (newPrice - currentPrice) / currentPrice;
    const expectedConversionChange = priceChangePercent * elasticity;
    const expectedNewConversions = conversions * (1 + expectedConversionChange);
    
    const currentRevenue = currentPrice * conversions;
    const expectedNewRevenue = newPrice * expectedNewConversions;
    const revenueChange = ((expectedNewRevenue - currentRevenue) / currentRevenue) * 100;

    const currentConversionRate = views > 0 ? conversions / views : 0;
    const expectedNewConversionRate = currentConversionRate * (1 + expectedConversionChange);

    res.json({
      currentPrice,
      newPrice,
      priceChangePercent: priceChangePercent * 100,
      estimatedElasticity: elasticity,
      simulation: {
        currentRevenue,
        expectedNewRevenue,
        revenueChangePercent: revenueChange,
        currentConversions: conversions,
        expectedNewConversions,
        conversionChangePercent: expectedConversionChange * 100,
        currentConversionRate: currentConversionRate * 100,
        expectedNewConversionRate: expectedNewConversionRate * 100,
      },
      recommendation: revenueChange > 0 ? 'proceed' : 'reconsider',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error simulating pricing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
