/**
 * Experiment Results API Route
 * 
 * Next.js App Router handler for experiment results
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import * as elo from '@packages/elo';
import config from '@utils/config';

type RouteContext = { params: Promise<{ experimentId: string }> };

/**
 * GET /api/experiments/:experimentId/results
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { experimentId } = await context.params;
    
    let experiment = await db.getExperiment(experimentId);
    
    if (!experiment) {
      // Try old format lookup
      const results = await elo.getExperimentResults(experimentId);
      return NextResponse.json(results);
    }
    
    const results = await db.getExperimentResults(experiment.id);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/results:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
