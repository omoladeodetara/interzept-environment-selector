/**
 * Customer Detail API Route
 * 
 * Next.js App Router handler for individual customer operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomer, getCustomer, updateCustomer } from '@services/database';

type RouteContext = {
  params: Promise<{ customerId: string }>;
};

/**
 * GET /api/customers/{customerId}
 * Get a specific customer
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    const customer = await getCustomer(customerId);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    return NextResponse.json(
      { error: 'Failed to get customer' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/{customerId}
 * Update a customer
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { customerId } = await context.params;
    const body = await request.json();
    const { name, email, metadata } = body;

    if (email !== undefined && email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (name === undefined && email === undefined && metadata === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await updateCustomer(customerId, {
      name,
      email,
      metadata,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/{customerId}
 * Delete a customer
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { customerId } = await context.params;

    const deleted = await deleteCustomer(customerId);

    if (!deleted) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
