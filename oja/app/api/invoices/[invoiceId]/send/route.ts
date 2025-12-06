/**
 * Invoice Send API Route
 * 
 * Next.js App Router handler for sending invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

type RouteContext = {
  params: Promise<{ invoiceId: string }>;
};

/**
 * POST /api/invoices/{invoiceId}/send
 * Send an invoice to the customer
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { invoiceId } = await context.params;

    // Update invoice status to sent
    const query = `
      UPDATE invoices
      SET status = 'sent', updated_at = NOW()
      WHERE id = $1 AND status = 'draft'
      RETURNING id, customer_id, invoice_number, status, amount, currency, due_date, metadata, created_at, updated_at
    `;

    const result = await db.query(query, [invoiceId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found or already sent' }, { status: 404 });
    }

    // TODO: Implement actual email sending logic here
    // For now, just return success with updated invoice

    return NextResponse.json({
      ...result.rows[0],
      message: 'Invoice sent successfully'
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
