/**
 * Order Detail API Route
 * 
 * Next.js App Router handler for individual order operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      SELECT id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at
      FROM orders
      WHERE id = $1
    `;

    const result = await db.query(query, [orderId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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
    const { status, totalAmount, currency, metadata } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (totalAmount !== undefined) {
      updates.push(`total_amount = $${paramIndex++}`);
      values.push(totalAmount);
    }

    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(orderId);

    const query = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
