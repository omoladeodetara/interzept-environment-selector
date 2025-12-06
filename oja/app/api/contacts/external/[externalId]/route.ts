/**
 * Contact External ID Lookup API Route
 * 
 * Next.js App Router handler for looking up contacts by external ID
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ externalId: string }>;
};

/**
 * GET /api/contacts/external/{externalId}
 * Get a contact by external ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { externalId } = await context.params;
    const { searchParams } = new URL(request.url);
    
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    const query = `
      SELECT id, customer_id, external_id, email, phone, address, metadata, created_at, updated_at
      FROM contacts
      WHERE customer_id = $1 AND external_id = $2
    `;

    const result = await db.query(query, [customerId, externalId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting contact by external ID:', error);
    return NextResponse.json(
      { error: 'Failed to get contact' },
      { status: 500 }
    );
  }
}
