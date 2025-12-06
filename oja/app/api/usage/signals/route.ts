/**
 * Usage Signals API Route
 * 
 * Next.js App Router handler for recording usage signals
 */

import { NextRequest, NextResponse } from 'next/server';
import * as signalsService from '@services/signals';

/**
 * POST /api/usage/signals
 * Record a usage signal event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      agentId, 
      customerId, 
      eventType, 
      eventData = {}, 
      quantity = 1,
      metadata = {} 
    } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Record the usage signal
    const signal = await signalsService.recordSignal({
      tenantId,
      agentId: agentId || null,
      customerId: customerId || null,
      eventType,
      eventData,
      quantity,
      metadata,
      timestamp: new Date()
    });

    return NextResponse.json({
      id: signal.id,
      message: 'Usage signal recorded successfully',
      signal
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording usage signal:', error);
    return NextResponse.json(
      { error: 'Failed to record usage signal' },
      { status: 500 }
    );
  }
}
