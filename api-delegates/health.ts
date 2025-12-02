/**
 * Health API Delegate
 * 
 * Handles health check and debug endpoints
 */

import { Router, Request, Response } from 'express';
import * as db from '@services/database';
import * as elo from '@packages/elo';
import config from '@utils/config';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  // Test database connection
  const dbHealthy = await db.testConnection().catch(() => false);
  
  res.json({ 
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

/**
 * GET /api/debug/assignments
 * Get all experiment assignments (for debugging/testing)
 */
router.get('/debug/assignments', (req: Request, res: Response) => {
  if (config.nodeEnv !== 'development') {
    return res.status(403).json({ 
      error: 'This endpoint is only available in development mode' 
    });
  }
  
  const assignments = elo.getAllAssignments();
  res.json({ 
    count: assignments.length,
    assignments 
  });
});

export default router;
