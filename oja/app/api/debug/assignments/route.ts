/**
 * Debug Assignments API Route
 * 
 * Next.js App Router handler for debugging experiment assignments
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

/**
 * GET /api/debug/assignments
 * Get experiment assignments for debugging
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experimentId');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 500);

    if (!experimentId) {
      return NextResponse.json({ error: 'experimentId is required' }, { status: 400 });
    }

    let query = `
      SELECT 
        a.id,
        a.experiment_id,
        a.user_id,
        a.variant_index,
        a.assigned_at,
        e.name as experiment_name,
        e.variants
      FROM experiment_assignments a
      JOIN experiments e ON a.experiment_id = e.id
      WHERE a.experiment_id = $1
    `;

    const params: any[] = [experimentId];

    if (userId) {
      query += ` AND a.user_id = $2`;
      params.push(userId);
    }

    query += ` ORDER BY a.assigned_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    // Get assignment statistics
    const statsQuery = `
      SELECT 
        variant_index,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
      FROM experiment_assignments
      WHERE experiment_id = $1
      GROUP BY variant_index
      ORDER BY variant_index
    `;

    const statsResult = await db.query(statsQuery, [experimentId]);

    return NextResponse.json({
      assignments: result.rows,
      statistics: statsResult.rows,
      experimentId,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error getting debug assignments:', error);
    return NextResponse.json(
      { error: 'Failed to get debug assignments' },
      { status: 500 }
    );
  }
}
