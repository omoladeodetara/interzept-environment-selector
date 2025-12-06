/**
 * Invoice Detail API Route
 * 
 * Next.js App Router handler for individual invoice operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteInvoice, getInvoice, updateInvoice } from '@services/database';

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

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
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
    const { status, amount, amountDue, currency, dueDate, metadata, lineItems, amountPaid } = body;

    if (
      status === undefined &&
      amount === undefined &&
      amountDue === undefined &&
      amountPaid === undefined &&
      currency === undefined &&
      dueDate === undefined &&
      metadata === undefined &&
      lineItems === undefined
    ) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await updateInvoice(invoiceId, {
      status,
      amount,
      amount_due: amountDue,
      amount_paid: amountPaid,
      currency,
      due_date: dueDate,
      metadata,
      line_items: lineItems,
    });

    return NextResponse.json(updated);
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

    const deleted = await deleteInvoice(invoiceId);

    if (!deleted) {
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
