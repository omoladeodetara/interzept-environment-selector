/**
 * Billing Module
 *
 * Calculate charges for managed mode tenants based on usage.
 */

import { PlanType, TenantUsageSummary } from './types';
import { getTenant } from './tenant-manager';
import { getTenantUsageSummary } from './usage-tracker';

// Plan pricing configuration
interface PlanPricing {
  monthlyBase: number;
  includedUsage: number;
  overageRatePer1000: number;
  features: string[];
}

const PLAN_PRICING: Record<PlanType, PlanPricing> = {
  free: {
    monthlyBase: 0,
    includedUsage: 1000,
    overageRatePer1000: 0,
    features: [
      'Up to 1,000 signals/month',
      '1 active experiment',
      'Basic analytics',
      'Community support',
    ],
  },
  starter: {
    monthlyBase: 29,
    includedUsage: 10000,
    overageRatePer1000: 0.1,
    features: [
      'Up to 10,000 signals/month',
      '5 active experiments',
      'Advanced analytics',
      'Email support',
      'API access',
    ],
  },
  pro: {
    monthlyBase: 99,
    includedUsage: 100000,
    overageRatePer1000: 0.05,
    features: [
      'Up to 100,000 signals/month',
      'Unlimited experiments',
      'Full analytics suite',
      'Priority support',
      'API access',
      'Webhooks',
      'Custom integrations',
    ],
  },
  enterprise: {
    monthlyBase: 499,
    includedUsage: 1000000,
    overageRatePer1000: 0.02,
    features: [
      'Up to 1,000,000 signals/month',
      'Unlimited experiments',
      'Full analytics suite',
      'Dedicated support',
      'API access',
      'Webhooks',
      'Custom integrations',
      'SLA guarantees',
      'Custom contracts',
    ],
  },
};

/**
 * Get pricing details for a plan
 */
export function getPlanPricing(plan: PlanType): PlanPricing {
  return PLAN_PRICING[plan];
}

/**
 * Get all available plans with pricing
 */
export function getAllPlans(): Record<PlanType, PlanPricing> {
  return { ...PLAN_PRICING };
}

/**
 * Calculate monthly bill for a tenant
 */
export function calculateMonthlyBill(
  tenantId: string,
  billingPeriodStart: Date,
  billingPeriodEnd: Date
): {
  tenantId: string;
  plan: PlanType;
  billingPeriod: { start: Date; end: Date };
  baseCost: number;
  usageSummary: TenantUsageSummary;
  overageCharges: number;
  totalAmount: number;
  lineItems: Array<{ description: string; amount: number }>;
} {
  const tenant = getTenant(tenantId);
  const usageSummary = getTenantUsageSummary(tenantId, billingPeriodStart, billingPeriodEnd);
  const planPricing = PLAN_PRICING[tenant.plan];

  const lineItems: Array<{ description: string; amount: number }> = [];

  lineItems.push({
    description: `${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan - Monthly`,
    amount: planPricing.monthlyBase,
  });

  let overageCharges = 0;
  if (usageSummary.overage > 0 && planPricing.overageRatePer1000 > 0) {
    overageCharges = (usageSummary.overage / 1000) * planPricing.overageRatePer1000;
    lineItems.push({
      description: `Overage: ${usageSummary.overage.toLocaleString()} additional signals`,
      amount: overageCharges,
    });
  }

  const totalAmount = planPricing.monthlyBase + overageCharges;

  return {
    tenantId,
    plan: tenant.plan,
    billingPeriod: { start: billingPeriodStart, end: billingPeriodEnd },
    baseCost: planPricing.monthlyBase,
    usageSummary,
    overageCharges,
    totalAmount,
    lineItems,
  };
}

/**
 * Estimate monthly cost based on projected usage
 */
export function estimateMonthlyCost(plan: PlanType, projectedUsage: number): number {
  const pricing = PLAN_PRICING[plan];
  const overage = Math.max(0, projectedUsage - pricing.includedUsage);
  const overageCharges = (overage / 1000) * pricing.overageRatePer1000;
  return pricing.monthlyBase + overageCharges;
}

/**
 * Get recommended plan based on projected usage
 */
export function recommendPlan(projectedMonthlyUsage: number): {
  recommended: PlanType;
  estimatedCost: number;
  alternatives: Array<{ plan: PlanType; cost: number }>;
} {
  const plans: PlanType[] = ['free', 'starter', 'pro', 'enterprise'];
  const costs = plans.map((plan) => ({
    plan,
    cost: estimateMonthlyCost(plan, projectedMonthlyUsage),
  }));

  // Find cheapest plan that can handle the usage
  costs.sort((a, b) => a.cost - b.cost);

  // Filter out free plan if usage exceeds limit (no overage allowed)
  const viable = costs.filter((c) => {
    if (c.plan === 'free' && projectedMonthlyUsage > PLAN_PRICING.free.includedUsage) {
      return false;
    }
    return true;
  });

  const recommended = viable[0] || costs[0];

  return {
    recommended: recommended.plan,
    estimatedCost: recommended.cost,
    alternatives: costs.filter((c) => c.plan !== recommended.plan),
  };
}
