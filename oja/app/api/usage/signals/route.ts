/**
 * Usage Signals API Route
 * 
 * Next.js App Router handler for recording usage signals
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * POST /api/usage/signals
 * Record a usage signal event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      agentId, 
      customerId, 
      eventType, 
      properties = {},
      metadata = {} 
    } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Record the usage signal in database
    const query = `
      INSERT INTO usage_signals (tenant_id, agent_id, customer_id, event_type, properties, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, tenant_id, agent_id, customer_id, event_type, properties, metadata, created_at
    `;

    const result = await db.query(query, [
      tenantId,
      agentId || null,
      customerId || null,
      eventType,
      JSON.stringify(properties),
      JSON.stringify(metadata)
    ]);

    return NextResponse.json({
      id: result.rows[0].id,
      message: 'Usage signal recorded successfully',
      signal: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording usage signal:', error);
    return NextResponse.json(
      { error: 'Failed to record usage signal' },
      { status: 500 }
    );
  }
}
