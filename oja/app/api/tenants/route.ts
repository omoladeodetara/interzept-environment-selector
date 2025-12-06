/**
 * Tenants API Route
 * 
 * Next.js App Router handler for tenant management
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
 * POST /api/tenants
 * Create a new tenant
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, mode, paidApiKey, plan = 'free', metadata = {} } = await request.json();
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required and must be a non-empty string' }, { status: 400 });
    }
    
    if (!email || typeof email !== 'string' || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    if (!mode || !['managed', 'byok'].includes(mode)) {
      return NextResponse.json({ error: 'Mode must be either "managed" or "byok"' }, { status: 400 });
    }
    
    if (mode === 'byok' && (!paidApiKey || typeof paidApiKey !== 'string')) {
      return NextResponse.json({ error: 'paidApiKey is required for BYOK mode' }, { status: 400 });
    }
    
    if (plan && !['free', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plan must be one of: free, starter, pro, enterprise' }, { status: 400 });
    }
    
    const tenant = await db.createTenant({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mode,
      paidApiKey: mode === 'byok' ? paidApiKey : null,
      plan,
      metadata
    });
    
    if (tenant.paid_api_key) {
      tenant.paid_api_key = maskApiKey(tenant.paid_api_key);
    }
    
    return NextResponse.json(tenant, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}

/**
 * GET /api/tenants
 * List all tenants
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const plan = searchParams.get('plan');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json({ error: 'Limit must be between 1 and 100' }, { status: 400 });
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      return NextResponse.json({ error: 'Offset must be a non-negative number' }, { status: 400 });
    }
    
    if (mode && !['managed', 'byok'].includes(mode)) {
      return NextResponse.json({ error: 'Mode must be either "managed" or "byok"' }, { status: 400 });
    }
    
    if (plan && !['free', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Plan must be one of: free, starter, pro, enterprise' }, { status: 400 });
    }
    
    const result = await db.listTenants({
      mode: mode || undefined,
      plan: plan || undefined,
      limit: limitNum,
      offset: offsetNum
    });
    
    result.tenants = result.tenants.map(tenant => ({
      ...tenant,
      paid_api_key: tenant.paid_api_key ? maskApiKey(tenant.paid_api_key) : null
    }));
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error listing tenants:', error);
    return NextResponse.json({ 
      error: 'Failed to list tenants',
      message: config.nodeEnv === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
