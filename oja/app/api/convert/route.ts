/**
 * Legacy Convert API Route
 * 
 * Next.js App Router handler - backward compatibility
 */

import { NextRequest, NextResponse } from 'next/server';
import * as elo from '@packages/elo';
import * as signals from '@services/signals';
import config from '@utils/config';

/**
 * POST /api/convert
 * Legacy conversion endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, experimentId } = await request.json();
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
    }
    
    if (!experimentId || typeof experimentId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing experimentId' }, { status: 400 });
    }
    
    const variant = await elo.getExperimentVariant(userId, experimentId);
    
    if (!variant) {
      return NextResponse.json({ 
        error: 'No variant assignment found for this user and experiment' 
      }, { status: 404 });
    }
    
    const revenue = variant === 'control' ? 29.99 : 39.99;
    
    await elo.trackConversion(userId, experimentId, { 
      revenue,
      timestamp: new Date()
    });
    
    signals.emitConversionSignal(userId, variant, experimentId)
      .catch(error => console.error('Failed to emit conversion signal:', error.message));
    
    return NextResponse.json({
      success: true,
      userId,
      experimentId,
      variant,
      revenue
    });
  } catch (error: any) {
    console.error('Error in /api/convert:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
