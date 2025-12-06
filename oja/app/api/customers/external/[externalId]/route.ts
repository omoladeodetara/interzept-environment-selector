/**
 * Customer External ID Lookup API Route
 * 
 * Next.js App Router handler for looking up customers by external ID
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ externalId: string }>;
};

/**
 * GET /api/customers/external/{externalId}
 * Get a customer by external ID
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

    const query = `
      SELECT id, external_id, name, email, metadata, created_at, updated_at
      FROM customers
      WHERE tenant_id = $1 AND external_id = $2
    `;

    const result = await db.query(query, [tenantId, externalId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting customer by external ID:', error);
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    );
  }
}
