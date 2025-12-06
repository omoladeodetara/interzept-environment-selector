/**
 * Single Tenant API Route
 * 
 * Next.js App Router handler for individual tenant operations
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@services/database';
import config from '@utils/config';

/**
 * Mask API key for display
 */
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***';
  }
  const prefixMatch = apiKey.match(/^(sk_[a-zA-Z0-9]*_?)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  return prefix + '***...' + apiKey.slice(-4);
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

type RouteContext = { params: Promise<{ tenantId: string }> };

/**
 * GET /api/tenants/:tenantId
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    
    if (!isValidUUID(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID format' }, { status: 400 });
    }
    
    const tenant = await db.getTenant(tenantId);
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Error getting tenant:', error);
    return NextResponse.json({ 
      error: 'Failed to get tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * PATCH /api/tenants/:tenantId
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    const updates = await request.json();
    
    if (!isValidUUID(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID format' }, { status: 400 });
    }
    
    if (updates.name !== undefined && (typeof updates.name !== 'string' || updates.name.trim().length === 0)) {
      return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
    }
    
    if (updates.mode !== undefined && !['managed', 'byok'].includes(updates.mode)) {
      return NextResponse.json({ error: 'Mode must be either "managed" or "byok"' }, { status: 400 });
    }
    
    if (updates.plan !== undefined && !['free', 'starter', 'pro', 'enterprise'].includes(updates.plan)) {
      return NextResponse.json({ error: 'Plan must be one of: free, starter, pro, enterprise' }, { status: 400 });
    }
    
    const sanitizedUpdates: any = {};
    if (updates.name) sanitizedUpdates.name = updates.name.trim();
    if (updates.mode) sanitizedUpdates.mode = updates.mode;
    if (updates.plan) sanitizedUpdates.plan = updates.plan;
    if (updates.metadata) sanitizedUpdates.metadata = updates.metadata;
    if (updates.paidApiKey) sanitizedUpdates.paid_api_key = updates.paidApiKey;
    
    const tenant = await db.updateTenant(tenantId, sanitizedUpdates);
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ 
      error: 'Failed to update tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tenants/:tenantId
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    
    if (!isValidUUID(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant ID format' }, { status: 400 });
    }
    
    const deleted = await db.deleteTenant(tenantId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ 
      error: 'Failed to delete tenant',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
