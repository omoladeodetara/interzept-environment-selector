/**
 * Agent Detail API Route
 * 
 * Next.js App Router handler for individual agent operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteAgent, getAgent, updateAgent } from '@services/database';

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

    const agent = await getAgent(agentId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
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

    if (name === undefined && description === undefined && pricingModel === undefined && metadata === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await updateAgent(agentId, {
      name,
      description,
      pricing_model: pricingModel,
      metadata,
    });

    return NextResponse.json(updated);
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

    const deleted = await deleteAgent(agentId);

    if (!deleted) {
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
