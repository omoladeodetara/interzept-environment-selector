/**
 * Jale Propose Variant API Route
 * 
 * Next.js App Router handler for proposing new variants
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import config from '@utils/config';

/**
 * POST /api/jale/propose-variant
 */
export async function POST(request: NextRequest) {
  try {
    const { experimentId, tenantId, price, label, metadata } = await request.json();
    
    if (!experimentId || typeof experimentId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing experimentId' }, { status: 400 });
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Invalid or missing price (must be a positive number)' }, { status: 400 });
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
    
    // Check existing variant names
    const existingNames = new Set(experiment.variants.map((v: any) => v.name));
    
    // Generate variant label if not provided
    let variantLabel = label;
    if (!variantLabel) {
      let counter = experiment.variants.length + 1;
      do {
        variantLabel = `variant_${counter}`;
        counter++;
      } while (existingNames.has(variantLabel));
    } else {
      if (existingNames.has(variantLabel)) {
        return NextResponse.json({ 
          error: `Variant with name '${variantLabel}' already exists` 
        }, { status: 400 });
      }
    }
    
    const newVariant = {
      name: variantLabel,
      price,
      weight: 0.0,
      metadata: metadata || {}
    };
    
    const updatedVariants = [...experiment.variants, newVariant];
    
    const updatedExperiment = await db.updateExperiment(experiment.id, {
      variants: updatedVariants
    });
    
    return NextResponse.json({
      success: true,
      experimentId: experiment.key,
      variant: newVariant,
      message: `Variant '${variantLabel}' proposed successfully`,
      experiment: {
        id: updatedExperiment!.id,
        key: updatedExperiment!.key,
        variants: updatedExperiment!.variants
      }
    });
  } catch (error: any) {
    console.error('Error in /api/jale/propose-variant:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
