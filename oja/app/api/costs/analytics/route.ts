/**
 * Costs Analytics API Route
 * 
 * Next.js App Router handler for cost analytics and aggregation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosts } from '@services/database';

/**
 * GET /api/costs/analytics
 * Get aggregated cost analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month, agent, customer, type

    // TODO: Get tenantId from auth context
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    const costs = await getCosts(tenantId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: 5000,
      offset: 0,
    });

    const groupKeyFn = (cost: any) => {
      const created = new Date(cost.created_at);
      switch (groupBy) {
        case 'agent':
          return cost.agent_id || 'unassigned';
        case 'customer':
          return cost.customer_id || 'unassigned';
        case 'type':
          return cost.cost_type || 'unknown';
        case 'week':
          return created.toISOString().substring(0, 10); // simple date bucket
        case 'month':
          return created.toISOString().substring(0, 7);
        default:
          return created.toISOString().substring(0, 10);
      }
    };

    const analyticsMap = new Map<string, { count: number; total: number; min: number; max: number; currency: string }>();

    for (const cost of costs) {
      const key = groupKeyFn(cost);
      const amount = parseFloat((cost as any).amount);
      const entry = analyticsMap.get(key) || { count: 0, total: 0, min: amount, max: amount, currency: (cost as any).currency };
      entry.count += 1;
      entry.total += amount;
      entry.min = Math.min(entry.min, amount);
      entry.max = Math.max(entry.max, amount);
      analyticsMap.set(key, entry);
    }

    const analytics = Array.from(analyticsMap.entries()).map(([group_key, entry]) => ({
      group_key,
      count: entry.count,
      total_amount: entry.total,
      avg_amount: entry.total / entry.count,
      min_amount: entry.min,
      max_amount: entry.max,
      currency: entry.currency,
    }));

    const totalsMap = new Map<string, { total_count: number; total_amount: number }>();
    for (const cost of costs) {
      const currency = (cost as any).currency;
      const amount = parseFloat((cost as any).amount);
      const entry = totalsMap.get(currency) || { total_count: 0, total_amount: 0 };
      entry.total_count += 1;
      entry.total_amount += amount;
      totalsMap.set(currency, entry);
    }

    const totals = Array.from(totalsMap.entries()).map(([currency, entry]) => ({
      currency,
      total_count: entry.total_count,
      total_amount: entry.total_amount,
    }));

    return NextResponse.json({
      analytics,
      totals,
      groupBy
    });
  } catch (error) {
    console.error('Error getting cost analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get cost analytics' },
      { status: 500 }
    );
  }
}
