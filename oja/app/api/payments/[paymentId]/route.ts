/**
 * Payment Detail API Route
 * 
 * Next.js App Router handler for individual payment operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

/**
 * GET /api/payments/{paymentId}
 * Get a specific payment
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { paymentId } = await context.params;

    const query = `
      SELECT id, invoice_id, customer_id, amount, currency, status, payment_method, metadata, created_at, updated_at
      FROM payments
      WHERE id = $1
    `;

    const result = await db.query(query, [paymentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting payment:', error);
    return NextResponse.json(
      { error: 'Failed to get payment' },
      { status: 500 }
    );
  }
}
