/**
 * Credits API Route
 * 
 * Next.js App Router handler for credit bundle management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCredit, listCredits } from '@services/database';

/**
 * GET /api/credits
 * List all credit bundles for a tenant
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

    const credits = await listCredits(tenantId, { limit, offset });

    return NextResponse.json({
      data: credits,
      pagination: {
        limit,
        offset,
        total: credits.length
      }
    });
  } catch (error) {
    console.error('Error listing credits:', error);
    return NextResponse.json(
      { error: 'Failed to list credits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credits
 * Create a new credit bundle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, currency = 'USD', expiresAt, metadata = {}, externalId, remainingAmount } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount is required and must be a positive number' }, { status: 400 });
    }

    const created = await createCredit({
      tenantId,
      customerId,
      amount,
      remainingAmount,
      currency,
      externalId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating credit bundle:', error);
    return NextResponse.json(
      { error: 'Failed to create credit bundle' },
      { status: 500 }
    );
  }
}
