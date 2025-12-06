/**
 * Credits API Route
 * 
 * Next.js App Router handler for credit bundle management
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/credits
 * List all credit bundles for a tenant
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
      SELECT id, customer_id, amount, balance, currency, expires_at, metadata, created_at, updated_at
      FROM credit_bundles
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
    console.error('Error listing credits:', error);
    return NextResponse.json(
      { error: 'Failed to list credits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/credits
 * Create a new credit bundle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, currency = 'USD', expiresAt, metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount is required and must be a positive number' }, { status: 400 });
    }

    const query = `
      INSERT INTO credit_bundles (tenant_id, customer_id, amount, balance, currency, expires_at, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, customer_id, amount, balance, currency, expires_at, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [
      tenantId,
      customerId,
      amount,
      currency,
      expiresAt || null,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating credit bundle:', error);
    return NextResponse.json(
      { error: 'Failed to create credit bundle' },
      { status: 500 }
    );
  }
}
