/**
 * Order Lines API Route
 * 
 * Next.js App Router handler for adding line items to orders
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      INSERT INTO order_lines (order_id, description, quantity, unit_price, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, order_id, description, quantity, unit_price, metadata, created_at
    `;

    const result = await db.query(query, [
      orderId,
      description,
      quantity,
      unitPrice,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding order line:', error);
    return NextResponse.json(
      { error: 'Failed to add order line' },
      { status: 500 }
    );
  }
}
