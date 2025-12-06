/**
 * Contacts API Route
 * 
 * Next.js App Router handler for contact management
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      INSERT INTO contacts (customer_id, external_id, email, phone, address, metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, customer_id, external_id, email, phone, address, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [
      customerId,
      externalId || null,
      email,
      phone || null,
      address ? JSON.stringify(address) : null,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
