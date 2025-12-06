/**
 * Contact Detail API Route
 * 
 * Next.js App Router handler for individual contact operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@services/supabase';

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

/**
 * DELETE /api/contacts/{contactId}
 * Delete a contact
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { contactId } = await context.params;

    const { error, data } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
