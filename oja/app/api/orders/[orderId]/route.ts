/**
 * Order Detail API Route
 * 
 * Next.js App Router handler for individual order operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '@services/database';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

/**
 * GET /api/orders/{orderId}
 * Get a specific order
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/{orderId}
 * Update an order
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const body = await request.json();
    const { status, amount, totalAmount, currency, metadata, items } = body;

    const numericAmount = amount ?? totalAmount;

    if (status === undefined && numericAmount === undefined && currency === undefined && metadata === undefined && items === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await updateOrder(orderId, {
      status,
      amount: numericAmount,
      currency,
      metadata,
      items,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
