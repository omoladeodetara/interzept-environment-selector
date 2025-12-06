/**
 * Tenant Experiments API Route
 * 
 * Next.js App Router handler for tenant experiment operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import config from '@utils/config';

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

type RouteContext = { params: Promise<{ tenantId: string }> };

/**
 * POST /api/tenants/:tenantId/experiments
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    const { key, name, description, variants, targetSampleSize } = await request.json();
    
    if (!isValidUUID(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID format' }, { status: 400 });
    }
    
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    if (!key || typeof key !== 'string' || !/^[a-z0-9_]+$/.test(key)) {
      return NextResponse.json({ error: 'Key is required and must contain only lowercase letters, numbers, and underscores' }, { status: 400 });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required and must be a non-empty string' }, { status: 400 });
    }
    
    if (!Array.isArray(variants) || variants.length < 2) {
      return NextResponse.json({ error: 'At least 2 variants are required' }, { status: 400 });
    }
    
    for (const variant of variants) {
      if (!variant.name || typeof variant.name !== 'string') {
        return NextResponse.json({ error: 'Each variant must have a name' }, { status: 400 });
      }
      if (variant.price === undefined || typeof variant.price !== 'number' || variant.price < 0) {
        return NextResponse.json({ error: 'Each variant must have a non-negative price' }, { status: 400 });
      }
    }
    
    const experiment = await db.createExperiment({
      tenantId,
      key: key.toLowerCase(),
      name: name.trim(),
      description: description || null,
      variants,
      targetSampleSize: targetSampleSize || null
    });
    
    return NextResponse.json(experiment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating experiment:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create experiment',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * GET /api/tenants/:tenantId/experiments
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    if (!isValidUUID(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID format' }, { status: 400 });
    }
    
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    if (status && !['draft', 'active', 'paused', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Status must be one of: draft, active, paused, completed' }, { status: 400 });
    }
    
    const experiments = await db.listExperiments(tenantId, { status: status || undefined });
    
    return NextResponse.json({ experiments });
  } catch (error: any) {
    console.error('Error listing experiments:', error);
    return NextResponse.json({ 
      error: 'Failed to list experiments',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
