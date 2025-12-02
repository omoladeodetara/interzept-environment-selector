/**
 * Legacy API Routes
 * 
 * Provides backward compatibility with old ab-testing-server endpoints
 */

import { Router, Request, Response } from 'express';
import * as elo from '@packages/elo';
import * as signals from '@services/signals';
import config from '@utils/config';

const router = Router();

/**
 * Legacy /api/pricing endpoint (backward compatibility)
 * 
 * This endpoint assigns users to a variant and emits a signal to Paid.ai
 * tracking which pricing they saw.
 */
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    // Get or generate user ID (in production, this would come from authentication)
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || `user_${Date.now()}`;
    const experimentId = (req.query.experimentId as string) || 'pricing_test_001';
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId parameter' 
      });
    }
    
    // Assign user to a variant
    const variant = elo.assignVariant(userId, experimentId);
    
    // Define pricing based on variant
    const pricing = variant === 'control' 
      ? {
          plan: 'Standard',
          price: 29.99,
          features: ['Feature A', 'Feature B', 'Feature C']
        }
      : {
          plan: 'Premium',
          price: 39.99,
          features: ['Feature A', 'Feature B', 'Feature C', 'Feature D']
        };
    
    // Emit signal to Paid.ai (non-blocking)
    signals.emitPricingViewSignal(userId, variant, experimentId)
      .catch(error => {
        console.error('Failed to emit pricing view signal:', error.message);
        // Don't fail the request if signal emission fails
      });
    
    res.json({
      userId,
      experimentId,
      variant,
      pricing
    });
  } catch (error: any) {
    console.error('Error in /api/pricing:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Simulate a conversion (subscription/purchase)
 * Legacy endpoint for backward compatibility
 */
router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { userId, experimentId } = req.body;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing userId' 
      });
    }
    
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    // Get the user's variant
    const variant = elo.getExperimentVariant(userId, experimentId);
    
    if (!variant) {
      return res.status(404).json({ 
        error: 'No variant assignment found for this user and experiment' 
      });
    }
    
    // Simulate revenue (in production, this would come from actual payment)
    const revenue = variant === 'control' ? 29.99 : 39.99;
    
    // Track conversion in A/B testing system
    elo.trackConversion(userId, experimentId, { 
      revenue,
      timestamp: new Date()
    });
    
    // Emit conversion signal to Paid.ai (non-blocking)
    signals.emitConversionSignal(userId, variant, experimentId)
      .catch(error => {
        console.error('Failed to emit conversion signal:', error.message);
        // Don't fail the request if signal emission fails
      });
    
    res.json({
      success: true,
      userId,
      experimentId,
      variant,
      revenue
    });
  } catch (error: any) {
    console.error('Error in /api/convert:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

export default router;
