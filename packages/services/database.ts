/**
 * Database service for Last Price multi-tenant system
 * 
 * This module provides database access using Supabase.
 * It handles tenant management, experiments, assignments, views, conversions, and usage tracking.
 */

import { supabaseAdmin as supabase } from './supabase';
import {
  Tenant,
  Experiment,
  Assignment,
  View,
  Conversion,
  Usage,
  Variant,
  ExperimentResults
} from '@models/types';

// ============================================================================
// TENANT OPERATIONS
// ============================================================================

export async function createTenant(tenant: {
  name: string;
  email: string;
  mode: 'managed' | 'byok';
  paidApiKey?: string | null;
  plan?: string;
  metadata?: Record<string, any>;
}): Promise<Tenant> {
  const { name, email, mode, paidApiKey = null, plan = 'free', metadata = {} } = tenant;
  
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name,
      email,
      mode,
      paid_api_key: paidApiKey,
      plan,
      metadata,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Tenant with this email already exists');
    }
    throw error;
  }
  
  return data as Tenant;
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Tenant | null;
}

export async function getTenantByEmail(email: string): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Tenant | null;
}

export async function listTenants(options: {
  mode?: string;
  plan?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ tenants: Tenant[]; pagination: { total: number; limit: number; offset: number } }> {
  const { mode, plan, limit = 20, offset = 0 } = options;
  
  let query = supabase.from('tenants').select('*', { count: 'exact' });
  
  if (mode) {
    query = query.eq('mode', mode);
  }
  
  if (plan) {
    query = query.eq('plan', plan);
  }
  
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    tenants: (data as Tenant[]) || [],
    pagination: {
      total: count || 0,
      limit,
      offset
    }
  };
}

export async function updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  const allowedFields = ['name', 'mode', 'paid_api_key', 'plan', 'metadata', 'webhook_secret'];
  const updateData: any = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateData[key] = value;
    }
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const { data, error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', tenantId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Tenant | null;
}

export async function deleteTenant(tenantId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// EXPERIMENT OPERATIONS
// ============================================================================

export async function createExperiment(experiment: {
  tenantId: string;
  key: string;
  name: string;
  description?: string | null;
  variants: Variant[];
  targetSampleSize?: number | null;
}): Promise<Experiment> {
  const { tenantId, key, name, description = null, variants, targetSampleSize = null } = experiment;
  
  const { data, error } = await supabase
    .from('experiments')
    .insert({
      tenant_id: tenantId,
      key,
      name,
      description,
      variants,
      target_sample_size: targetSampleSize,
    })
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('Experiment with this key already exists for this tenant');
    }
    throw error;
  }
  
  return data as Experiment;
}

export async function getExperiment(experimentId: string): Promise<Experiment | null> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', experimentId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Experiment | null;
}

export async function getExperimentByKey(tenantId: string, experimentKey: string): Promise<Experiment | null> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('key', experimentKey)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Experiment | null;
}

export async function listExperiments(tenantId: string, options: { status?: string } = {}): Promise<Experiment[]> {
  const { status } = options;
  
  let query = supabase
    .from('experiments')
    .select('*')
    .eq('tenant_id', tenantId);
  
  if (status) {
    query = query.eq('status', status);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data as Experiment[]) || [];
}

export async function updateExperiment(experimentId: string, updates: Partial<Experiment>): Promise<Experiment | null> {
  const allowedFields = ['name', 'description', 'status', 'variants', 'start_date', 'end_date', 'target_sample_size', 'metadata'];
  const updateData: any = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateData[key] = value;
    }
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  const { data, error } = await supabase
    .from('experiments')
    .update(updateData)
    .eq('id', experimentId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Experiment | null;
}

export async function deleteExperiment(experimentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('experiments')
    .delete()
    .eq('id', experimentId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

export async function createAssignment(experimentId: string, userId: string, variant: string): Promise<Assignment> {
  const { data, error } = await supabase
    .from('assignments')
    .upsert({
      experiment_id: experimentId,
      user_id: userId,
      variant,
    }, {
      onConflict: 'experiment_id,user_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Assignment;
}

export async function getAssignment(experimentId: string, userId: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('experiment_id', experimentId)
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Assignment | null;
}

// ============================================================================
// VIEW TRACKING
// ============================================================================

export async function recordView(
  experimentId: string,
  userId: string,
  variant: string,
  metadata: Record<string, any> = {}
): Promise<View> {
  const { data, error } = await supabase
    .from('views')
    .insert({
      experiment_id: experimentId,
      user_id: userId,
      variant,
      metadata,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as View;
}

// ============================================================================
// CONVERSION TRACKING
// ============================================================================

export async function recordConversion(
  experimentId: string,
  userId: string,
  variant: string,
  revenue: number,
  metadata: Record<string, any> = {},
  paidOrderId: string | null = null
): Promise<Conversion> {
  const { data, error } = await supabase
    .from('conversions')
    .insert({
      experiment_id: experimentId,
      user_id: userId,
      variant,
      revenue,
      metadata,
      paid_order_id: paidOrderId,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Conversion;
}

// ============================================================================
// EXPERIMENT RESULTS
// ============================================================================

export async function getExperimentResults(experimentId: string): Promise<ExperimentResults> {
  // This function uses complex SQL aggregation
  // For now, we'll use Supabase's raw SQL via RPC or reconstruct using multiple queries
  
  // Get all views for this experiment
  const { data: views, error: viewsError } = await supabase
    .from('views')
    .select('variant, user_id')
    .eq('experiment_id', experimentId);
  
  if (viewsError) throw viewsError;
  
  // Get all conversions for this experiment
  const { data: conversions, error: conversionsError } = await supabase
    .from('conversions')
    .select('variant, user_id, revenue')
    .eq('experiment_id', experimentId);
  
  if (conversionsError) throw conversionsError;
  
  // Calculate metrics per variant
  const variantMetrics: Record<string, any> = {};
  
  // Group views by variant
  const viewsByVariant: Record<string, Set<string>> = {};
  views?.forEach((view: any) => {
    if (!viewsByVariant[view.variant]) {
      viewsByVariant[view.variant] = new Set();
    }
    viewsByVariant[view.variant].add(view.user_id);
  });
  
  // Group conversions by variant
  const conversionsByVariant: Record<string, { users: Set<string>; totalRevenue: number }> = {};
  conversions?.forEach((conv: any) => {
    if (!conversionsByVariant[conv.variant]) {
      conversionsByVariant[conv.variant] = { users: new Set(), totalRevenue: 0 };
    }
    conversionsByVariant[conv.variant].users.add(conv.user_id);
    conversionsByVariant[conv.variant].totalRevenue += parseFloat(conv.revenue);
  });
  
  // Calculate metrics for each variant
  const results: ExperimentResults = {
    experimentId,
    control: null,
    experiment: null
  };
  
  Object.keys(viewsByVariant).forEach(variant => {
    const viewCount = viewsByVariant[variant].size;
    const conversionData = conversionsByVariant[variant] || { users: new Set(), totalRevenue: 0 };
    const conversionCount = conversionData.users.size;
    const revenue = conversionData.totalRevenue;
    
    const metrics = {
      views: viewCount,
      conversions: conversionCount,
      revenue: revenue.toFixed(2),
      conversionRate: viewCount > 0 ? ((conversionCount / viewCount) * 100).toFixed(2) + '%' : '0.00%',
      arpu: conversionCount > 0 ? (revenue / conversionCount).toFixed(2) : '0.00'
    };
    
    if (variant === 'control') {
      results.control = metrics;
    } else {
      results[variant] = metrics;
    }
  });
  
  return results;
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export async function recordUsage(
  tenantId: string,
  metric: string,
  value: number,
  period: Date = new Date()
): Promise<Usage> {
  const periodDate = period.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // First, try to get existing usage
  const { data: existing } = await supabase
    .from('usage')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('metric', metric)
    .eq('period', periodDate)
    .single();
  
  const newValue = existing ? existing.value + value : value;
  
  const { data, error } = await supabase
    .from('usage')
    .upsert({
      tenant_id: tenantId,
      metric,
      value: newValue,
      period: periodDate,
    }, {
      onConflict: 'tenant_id,metric,period'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Usage;
}

export async function getUsage(
  tenantId: string,
  options: { startDate?: Date; endDate?: Date; metric?: string } = {}
): Promise<Usage[]> {
  const { startDate, endDate, metric } = options;
  
  let query = supabase
    .from('usage')
    .select('*')
    .eq('tenant_id', tenantId);
  
  if (startDate) {
    query = query.gte('period', startDate.toISOString().split('T')[0]);
  }
  
  if (endDate) {
    query = query.lte('period', endDate.toISOString().split('T')[0]);
  }
  
  if (metric) {
    query = query.eq('metric', metric);
  }
  
  query = query.order('period', { ascending: false }).order('metric');
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data as Usage[]) || [];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('tenants').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Note: Supabase doesn't require explicit connection closing
export async function close(): Promise<void> {
  // No-op for Supabase client
  return Promise.resolve();
}

// ============================================================================
// AGENTS OPERATIONS
// ============================================================================

export async function createAgent(agent: {
  tenantId: string;
  name: string;
  description?: string;
  pricingModel?: string;
  basePrice?: number;
  currency?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('agents')
    .insert({
      tenant_id: agent.tenantId,
      name: agent.name,
      description: agent.description,
      pricing_model: agent.pricingModel,
      base_price: agent.basePrice,
      currency: agent.currency || 'USD',
      external_id: agent.externalId,
      metadata: agent.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAgent(agentId: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAgentByExternalId(tenantId: string, externalId: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('external_id', externalId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listAgents(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updateAgent(agentId: string, updates: any) {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteAgent(agentId: string) {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// CUSTOMERS OPERATIONS
// ============================================================================

export async function createCustomer(customer: {
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      tenant_id: customer.tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      external_id: customer.externalId,
      metadata: customer.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getCustomerByExternalId(tenantId: string, externalId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('external_id', externalId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listCustomers(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updateCustomer(customerId: string, updates: any) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCustomer(customerId: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// ORDERS OPERATIONS
// ============================================================================

export async function createOrder(order: {
  tenantId: string;
  customerId?: string;
  agentId?: string;
  amount: number;
  currency?: string;
  externalId?: string;
  status?: string;
  items?: any[];
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      tenant_id: order.tenantId,
      customer_id: order.customerId,
      agent_id: order.agentId,
      amount: order.amount,
      currency: order.currency || 'USD',
      external_id: order.externalId,
      status: order.status || 'pending',
      items: order.items || [],
      metadata: order.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listOrders(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updateOrder(orderId: string, updates: any) {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// PAYMENTS OPERATIONS
// ============================================================================

export async function createPayment(payment: {
  tenantId: string;
  customerId?: string;
  orderId?: string;
  amount: number;
  currency?: string;
  externalId?: string;
  status?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      tenant_id: payment.tenantId,
      customer_id: payment.customerId,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency || 'USD',
      external_id: payment.externalId,
      status: payment.status || 'pending',
      payment_method: payment.paymentMethod,
      metadata: payment.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getPayment(paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listPayments(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updatePayment(paymentId: string, updates: any) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// INVOICES OPERATIONS
// ============================================================================

export async function createInvoice(invoice: {
  tenantId: string;
  customerId?: string;
  invoiceNumber?: string;
  amount: number;
  amountDue: number;
  currency?: string;
  externalId?: string;
  status?: string;
  dueDate?: Date;
  lineItems?: any[];
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      tenant_id: invoice.tenantId,
      customer_id: invoice.customerId,
      invoice_number: invoice.invoiceNumber,
      amount: invoice.amount,
      amount_due: invoice.amountDue,
      currency: invoice.currency || 'USD',
      external_id: invoice.externalId,
      status: invoice.status || 'draft',
      due_date: invoice.dueDate?.toISOString(),
      line_items: invoice.lineItems || [],
      metadata: invoice.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getInvoice(invoiceId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listInvoices(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updateInvoice(invoiceId: string, updates: any) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteInvoice(invoiceId: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// DISPUTES OPERATIONS
// ============================================================================

export async function createDispute(dispute: {
  tenantId: string;
  paymentId?: string;
  customerId?: string;
  amount: number;
  currency?: string;
  externalId?: string;
  status?: string;
  reason?: string;
  evidence?: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('disputes')
    .insert({
      tenant_id: dispute.tenantId,
      payment_id: dispute.paymentId,
      customer_id: dispute.customerId,
      amount: dispute.amount,
      currency: dispute.currency || 'USD',
      external_id: dispute.externalId,
      status: dispute.status || 'open',
      reason: dispute.reason,
      evidence: dispute.evidence || {},
      metadata: dispute.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDispute(disputeId: string) {
  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('id', disputeId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function listDisputes(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function updateDispute(disputeId: string, updates: any) {
  const { data, error } = await supabase
    .from('disputes')
    .update(updates)
    .eq('id', disputeId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// CREDITS OPERATIONS
// ============================================================================

export async function createCredit(credit: {
  tenantId: string;
  customerId: string;
  amount: number;
  remainingAmount?: number;
  currency?: string;
  externalId?: string;
  status?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('credits')
    .insert({
      tenant_id: credit.tenantId,
      customer_id: credit.customerId,
      amount: credit.amount,
      remaining_amount: credit.remainingAmount ?? credit.amount,
      currency: credit.currency || 'USD',
      external_id: credit.externalId,
      status: credit.status || 'active',
      expires_at: credit.expiresAt?.toISOString(),
      metadata: credit.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCredit(creditId: string) {
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('id', creditId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getCreditBalance(customerId: string) {
  const { data, error } = await supabase
    .from('credits')
    .select('remaining_amount')
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .gt('remaining_amount', 0);
  
  if (error) throw error;
  
  const total = (data || []).reduce((sum, credit) => sum + parseFloat(credit.remaining_amount), 0);
  return { balance: total };
}

export async function listCredits(tenantId: string, options: { limit?: number; offset?: number } = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

export async function deleteCredit(creditId: string) {
  const { error } = await supabase
    .from('credits')
    .delete()
    .eq('id', creditId);
  
  if (error) throw error;
  return true;
}

// ============================================================================
// COSTS OPERATIONS
// ============================================================================

export async function recordCost(cost: {
  tenantId: string;
  agentId?: string;
  customerId?: string;
  orderId?: string;
  costType: string;
  amount: number;
  currency?: string;
  quantity?: number;
  unit?: string;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('costs')
    .insert({
      tenant_id: cost.tenantId,
      agent_id: cost.agentId,
      customer_id: cost.customerId,
      order_id: cost.orderId,
      cost_type: cost.costType,
      amount: cost.amount,
      currency: cost.currency || 'USD',
      quantity: cost.quantity,
      unit: cost.unit,
      metadata: cost.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCosts(tenantId: string, options: {
  startDate?: Date;
  endDate?: Date;
  agentId?: string;
  customerId?: string;
  costType?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { limit = 100, offset = 0, startDate, endDate, agentId, customerId, costType } = options;
  
  let query = supabase
    .from('costs')
    .select('*')
    .eq('tenant_id', tenantId);
  
  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }
  
  if (agentId) {
    query = query.eq('agent_id', agentId);
  }
  
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  
  if (costType) {
    query = query.eq('cost_type', costType);
  }
  
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// ============================================================================
// USAGE SIGNALS OPERATIONS
// ============================================================================

export async function recordUsageSignal(signal: {
  tenantId: string;
  agentId?: string;
  customerId?: string;
  eventType: string;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('usage_signals')
    .insert({
      tenant_id: signal.tenantId,
      agent_id: signal.agentId,
      customer_id: signal.customerId,
      event_type: signal.eventType,
      properties: signal.properties || {},
      metadata: signal.metadata || {},
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
