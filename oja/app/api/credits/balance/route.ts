/**
 * Credits Balance API Route
 * 
 * Next.js App Router handler for checking customer credit balance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCreditBalance } from '@services/database';

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

    const balance = await getCreditBalance(customerId);

    return NextResponse.json({
      customerId,
      balance: balance.balance,
    });
  } catch (error) {
    console.error('Error checking credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to check credit balance' },
      { status: 500 }
    );
  }
}
