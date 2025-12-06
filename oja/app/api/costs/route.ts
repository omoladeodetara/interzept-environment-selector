/**
 * Costs API Route
 * 
 * Next.js App Router handler for cost tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosts, recordCost } from '@services/database';

/**
 * GET /api/costs
 * List all costs for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const costs = await getCosts(tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      data: costs,
      pagination: {
        limit,
        offset,
        total: costs.length
      }
    });
  } catch (error) {
    console.error('Error listing costs:', error);
    return NextResponse.json(
      { error: 'Failed to list costs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/costs
 * Record a new cost
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, customerId, orderId, costType, amount, currency = 'USD', quantity, unit, metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const recorded = await recordCost({
      tenantId,
      agentId,
      customerId,
      orderId,
      costType: costType || 'usage',
      amount,
      currency,
      quantity,
      unit,
      metadata,
    });

    return NextResponse.json(recorded, { status: 201 });
  } catch (error) {
    console.error('Error recording cost:', error);
    return NextResponse.json(
      { error: 'Failed to record cost' },
      { status: 500 }
    );
  }
}
