/**
 * Order Lines API Route
 * 
 * Next.js App Router handler for adding line items to orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '@services/database';

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

/**
 * POST /api/orders/{orderId}/lines
 * Add a line item to an order
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const body = await request.json();
    const { description, quantity = 1, unitPrice, metadata = {} } = body;

    if (!description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    if (!unitPrice || typeof unitPrice !== 'number') {
      return NextResponse.json({ error: 'unitPrice is required and must be a number' }, { status: 400 });
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const newLine = { description, quantity, unitPrice, metadata };
    const currentItems = Array.isArray((order as any).items) ? (order as any).items : [];
    const updatedItems = [...currentItems, newLine];

    const updated = await updateOrder(orderId, { items: updatedItems });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error('Error adding order line:', error);
    return NextResponse.json(
      { error: 'Failed to add order line' },
      { status: 500 }
    );
  }
}
