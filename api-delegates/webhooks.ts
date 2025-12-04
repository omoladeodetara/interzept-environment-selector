/**
 * Webhooks API Delegate
 * 
 * Handles webhook endpoints for external integrations
 */

import { Router, Request, Response } from 'express';
import * as elo from '@packages/elo';
import config from '@utils/config';

const router = Router();

/**
 * POST /webhooks/paid
 * Paid.ai webhook endpoint
 */
router.post('/paid', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Validate event data exists
    if (!event || !event.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Webhook signature verification (if enabled)
    if (config.enableWebhookVerification) {
      if (!config.webhookSecret) {
        console.error('Webhook verification enabled but WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      // TODO: Implement actual signature verification based on Paid.ai's webhook signature scheme
      // SECURITY WARNING: This endpoint should not be exposed to production without proper
      // signature verification implemented. Set ENABLE_WEBHOOK_VERIFICATION=true only after
      // implementing the verification logic below.
      console.error('Webhook signature verification is enabled but not yet implemented');
      return res.status(501).json({ 
        error: 'Webhook signature verification not implemented',
        message: 'Set ENABLE_WEBHOOK_VERIFICATION=false to process webhooks without verification (development only)'
      });
    }
    
    // Log webhook event (development only)
    if (config.nodeEnv === 'development') {
      console.log('Received webhook event:', JSON.stringify(event, null, 2));
    }
    
    // Extract customer and experiment data from webhook
    const customerId = event.data.customer_id || event.data.customerId;
    const experimentId = event.data.metadata?.experiment_id || 'pricing_test_001';
    
    if (!customerId) {
      console.warn('Webhook received without customer_id');
      return res.status(200).send('OK'); // Accept webhook but don't process
    }
    
    // Event-specific validation and processing
    if (event.type === 'subscription.created') {
      const amount = event.data.amount || event.data.plan?.amount;
      
      if (
        !amount ||
        typeof amount !== 'number' ||
        amount <= 0 ||
        !isFinite(amount)
      ) {
        console.warn('Invalid amount in subscription webhook');
        return res.status(200).send('OK');
      }
      
      // Track conversion
      try {
        await elo.trackConversion(
          customerId,
          experimentId,
          {
            revenue: amount,
            timestamp: new Date()
          }
        );
        
        // Get variant for logging purposes only
        const variant = await elo.getExperimentVariant(customerId, experimentId);
        console.log(`Tracked conversion from webhook: user=${customerId}, variant=${variant}, revenue=${amount}`);
      } catch (conversionError: any) {
        console.warn(`Failed to track conversion: ${conversionError.message}`);
      }
    }
    
    // Acknowledge webhook receipt
    res.status(200).send('OK');
  } catch (error: any) {
    // Log error but still acknowledge webhook to prevent retries
    console.error('Error processing webhook:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

export default router;
