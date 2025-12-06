/**
 * Payment Refund API Route
 * 
 * Next.js App Router handler for refunding payments
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

/**
 * POST /api/payments/{paymentId}/refund
 * Refund a payment
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { paymentId } = await context.params;
    const body = await request.json();
    const { amount, reason } = body;

    // Get the payment to check if it exists and can be refunded
    const getQuery = `
      SELECT id, amount as total_amount, currency, status
      FROM payments
      WHERE id = $1
    `;

    const getResult = await db.query(getQuery, [paymentId]);

    if (getResult.rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const payment = getResult.rows[0];

    if (payment.status === 'refunded') {
      return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 });
    }

    const refundAmount = amount || payment.total_amount;

    if (refundAmount > payment.total_amount) {
      return NextResponse.json({ error: 'Refund amount exceeds payment amount' }, { status: 400 });
    }

    // Update payment status
    const updateQuery = `
      UPDATE payments
      SET status = 'refunded', 
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{refund}',
            jsonb_build_object('amount', $2, 'reason', $3, 'refunded_at', NOW())
          ),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, invoice_id, customer_id, amount, currency, status, payment_method, metadata, created_at, updated_at
    `;

    const result = await db.query(updateQuery, [paymentId, refundAmount, reason || 'Refund requested']);

    return NextResponse.json({
      ...result.rows[0],
      message: 'Payment refunded successfully'
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 }
    );
  }
}
