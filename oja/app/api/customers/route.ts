/**
 * Customers API Route
 * 
 * Next.js App Router handler for customer management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, listCustomers } from '@services/database';

/**
 * GET /api/customers
 * List all customers for a tenant
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

    const customers = await listCustomers(tenantId, { limit, offset });

    return NextResponse.json({
      data: customers,
      pagination: {
        limit,
        offset,
        total: customers.length
      }
    });
  } catch (error) {
    console.error('Error listing customers:', error);
    return NextResponse.json(
      { error: 'Failed to list customers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalId, name, email, phone, metadata = {} } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const created = await createCustomer({
      tenantId,
      externalId,
      name,
      email,
      phone,
      metadata,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
