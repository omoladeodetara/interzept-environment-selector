/**
 * Analytics API Routes
 * 
 * Advanced metrics, insights, and dashboard data.
 */

import { Router, Request, Response } from 'express';
import {
  getDashboardData,
  getExperimentAnalytics,
  getElasticityAnalysis,
  compareExperiments,
  getExperimentTimeSeries,
} from '../../core/analytics';
import { ValidationError, NotFoundError } from '../../core/types';

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Get dashboard overview data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const dashboard = getDashboardData(tenantId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/experiments/:id
 * Get detailed analytics for a specific experiment
 */
router.get('/experiments/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const analytics = getExperimentAnalytics(id, tenantId);
    res.json(analytics);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting experiment analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/elasticity
 * Get price elasticity analysis for an experiment
 */
router.get('/elasticity', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { experimentId } = req.query;

    if (!experimentId || typeof experimentId !== 'string') {
      throw new ValidationError('experimentId query parameter is required');
    }

    const elasticity = getElasticityAnalysis(experimentId, tenantId);
    res.json(elasticity);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting elasticity analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/analytics/compare
 * Compare multiple experiments
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { experimentIds } = req.body;

    if (!Array.isArray(experimentIds) || experimentIds.length < 2) {
      throw new ValidationError('At least 2 experiment IDs are required');
    }

    const comparison = compareExperiments(experimentIds, tenantId);
    res.json(comparison);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error comparing experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/experiments/:id/timeseries
 * Get time-series data for an experiment
 */
router.get('/experiments/:id/timeseries', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const { granularity } = req.query;

    const timeseries = getExperimentTimeSeries(
      id,
      tenantId,
      granularity as 'hour' | 'day' | 'week' | undefined
    );
    res.json(timeseries);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting experiment timeseries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
