/**
 * Disputes API Route
 * 
 * Next.js App Router handler for dispute management
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/disputes
 * List all disputes for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const query = `
      SELECT id, payment_id, customer_id, amount, currency, status, reason, metadata, created_at, updated_at
      FROM disputes
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [tenantId, limit, offset]);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error listing disputes:', error);
    return NextResponse.json(
      { error: 'Failed to list disputes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/disputes
 * Create a new dispute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, customerId, amount, currency = 'USD', reason, status = 'open', metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const query = `
      INSERT INTO disputes (tenant_id, payment_id, customer_id, amount, currency, status, reason, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, payment_id, customer_id, amount, currency, status, reason, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [
      tenantId,
      paymentId,
      customerId || null,
      amount,
      currency,
      status,
      reason || null,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}
