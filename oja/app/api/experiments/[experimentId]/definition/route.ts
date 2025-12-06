/**
 * Experiment Definition API Route
 * 
 * Next.js App Router handler for experiment definitions
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import config from '@utils/config';

type RouteContext = { params: Promise<{ experimentId: string }> };

/**
 * GET /api/experiments/:experimentId/definition
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { experimentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    
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
    
    return NextResponse.json({
      experimentId: experiment.key,
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      status: experiment.status,
      variants: experiment.variants,
      targetSampleSize: experiment.target_sample_size,
      startDate: experiment.start_date,
      endDate: experiment.end_date,
      metadata: experiment.metadata
    });
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/definition:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
