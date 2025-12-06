/**
 * Credit Bundle Detail API Route
 * 
 * Next.js App Router handler for individual credit bundle operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      SELECT id, customer_id, amount, balance, currency, expires_at, metadata, created_at, updated_at
      FROM credit_bundles
      WHERE id = $1
    `;

    const result = await db.query(query, [creditId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Credit bundle not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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

    const query = `
      DELETE FROM credit_bundles
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [creditId]);

    if (result.rows.length === 0) {
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
