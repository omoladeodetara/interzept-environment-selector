/**
 * Experiments API Routes
 * 
 * CRUD operations for pricing experiments.
 */

import { Router, Request, Response } from 'express';
import {
  createExperiment,
  getExperiment,
  listExperiments,
  updateExperiment,
  addVariant,
  activateExperiment,
  stopExperiment,
  deleteExperiment,
  getExperimentResults,
} from '../../core/experiment-manager';
import { ValidationError, NotFoundError } from '../../core/types';

const router = Router();

/**
 * POST /api/experiments
 * Create a new pricing experiment
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { name, description, variants } = req.body;

    const experiment = createExperiment(tenantId, {
      name,
      description,
      variants,
    });

    res.status(201).json(experiment);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error creating experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/experiments
 * List all experiments for the tenant
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { status, limit, offset } = req.query;

    const result = listExperiments(tenantId, {
      status: status as 'draft' | 'active' | 'paused' | 'completed' | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error listing experiments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/experiments/:id
 * Get experiment details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const experiment = getExperiment(id, tenantId);
    res.json(experiment);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/experiments/:id
 * Update experiment
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const { name, description, status } = req.body;

    const experiment = updateExperiment(id, tenantId, {
      name,
      description,
      status,
    });

    res.json(experiment);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error updating experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/experiments/:id
 * Delete experiment
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    deleteExperiment(id, tenantId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error deleting experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/experiments/:id/variants
 * Add a pricing variant to an experiment
 */
router.post('/:id/variants', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;
    const { name, price, weight } = req.body;

    const variant = addVariant(id, tenantId, { name, price, weight });
    res.status(201).json(variant);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error adding variant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/experiments/:id/activate
 * Activate an experiment
 */
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const experiment = activateExperiment(id, tenantId);
    res.json(experiment);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error activating experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/experiments/:id/stop
 * Stop an experiment
 */
router.post('/:id/stop', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const experiment = stopExperiment(id, tenantId);
    res.json(experiment);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error stopping experiment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/experiments/:id/results
 * Get experiment results
 */
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { id } = req.params;

    const results = getExperimentResults(id, tenantId);
    res.json(results);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error getting experiment results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
