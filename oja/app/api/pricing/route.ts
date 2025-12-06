/**
 * Legacy Pricing API Route
 * 
 * Next.js App Router handler - backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import * as elo from '@packages/elo';
import * as signals from '@services/signals';
import config from '@utils/config';

/**
 * GET /api/pricing
 * Legacy pricing endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || `user_${Date.now()}`;
    const experimentId = searchParams.get('experimentId') || 'pricing_test_001';
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid userId parameter' }, { status: 400 });
    }
    
    const variant = await elo.assignVariant(userId, experimentId);
    
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
    
    signals.emitPricingViewSignal(userId, variant, experimentId)
      .catch(error => console.error('Failed to emit pricing view signal:', error.message));
    
    return NextResponse.json({
      userId,
      experimentId,
      variant,
      pricing
    });
  } catch (error: any) {
    console.error('Error in /api/pricing:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
