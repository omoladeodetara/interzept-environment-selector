/**
 * Agents API Route
 * 
 * Next.js App Router handler for agent management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAgent, listAgents } from '@services/database';

/**
 * GET /api/agents
 * List all agents for a tenant
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

    const agents = await listAgents(tenantId, { limit, offset });

    return NextResponse.json({
      data: agents,
      pagination: {
        limit,
        offset,
        total: agents.length
      }
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Create a new agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalId, name, description, pricingModel, basePrice, currency, metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const created = await createAgent({
      tenantId,
      externalId,
      name,
      description,
      pricingModel,
      basePrice,
      currency,
      metadata
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
