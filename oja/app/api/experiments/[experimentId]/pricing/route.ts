/**
 * Experiment Pricing API Route
 * 
 * Next.js App Router handler for experiment pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import * as elo from '@packages/elo';
import * as signals from '@services/signals';
import config from '@utils/config';

type RouteContext = { params: Promise<{ experimentId: string }> };

/**
 * GET /api/experiments/:experimentId/pricing
 * Get pricing with variant assignment
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { experimentId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
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
    
    // Get or create assignment
    let assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      const variant = await elo.assignVariant(userId, experimentId);
      assignment = await db.createAssignment(experiment.id, userId, variant);
    }
    
    // Get variant details
    let variantData = experiment.variants.find((v: any) => v.name === assignment!.variant);
    if (!variantData) {
      variantData = experiment.variants[0];
    }
    
    // Record view
    await db.recordView(experiment.id, userId, assignment.variant);
    
    // Emit signal to Paid.ai (non-blocking)
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
        .catch(error => console.error('Failed to emit pricing view signal:', error.message));
    } else {
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId)
        .catch(error => console.error('Failed to emit pricing view signal:', error.message));
    }
    
    return NextResponse.json({
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      pricing: {
        plan: variantData.name.charAt(0).toUpperCase() + variantData.name.slice(1),
        price: variantData.price,
        features: ['Feature A', 'Feature B', 'Feature C']
      }
    });
  } catch (error: any) {
    console.error('Error in /api/experiments/:experimentId/pricing:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
