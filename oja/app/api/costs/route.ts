/**
 * Costs API Route
 * 
 * Next.js App Router handler for cost tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/costs
 * List all costs for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    let query = `
      SELECT id, agent_id, customer_id, cost_type, amount, currency, metadata, created_at
      FROM costs
      WHERE tenant_id = $1
    `;

    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error listing costs:', error);
    return NextResponse.json(
      { error: 'Failed to list costs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/costs
 * Record a new cost
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, customerId, costType, amount, currency = 'USD', metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const query = `
      INSERT INTO costs (tenant_id, agent_id, customer_id, cost_type, amount, currency, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, agent_id, customer_id, cost_type, amount, currency, metadata, created_at
    `;

    const result = await db.query(query, [
      tenantId,
      agentId || null,
      customerId || null,
      costType || 'usage',
      amount,
      currency,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error recording cost:', error);
    return NextResponse.json(
      { error: 'Failed to record cost' },
      { status: 500 }
    );
  }
}
