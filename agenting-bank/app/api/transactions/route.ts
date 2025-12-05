import { NextRequest, NextResponse } from 'next/server';
import { sampleTransactions } from '@/lib/sample-data';

/**
 * GET /api/transactions
 * List all transactions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let transactions = [...sampleTransactions];

    // Filter by account
    if (accountId) {
      transactions = transactions.filter((t) => t.accountId === accountId);
    }

    // Filter by status
    if (status) {
      transactions = transactions.filter((t) => t.status === status);
    }

    // Filter by type
    if (type) {
      transactions = transactions.filter((t) => t.type === type);
    }

    return NextResponse.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
