/**
 * Order Activation API Route
 * 
 * Next.js App Router handler for activating orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '@services/database';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

/**
 * POST /api/orders/{orderId}/activate
 * Activate an order (change status from draft to active)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await updateOrder(orderId, { status: 'processing' });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error activating order:', error);
    return NextResponse.json(
      { error: 'Failed to activate order' },
      { status: 500 }
    );
  }
}
