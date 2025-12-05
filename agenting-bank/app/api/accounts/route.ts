import { NextRequest, NextResponse } from 'next/server';
import { sampleAccounts } from '@/lib/sample-data';

const ACCOUNT_LIMITS = {
  standard: 1000,
  premium: 5000,
  enterprise: undefined, // unlimited
} as const;

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

    // Validate agentId format
    if (typeof agentId !== 'string' || agentId.length === 0 || agentId.length > 100 ||
        !/^[a-zA-Z0-9_\-]+$/.test(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agentId: must be a non-empty string (max 100 chars), containing only letters, numbers, underscores, or hyphens.' },
        { status: 400 }
      );
    }

    // Validate agentName format
    if (typeof agentName !== 'string' || agentName.length === 0 || agentName.length > 255) {
      return NextResponse.json(
        { error: 'Invalid agentName: must be a non-empty string (max 255 chars)' },
        { status: 400 }
      );
    }

    if (!['standard', 'premium', 'enterprise'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Validate initialBalance
    if (initialBalance !== undefined && (typeof initialBalance !== 'number' || !isFinite(initialBalance) || initialBalance < 0)) {
      return NextResponse.json(
        { error: 'initialBalance must be a non-negative number' },
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
      status: 'active' as const,
      accountType,
      createdAt: new Date(),
      updatedAt: new Date(),
      monthlyLimit: ACCOUNT_LIMITS[accountType as keyof typeof ACCOUNT_LIMITS],
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
