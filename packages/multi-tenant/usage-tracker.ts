/**
 * Usage Tracker Module
 *
 * Track usage per tenant for billing purposes in managed mode.
 */

import { v4 as uuidv4 } from 'uuid';
import { UsageRecord, TenantUsageSummary, ValidationError } from './types';
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
  getTenant(tenantId);

  const record: UsageRecord = {
    id: uuidv4(),
    tenantId,
    usageType,
    count: 1,
    metadata,
    timestamp: new Date(),
  };

  if (!usageRecords.has(tenantId)) {
    usageRecords.set(tenantId, []);
  }
  usageRecords.get(tenantId)!.push(record);

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

  getTenant(tenantId);

  const record: UsageRecord = {
    id: uuidv4(),
    tenantId,
    usageType,
    count,
    metadata,
    timestamp: new Date(),
  };

  if (!usageRecords.has(tenantId)) {
    usageRecords.set(tenantId, []);
  }
  usageRecords.get(tenantId)!.push(record);

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

  const periodRecords = records.filter(
    (r) => r.timestamp >= startDate && r.timestamp <= endDate
  );

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

  const rates: Record<string, number> = {
    free: 0,
    starter: 0.1,
    pro: 0.05,
    enterprise: 0.02,
  };

  const rate = rates[plan] ?? 0.1;
  return (overage / 1000) * rate;
}

/**
 * Get usage records for a tenant
 */
export function getTenantUsageRecords(
  tenantId: string,
  startDate?: Date,
  endDate?: Date
): UsageRecord[] {
  const records = usageRecords.get(tenantId) || [];

  if (!startDate && !endDate) {
    return [...records];
  }

  return records.filter((r) => {
    if (startDate && r.timestamp < startDate) return false;
    if (endDate && r.timestamp > endDate) return false;
    return true;
  });
}

/**
 * Clear usage records for a tenant
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
