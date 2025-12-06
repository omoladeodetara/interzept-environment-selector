/**
 * Order Activation API Route
 * 
 * Next.js App Router handler for activating orders
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      UPDATE orders
      SET status = 'active', updated_at = NOW()
      WHERE id = $1 AND status = 'draft'
      RETURNING id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [orderId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found or already activated' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error activating order:', error);
    return NextResponse.json(
      { error: 'Failed to activate order' },
      { status: 500 }
    );
  }
}
