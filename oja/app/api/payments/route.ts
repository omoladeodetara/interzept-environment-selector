/**
 * Payments API Route
 * 
 * Next.js App Router handler for payment management
 */

import { NextRequest, NextResponse } from 'next/server';
import { listPayments } from '@services/database';

/**
 * GET /api/payments
 * List all payments for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const payments = await listPayments(tenantId, { limit, offset });

    return NextResponse.json({
      data: payments,
      pagination: {
        limit,
        offset,
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Error listing payments:', error);
    return NextResponse.json(
      { error: 'Failed to list payments' },
      { status: 500 }
    );
  }
}
