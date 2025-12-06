/**
 * Contact External ID Lookup API Route
 * 
 * Next.js App Router handler for looking up contacts by external ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@services/supabase';

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

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('external_id', externalId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting contact by external ID:', error);
    return NextResponse.json(
      { error: 'Failed to get contact' },
      { status: 500 }
    );
  }
}
