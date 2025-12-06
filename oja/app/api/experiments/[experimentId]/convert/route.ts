/**
 * Experiment Convert API Route
 * 
 * Next.js App Router handler for recording conversions
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import * as signals from '@services/signals';
import config from '@utils/config';

type RouteContext = { params: Promise<{ experimentId: string }> };

/**
 * POST /api/experiments/:experimentId/convert
 * Record conversion
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { experimentId } = await context.params;
    const { userId, tenantId, revenue } = await request.json();
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    if (revenue !== undefined && (typeof revenue !== 'number' || revenue < 0 || !isFinite(revenue))) {
      return NextResponse.json({ error: 'Revenue must be a positive number' }, { status: 400 });
    }
    
    // Lookup experiment
    let experiment;
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      experiment = await db.getExperimentByKey(tenantId, experimentId);
    } else {
      experiment = await db.getExperiment(experimentId);
    }
    
    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }
    
    // Get assignment
    const assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      return NextResponse.json({ 
        error: 'No variant assignment found for this user and experiment' 
      }, { status: 404 });
    }
    
    // Get variant price if revenue not provided
    const variantData = experiment.variants.find((v: any) => v.name === assignment.variant);
    const conversionRevenue = revenue || variantData?.price || 0;
    
    // Record conversion
    await db.recordConversion(experiment.id, userId, assignment.variant, conversionRevenue);
    
    // Emit conversion signal (non-blocking)
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      signals.emitConversionSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
        .catch(error => console.error('Failed to emit conversion signal:', error.message));
    } else {
      signals.emitConversionSignal(userId, assignment.variant, experimentId)
        .catch(error => console.error('Failed to emit conversion signal:', error.message));
    }
    
    return NextResponse.json({
      success: true,
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      revenue: conversionRevenue
    });
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/convert:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
