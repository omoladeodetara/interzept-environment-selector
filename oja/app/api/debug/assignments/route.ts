/**
 * Debug Assignments API Route
 * 
 * Next.js App Router handler for debugging experiment assignments
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@services/supabase';

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

    const assignmentsQuery = supabaseAdmin
      .from('experiment_assignments')
      .select('id, experiment_id, user_id, variant_index, assigned_at, experiments(name, variants)')
      .eq('experiment_id', experimentId)
      .order('assigned_at', { ascending: false })
      .limit(limit);

    const filteredQuery = userId ? assignmentsQuery.eq('user_id', userId) : assignmentsQuery;
    const { data: assignments, error } = await filteredQuery;
    if (error) throw error;

    const { data: statsSource, error: statsError } = await supabaseAdmin
      .from('experiment_assignments')
      .select('variant_index')
      .eq('experiment_id', experimentId)
      .limit(10000);

    if (statsError) throw statsError;

    return NextResponse.json({
      assignments,
      statistics: (() => {
        const counts = new Map<number, number>();
        for (const row of statsSource || []) {
          const key = Number((row as any).variant_index);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        const total = Array.from(counts.values()).reduce((sum, v) => sum + v, 0) || 1;
        return Array.from(counts.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([variant_index, count]) => ({
            variant_index,
            count,
            percentage: (count * 100) / total,
          }));
      })(),
      experimentId,
      total: assignments?.length || 0
    });
  } catch (error) {
    console.error('Error getting debug assignments:', error);
    return NextResponse.json(
      { error: 'Failed to get debug assignments' },
      { status: 500 }
    );
  }
}
