/**
 * Customer Detail API Route
 * 
 * Next.js App Router handler for individual customer operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      SELECT id, external_id, name, email, metadata, created_at, updated_at
      FROM customers
      WHERE id = $1
    `;

    const result = await db.query(query, [customerId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (email !== undefined) {
      if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(customerId);

    const query = `
      UPDATE customers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, external_id, name, email, metadata, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
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

    const query = `
      DELETE FROM customers
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [customerId]);

    if (result.rows.length === 0) {
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
