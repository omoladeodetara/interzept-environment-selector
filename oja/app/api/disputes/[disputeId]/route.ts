/**
 * Dispute Detail API Route
 * 
 * Next.js App Router handler for individual dispute operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDispute, updateDispute } from '@services/database';

type RouteContext = {
  params: Promise<{ disputeId: string }>;
};

/**
 * GET /api/disputes/{disputeId}
 * Get a specific dispute
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { disputeId } = await context.params;

    const dispute = await getDispute(disputeId);

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json(dispute);
  } catch (error) {
    console.error('Error getting dispute:', error);
    return NextResponse.json(
      { error: 'Failed to get dispute' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/disputes/{disputeId}
 * Update a dispute
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { disputeId } = await context.params;
    const body = await request.json();
    const { status, reason, metadata } = body;

    if (status === undefined && reason === undefined && metadata === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await updateDispute(disputeId, {
      status,
      reason,
      metadata,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
