/**
 * Dispute Detail API Route
 * 
 * Next.js App Router handler for individual dispute operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      SELECT id, payment_id, customer_id, amount, currency, status, reason, metadata, created_at, updated_at
      FROM disputes
      WHERE id = $1
    `;

    const result = await db.query(query, [disputeId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (reason !== undefined) {
      updates.push(`reason = $${paramIndex++}`);
      values.push(reason);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(disputeId);

    const query = `
      UPDATE disputes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, payment_id, customer_id, amount, currency, status, reason, metadata, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
