/**
 * Usage Tracker Module
 * 
 * Track usage per tenant for billing purposes in managed mode.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  UsageRecord,
  TenantUsageSummary,
  ValidationError,
} from '../core/types';
import { getTenant, incrementUsage } from './tenant-manager';

// In-memory storage (replace with database in production)
const usageRecords: Map<string, UsageRecord[]> = new Map();

/**
 * Track usage for a tenant
 */
export async function trackTenantUsage(
  tenantId: string,
  usageType: 'signal' | 'api_call',
  metadata: Record<string, unknown> = {}
): Promise<UsageRecord> {
  // Validate tenant exists
  getTenant(tenantId);

  const record: UsageRecord = {
    id: uuidv4(),
    tenantId,
    usageType,
    count: 1,
    metadata,
    timestamp: new Date(),
  };

  // Store the record
  if (!usageRecords.has(tenantId)) {
    usageRecords.set(tenantId, []);
  }
  usageRecords.get(tenantId)!.push(record);

  // Update tenant's current usage
  incrementUsage(tenantId, 1);

  return record;
}

/**
 * Track batch usage (multiple events at once)
 */
export async function trackBatchUsage(
  tenantId: string,
  usageType: 'signal' | 'api_call',
  count: number,
  metadata: Record<string, unknown> = {}
): Promise<UsageRecord> {
  if (count <= 0) {
    throw new ValidationError('Count must be a positive number');
  }

  // Validate tenant exists
  getTenant(tenantId);

  const record: UsageRecord = {
    id: uuidv4(),
    tenantId,
    usageType,
    count,
    metadata,
    timestamp: new Date(),
  };

  // Store the record
  if (!usageRecords.has(tenantId)) {
    usageRecords.set(tenantId, []);
  }
  usageRecords.get(tenantId)!.push(record);

  // Update tenant's current usage
  incrementUsage(tenantId, count);

  return record;
}

/**
 * Get usage summary for a tenant within a period
 */
export function getTenantUsageSummary(
  tenantId: string,
  startDate: Date,
  endDate: Date
): TenantUsageSummary {
  const tenant = getTenant(tenantId);
  const records = usageRecords.get(tenantId) || [];

  // Filter records within the period
  const periodRecords = records.filter(
    r => r.timestamp >= startDate && r.timestamp <= endDate
  );

  // Calculate totals
  let signals = 0;
  let apiCalls = 0;

  for (const record of periodRecords) {
    if (record.usageType === 'signal') {
      signals += record.count;
    } else if (record.usageType === 'api_call') {
      apiCalls += record.count;
    }
  }

  const totalUsage = signals + apiCalls;
  const overage = Math.max(0, totalUsage - tenant.usageLimit);

  return {
    tenantId,
    period: {
      start: startDate,
      end: endDate,
    },
    signals,
    apiCalls,
    totalUsage,
    limit: tenant.usageLimit,
    overage,
    overageCharges: calculateOverageCharges(overage, tenant.plan),
  };
}

/**
 * Calculate overage charges based on plan and overage amount
 */
function calculateOverageCharges(overage: number, plan: string): number {
  if (overage <= 0) return 0;

  // Overage rates per 1000 units
  const rates: Record<string, number> = {
    free: 0, // Free plan doesn't allow overage
    starter: 0.10, // $0.10 per 1000
    pro: 0.05, // $0.05 per 1000
    enterprise: 0.02, // $0.02 per 1000
  };

  const rate = rates[plan] ?? 0.10;
  return (overage / 1000) * rate;
}

/**
 * Get detailed usage records for a tenant
 */
export function getTenantUsageRecords(
  tenantId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    usageType?: 'signal' | 'api_call';
    limit?: number;
    offset?: number;
  } = {}
): { records: UsageRecord[]; total: number } {
  const records = usageRecords.get(tenantId) || [];

  let filtered = [...records];

  // Apply filters
  if (options.startDate) {
    filtered = filtered.filter(r => r.timestamp >= options.startDate!);
  }

  if (options.endDate) {
    filtered = filtered.filter(r => r.timestamp <= options.endDate!);
  }

  if (options.usageType) {
    filtered = filtered.filter(r => r.usageType === options.usageType);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const total = filtered.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 100;

  return {
    records: filtered.slice(offset, offset + limit),
    total,
  };
}

/**
 * Get usage trend data for a tenant
 */
export function getTenantUsageTrend(
  tenantId: string,
  days: number = 30
): Array<{ date: string; signals: number; apiCalls: number }> {
  const records = usageRecords.get(tenantId) || [];
  const trend: Map<string, { signals: number; apiCalls: number }> = new Map();

  // Initialize all days
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    trend.set(dateStr, { signals: 0, apiCalls: 0 });
  }

  // Aggregate records
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  for (const record of records) {
    if (record.timestamp >= startDate) {
      const dateStr = record.timestamp.toISOString().split('T')[0];
      const dayData = trend.get(dateStr);
      if (dayData) {
        if (record.usageType === 'signal') {
          dayData.signals += record.count;
        } else {
          dayData.apiCalls += record.count;
        }
      }
    }
  }

  // Convert to array and sort by date
  return Array.from(trend.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check if tenant is approaching usage limit
 */
export function isApproachingLimit(
  tenantId: string,
  threshold: number = 0.8
): { approaching: boolean; percentUsed: number } {
  const tenant = getTenant(tenantId);
  const percentUsed = tenant.currentUsage / tenant.usageLimit;

  return {
    approaching: percentUsed >= threshold,
    percentUsed: Math.min(percentUsed, 1) * 100,
  };
}

/**
 * Clear usage records for a tenant (for testing)
 */
export function clearTenantUsageRecords(tenantId: string): void {
  usageRecords.delete(tenantId);
}

/**
 * Clear all usage records (for testing)
 */
export function clearAllUsageRecords(): void {
  usageRecords.clear();
}
