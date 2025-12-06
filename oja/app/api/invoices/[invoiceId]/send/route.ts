/**
 * Invoice Send API Route
 * 
 * Next.js App Router handler for sending invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, updateInvoice } from '@services/database';

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

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if ((invoice as any).status !== 'draft') {
      return NextResponse.json({ error: 'Invoice already sent or finalized' }, { status: 400 });
    }

    const updated = await updateInvoice(invoiceId, { status: 'open' });

    return NextResponse.json({
      ...updated,
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
