/**
 * Contacts API Route
 * 
 * Next.js App Router handler for contact management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@services/supabase';

/**
 * POST /api/contacts
 * Create a new contact for a customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, externalId, email, phone, address, metadata = {} } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        customer_id: customerId,
        external_id: externalId || null,
        email,
        phone: phone || null,
        address: address || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
