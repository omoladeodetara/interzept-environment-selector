/**
 * Contact Detail API Route
 * 
 * Next.js App Router handler for individual contact operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    const query = `
      DELETE FROM contacts
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [contactId]);

    if (result.rows.length === 0) {
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
