/**
 * Invoice Detail API Route
 * 
 * Next.js App Router handler for individual invoice operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ invoiceId: string }>;
};

/**
 * GET /api/invoices/{invoiceId}
 * Get a specific invoice
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { invoiceId } = await context.params;

    const query = `
      SELECT id, customer_id, invoice_number, status, amount, currency, due_date, metadata, created_at, updated_at
      FROM invoices
      WHERE id = $1
    `;

    const result = await db.query(query, [invoiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/{invoiceId}
 * Update an invoice
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { invoiceId } = await context.params;
    const body = await request.json();
    const { status, amount, currency, dueDate, metadata } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(amount);
    }

    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(dueDate);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(invoiceId);

    const query = `
      UPDATE invoices
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, customer_id, invoice_number, status, amount, currency, due_date, metadata, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/{invoiceId}
 * Delete an invoice
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { invoiceId } = await context.params;

    const query = `
      DELETE FROM invoices
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [invoiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
