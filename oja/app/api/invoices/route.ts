/**
 * Invoices API Route
 * 
 * Next.js App Router handler for invoice management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, listInvoices } from '@services/database';

/**
 * GET /api/invoices
 * List all invoices for a tenant
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

    const invoices = await listInvoices(tenantId, { limit, offset });

    return NextResponse.json({
      data: invoices,
      pagination: {
        limit,
        offset,
        total: invoices.length
      }
    });
  } catch (error) {
    console.error('Error listing invoices:', error);
    return NextResponse.json(
      { error: 'Failed to list invoices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, invoiceNumber, amount, amountDue, currency = 'USD', dueDate, status = 'draft', metadata = {}, lineItems, externalId } = body;

    // TODO: Get tenantId from auth context
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    if (amount === undefined || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount is required and must be a number' }, { status: 400 });
    }

    const created = await createInvoice({
      tenantId,
      customerId,
      invoiceNumber,
      amount,
      amountDue: amountDue ?? amount,
      currency,
      externalId,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      lineItems,
      metadata,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
