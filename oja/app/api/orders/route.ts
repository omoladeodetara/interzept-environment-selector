/**
 * Orders API Route
 * 
 * Next.js App Router handler for order management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrder, listOrders } from '@services/database';

/**
 * GET /api/orders
 * List all orders for a tenant
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

    const orders = await listOrders(tenantId, { limit, offset });

    return NextResponse.json({
      data: orders,
      pagination: {
        limit,
        offset,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { error: 'Failed to list orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, agentId, status = 'pending', amount, totalAmount, currency = 'USD', items, metadata = {}, externalId } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const numericAmount = amount ?? totalAmount;

    if (numericAmount === undefined || typeof numericAmount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const created = await createOrder({
      tenantId,
      customerId,
      agentId,
      amount: numericAmount,
      currency,
      status,
      items,
      externalId,
      metadata,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
