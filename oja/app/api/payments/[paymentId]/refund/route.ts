/**
 * Payment Refund API Route
 * 
 * Next.js App Router handler for refunding payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayment, updatePayment } from '@services/database';

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
    const payment = await getPayment(paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'refunded') {
      return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 });
    }

    const refundAmount = amount ?? (payment as any).amount;

    if (refundAmount > (payment as any).amount) {
      return NextResponse.json({ error: 'Refund amount exceeds payment amount' }, { status: 400 });
    }

    const updatedMetadata = {
      ...(payment as any).metadata,
      refund: {
        amount: refundAmount,
        reason: reason || 'Refund requested',
        refunded_at: new Date().toISOString(),
      },
    };

    const updated = await updatePayment(paymentId, {
      status: 'refunded',
      refunded_amount: refundAmount,
      metadata: updatedMetadata,
    });

    return NextResponse.json({
      ...updated,
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
