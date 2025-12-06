/**
 * Orders API Route
 * 
 * Next.js App Router handler for order management
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/orders
 * List all orders for a tenant
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
      SELECT id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at
      FROM orders
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
    console.error('Error listing orders:', error);
    return NextResponse.json(
      { error: 'Failed to list orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, agentId, status = 'draft', totalAmount = 0, currency = 'USD', metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const query = `
      INSERT INTO orders (tenant_id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, customer_id, agent_id, status, total_amount, currency, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [
      tenantId,
      customerId,
      agentId || null,
      status,
      totalAmount,
      currency,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
