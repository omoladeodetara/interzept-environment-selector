import { NextRequest, NextResponse } from 'next/server';
import { sampleAccounts } from '@/lib/sample-data';
import {
  createPaymentRequiredResponse,
  validateTransaction,
} from '@/lib/payment-handler';

/**
 * POST /api/transfer
 * Transfer funds between accounts with HTTP 402 handling
 */
export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
    const { fromAccountId, toAccountId, amount, description } = body;

    // Validate input
    if (!fromAccountId || !toAccountId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount type and value
    if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate description if provided
    if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json(
        { error: 'Invalid description: must be a string with max 500 characters' },
        { status: 400 }
      );
    }

    // Find source account
    const sourceAccount = sampleAccounts.find((acc) => acc.id === fromAccountId);
    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }

    // Check account status
    if (sourceAccount.status === 'suspended') {
      return NextResponse.json(
        createPaymentRequiredResponse(
          sourceAccount.id,
          amount,
          sourceAccount.balance,
          'ACCOUNT_SUSPENDED'
        ),
        { status: 402 }
      );
    }

    // Validate transaction
    const validation = validateTransaction(
      sourceAccount.balance,
      amount,
      sourceAccount.monthlyLimit,
      sourceAccount.usageThisMonth
    );

    if (!validation.valid) {
      // Return HTTP 402 Payment Required
      return NextResponse.json(
        createPaymentRequiredResponse(
          sourceAccount.id,
          amount,
          sourceAccount.balance,
          validation.error!
        ),
        { status: 402 }
      );
    }

    // Find destination account
    const destAccount = sampleAccounts.find((acc) => acc.id === toAccountId);
    if (!destAccount) {
      return NextResponse.json(
        { error: 'Destination account not found' },
        { status: 404 }
      );
    }

    // In a real implementation, this would:
    // 1. Start a database transaction
    // 2. Debit source account
    // 3. Credit destination account
    // 4. Create transaction records
    // 5. Commit or rollback

    // Simulate successful transfer
    return NextResponse.json({
      success: true,
      transactionId: `txn_${Date.now()}`,
      from: fromAccountId,
      to: toAccountId,
      amount,
      description,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transfer error:', {
      error,
      endpoint: '/api/transfer',
      method: request.method,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: body.amount,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
