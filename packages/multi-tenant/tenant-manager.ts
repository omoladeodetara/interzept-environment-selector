/**
 * Tenant Manager Module
 *
 * Manages customer accounts and their configurations.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TenantConfig,
  PlanType,
  TenantMode,
  ProviderType,
  ValidationError,
  NotFoundError,
} from './types';

// In-memory storage (replace with database in production)
const tenants: Map<string, TenantConfig> = new Map();

// Plan limits
const PLAN_LIMITS: Record<PlanType, number> = {
  free: 1000,
  starter: 10000,
  pro: 100000,
  enterprise: 999999999,
};

/**
 * Create a new tenant
 */
export function createTenant(
  name: string,
  options: {
    plan?: PlanType;
    mode?: TenantMode;
    defaultProvider?: ProviderType;
  } = {}
): TenantConfig {
  if (!name || name.trim() === '') {
    throw new ValidationError('Tenant name is required');
  }

  const plan = options.plan ?? 'free';
  const mode = options.mode ?? 'managed';
  const defaultProvider = options.defaultProvider ?? 'paid-ai';

  const tenant: TenantConfig = {
    id: uuidv4(),
    name: name.trim(),
    plan,
    mode,
    usageLimit: PLAN_LIMITS[plan],
    currentUsage: 0,
    defaultProvider,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tenants.set(tenant.id, tenant);
  return tenant;
}

/**
 * Get a tenant by ID
 */
export function getTenant(tenantId: string): TenantConfig {
  const tenant = tenants.get(tenantId);
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  return tenant;
}

/**
 * List all tenants
 */
export function listTenants(
  options: { plan?: PlanType; mode?: TenantMode; limit?: number; offset?: number } = {}
): { tenants: TenantConfig[]; total: number } {
  let results = Array.from(tenants.values());

  if (options.plan) {
    results = results.filter((t) => t.plan === options.plan);
  }

  if (options.mode) {
    results = results.filter((t) => t.mode === options.mode);
  }

  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = results.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 10;

  return {
    tenants: results.slice(offset, offset + limit),
    total,
  };
}

/**
 * Update a tenant
 */
export function updateTenant(
  tenantId: string,
  updates: Partial<
    Pick<
      TenantConfig,
      'name' | 'plan' | 'mode' | 'defaultProvider' | 'webhookUrl' | 'paidApiKey' | 'paidApiBaseUrl'
    >
  >
): TenantConfig {
  const tenant = getTenant(tenantId);

  if (updates.name !== undefined) {
    if (!updates.name || updates.name.trim() === '') {
      throw new ValidationError('Tenant name cannot be empty');
    }
    tenant.name = updates.name.trim();
  }

  if (updates.plan !== undefined) {
    tenant.plan = updates.plan;
    tenant.usageLimit = PLAN_LIMITS[updates.plan];
  }

  if (updates.mode !== undefined) {
    tenant.mode = updates.mode;
  }

  if (updates.defaultProvider !== undefined) {
    tenant.defaultProvider = updates.defaultProvider;
  }

  if (updates.webhookUrl !== undefined) {
    tenant.webhookUrl = updates.webhookUrl;
  }

  if (updates.paidApiKey !== undefined) {
    tenant.paidApiKey = updates.paidApiKey;
  }

  if (updates.paidApiBaseUrl !== undefined) {
    tenant.paidApiBaseUrl = updates.paidApiBaseUrl;
  }

  tenant.updatedAt = new Date();
  tenants.set(tenantId, tenant);

  return tenant;
}

/**
 * Delete a tenant
 */
export function deleteTenant(tenantId: string): void {
  if (!tenants.has(tenantId)) {
    throw new NotFoundError('Tenant');
  }
  tenants.delete(tenantId);
}

/**
 * Switch tenant mode between BYOK and Managed
 */
export function switchMode(
  tenantId: string,
  mode: TenantMode,
  byokConfig?: { apiKey: string; baseUrl?: string }
): TenantConfig {
  const tenant = getTenant(tenantId);

  if (mode === 'byok') {
    if (!byokConfig?.apiKey) {
      throw new ValidationError('API key is required for BYOK mode');
    }
    tenant.paidApiKey = byokConfig.apiKey;
    tenant.paidApiBaseUrl = byokConfig.baseUrl;
  } else {
    tenant.paidApiKey = undefined;
    tenant.paidApiBaseUrl = undefined;
  }

  tenant.mode = mode;
  tenant.updatedAt = new Date();
  tenants.set(tenantId, tenant);

  return tenant;
}

/**
 * Upgrade or downgrade tenant plan
 */
export function changePlan(tenantId: string, newPlan: PlanType): TenantConfig {
  const tenant = getTenant(tenantId);

  tenant.plan = newPlan;
  tenant.usageLimit = PLAN_LIMITS[newPlan];
  tenant.updatedAt = new Date();

  tenants.set(tenantId, tenant);

  return tenant;
}

/**
 * Check if tenant has exceeded usage limit
 */
export function isUsageLimitExceeded(tenantId: string): boolean {
  const tenant = getTenant(tenantId);
  return tenant.currentUsage >= tenant.usageLimit;
}

/**
 * Get remaining usage for tenant
 */
export function getRemainingUsage(tenantId: string): number {
  const tenant = getTenant(tenantId);
  return Math.max(0, tenant.usageLimit - tenant.currentUsage);
}

/**
 * Reset tenant usage (for billing cycle reset)
 */
export function resetUsage(tenantId: string): TenantConfig {
  const tenant = getTenant(tenantId);
  tenant.currentUsage = 0;
  tenant.updatedAt = new Date();
  tenants.set(tenantId, tenant);
  return tenant;
}

/**
 * Increment tenant usage
 */
export function incrementUsage(tenantId: string, amount: number = 1): TenantConfig {
  const tenant = getTenant(tenantId);
  tenant.currentUsage += amount;
  tenant.updatedAt = new Date();
  tenants.set(tenantId, tenant);
  return tenant;
}

/**
 * Clear all tenants (for testing)
 */
export function clearAllTenants(): void {
  tenants.clear();
}

/**
 * Get plan limits
 */
export function getPlanLimits(): Record<PlanType, number> {
  return { ...PLAN_LIMITS };
}
