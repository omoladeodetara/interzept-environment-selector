/**
 * Costs Analytics API Route
 * 
 * Next.js App Router handler for cost analytics and aggregation
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';

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

    let groupByClause = '';
    let selectClause = '';

    switch (groupBy) {
      case 'agent':
        selectClause = 'agent_id as group_key';
        groupByClause = 'agent_id';
        break;
      case 'customer':
        selectClause = 'customer_id as group_key';
        groupByClause = 'customer_id';
        break;
      case 'type':
        selectClause = 'cost_type as group_key';
        groupByClause = 'cost_type';
        break;
      case 'week':
        selectClause = "DATE_TRUNC('week', created_at) as group_key";
        groupByClause = "DATE_TRUNC('week', created_at)";
        break;
      case 'month':
        selectClause = "DATE_TRUNC('month', created_at) as group_key";
        groupByClause = "DATE_TRUNC('month', created_at)";
        break;
      default: // day
        selectClause = "DATE_TRUNC('day', created_at) as group_key";
        groupByClause = "DATE_TRUNC('day', created_at)";
    }

    let query = `
      SELECT 
        ${selectClause},
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount,
        currency
      FROM costs
      WHERE tenant_id = $1
    `;

    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ` GROUP BY ${groupByClause}, currency ORDER BY group_key DESC`;

    const result = await db.query(query, params);

    // Calculate overall totals
    const totalQuery = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount,
        currency
      FROM costs
      WHERE tenant_id = $1
      ${startDate ? `AND created_at >= $${params.length > 1 ? 2 : params.length + 1}` : ''}
      ${endDate ? `AND created_at <= $${params.length > 2 ? 3 : params.length + 1}` : ''}
      GROUP BY currency
    `;

    const totalResult = await db.query(totalQuery, params);

    return NextResponse.json({
      analytics: result.rows,
      totals: totalResult.rows,
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
