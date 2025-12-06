/**
 * Disputes API Route
 * 
 * Next.js App Router handler for dispute management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createDispute, listDisputes } from '@services/database';

/**
 * GET /api/disputes
 * List all disputes for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const disputes = await listDisputes(tenantId, { limit, offset });

    return NextResponse.json({
      data: disputes,
      pagination: {
        limit,
        offset,
        total: disputes.length
      }
    });
  } catch (error) {
    console.error('Error listing disputes:', error);
    return NextResponse.json(
      { error: 'Failed to list disputes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/disputes
 * Create a new dispute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, customerId, amount, currency = 'USD', reason, status = 'open', metadata = {}, externalId } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    if (amount === undefined || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const created = await createDispute({
      tenantId,
      paymentId,
      customerId,
      amount,
      currency,
      status,
      reason,
      externalId,
      metadata,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
