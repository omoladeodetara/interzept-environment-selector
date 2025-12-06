/**
 * Credits Balance API Route
 * 
 * Next.js App Router handler for checking customer credit balance
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/credits/balance
 * Check the total available credit balance for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const query = `
      SELECT 
        customer_id,
        SUM(balance) as total_balance,
        currency,
        COUNT(*) as bundle_count
      FROM credit_bundles
      WHERE customer_id = $1 
        AND (expires_at IS NULL OR expires_at > NOW())
        AND balance > 0
      GROUP BY customer_id, currency
    `;

    const result = await db.query(query, [customerId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        customerId,
        balances: [],
        totalBalance: 0
      });
    }

    return NextResponse.json({
      customerId,
      balances: result.rows,
      totalBalance: result.rows.reduce((sum: number, row: any) => sum + parseFloat(row.total_balance), 0)
    });
  } catch (error) {
    console.error('Error checking credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to check credit balance' },
      { status: 500 }
    );
  }
}
