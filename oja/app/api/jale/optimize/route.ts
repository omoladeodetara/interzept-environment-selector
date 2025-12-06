/**
 * Jale Optimize API Route
 * 
 * Next.js App Router handler for Jale pricing optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import * as jale from '../../../../../jale';
import config from '@utils/config';

/**
 * POST /api/jale/optimize
 * Get pricing recommendation from Jale
 */
export async function POST(request: NextRequest) {
  try {
    const { experimentId, objective, candidates, lookbackDays } = await request.json();
    
    if (!experimentId || typeof experimentId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing experimentId' }, { status: 400 });
    }
    
    const result = await jale.recommendPrice({ 
      experimentId, 
      objective, 
      candidates, 
      lookbackDays 
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/jale/optimize:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
