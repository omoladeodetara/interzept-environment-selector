/**
 * Paid.ai Webhook API Route
 * 
 * Next.js App Router handler for Paid.ai webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import * as elo from '@packages/elo';
import config from '@utils/config';

/**
 * POST /api/webhooks/paid
 * Handle Paid.ai webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    if (!event || !event.data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }
    
    // Webhook signature verification
    if (config.enableWebhookVerification) {
      if (!config.webhookSecret) {
        console.error('Webhook verification enabled but WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      
      console.error('Webhook signature verification is enabled but not yet implemented');
      return NextResponse.json({ 
        error: 'Webhook signature verification not implemented',
        message: 'Set ENABLE_WEBHOOK_VERIFICATION=false to process webhooks without verification (development only)'
      }, { status: 501 });
    }
    
    if (config.nodeEnv === 'development') {
      console.log('Received webhook event:', JSON.stringify(event, null, 2));
    }
    
    const customerId = event.data.customer_id || event.data.customerId;
    const experimentId = event.data.metadata?.experiment_id || 'pricing_test_001';
    
    if (!customerId) {
      console.warn('Webhook received without customer_id');
      return new NextResponse('OK', { status: 200 });
    }
    
    if (event.type === 'subscription.created') {
      const amount = event.data.amount || event.data.plan?.amount;
      
      if (!amount || typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
        console.warn('Invalid amount in subscription webhook');
        return new NextResponse('OK', { status: 200 });
      }
      
      try {
        await elo.trackConversion(customerId, experimentId, {
          revenue: amount,
          timestamp: new Date()
        });
        
        const variant = await elo.getExperimentVariant(customerId, experimentId);
        console.log(`Tracked conversion from webhook: user=${customerId}, variant=${variant}, revenue=${amount}`);
      } catch (conversionError: any) {
        console.warn(`Failed to track conversion: ${conversionError.message}`);
      }
    }
    
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
