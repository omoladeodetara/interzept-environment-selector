/**
 * Payment Detail API Route
 * 
 * Next.js App Router handler for individual payment operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayment } from '@services/database';

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

    const payment = await getPayment(paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    return NextResponse.json(
      { error: 'Failed to get payment' },
      { status: 500 }
    );
  }
}
