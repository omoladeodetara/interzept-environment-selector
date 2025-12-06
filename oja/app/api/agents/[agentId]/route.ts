/**
 * Agent Detail API Route
 * 
 * Next.js App Router handler for individual agent operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ agentId: string }>;
};

/**
 * GET /api/agents/{agentId}
 * Get a specific agent
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { agentId } = await context.params;

    const query = `
      SELECT id, external_id, name, description, pricing_model, metadata, created_at, updated_at
      FROM agents
      WHERE id = $1
    `;

    const result = await db.query(query, [agentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting agent:', error);
    return NextResponse.json(
      { error: 'Failed to get agent' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/agents/{agentId}
 * Update an agent
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const body = await request.json();
    const { name, description, pricingModel, metadata } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }

    if (pricingModel !== undefined) {
      updates.push(`pricing_model = $${paramIndex++}`);
      values.push(pricingModel);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(agentId);

    const query = `
      UPDATE agents
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, external_id, name, description, pricing_model, metadata, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/{agentId}
 * Delete an agent
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { agentId } = await context.params;

    const query = `
      DELETE FROM agents
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [agentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
