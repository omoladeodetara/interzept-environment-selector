import { NextRequest, NextResponse } from 'next/server';
import { sampleAccounts } from '@/lib/sample-data';

/**
 * GET /api/accounts
 * List all agent accounts
 */
export async function GET() {
  try {
    return NextResponse.json({
      accounts: sampleAccounts,
      total: sampleAccounts.length,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Create a new agent account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, agentName, accountType, initialBalance = 0 } = body;

    // Validate input
    if (!agentId || !agentName) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, agentName' },
        { status: 400 }
      );
    }

    if (!['standard', 'premium', 'enterprise'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // In a real implementation, this would create the account in the database
    const newAccount = {
      id: `acc_${Date.now()}`,
      agentId,
      agentName,
      balance: initialBalance,
      currency: 'USD',
      status: 'active',
      accountType,
      createdAt: new Date(),
      updatedAt: new Date(),
      monthlyLimit: accountType === 'standard' ? 1000 : accountType === 'premium' ? 5000 : undefined,
      usageThisMonth: 0,
    };

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
