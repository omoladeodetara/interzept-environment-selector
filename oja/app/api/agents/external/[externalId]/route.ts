/**
 * Agent External ID Lookup API Route
 * 
 * Next.js App Router handler for looking up agents by external ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByExternalId } from '@services/database';

type RouteContext = {
  params: Promise<{ externalId: string }>;
};

/**
 * GET /api/agents/external/{externalId}
 * Get an agent by external ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { externalId } = await context.params;
    const { searchParams } = new URL(request.url);
    
    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const agent = await getAgentByExternalId(tenantId, externalId);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error getting agent by external ID:', error);
    return NextResponse.json(
      { error: 'Failed to get agent' },
      { status: 500 }
    );
  }
}
