/**
 * Credit Bundle Detail API Route
 * 
 * Next.js App Router handler for individual credit bundle operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteCredit, getCredit } from '@services/database';

type RouteContext = {
  params: Promise<{ creditId: string }>;
};

/**
 * GET /api/credits/{creditId}
 * Get a specific credit bundle
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { creditId } = await context.params;

    const credit = await getCredit(creditId);

    if (!credit) {
      return NextResponse.json({ error: 'Credit bundle not found' }, { status: 404 });
    }

    return NextResponse.json(credit);
  } catch (error) {
    console.error('Error getting credit bundle:', error);
    return NextResponse.json(
      { error: 'Failed to get credit bundle' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/credits/{creditId}
 * Delete a credit bundle
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { creditId } = await context.params;

    const deleted = await deleteCredit(creditId);

    if (!deleted) {
      return NextResponse.json({ error: 'Credit bundle not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Credit bundle deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit bundle:', error);
    return NextResponse.json(
      { error: 'Failed to delete credit bundle' },
      { status: 500 }
    );
  }
}
