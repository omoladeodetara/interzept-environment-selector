/**
 * Billing Module
 * 
 * Calculate charges for managed mode tenants based on usage.
 */

import {
  TenantUsageSummary,
  PlanType,
  ValidationError,
} from '../core/types';
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
    overageRatePer1000: 0, // No overage allowed
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
    overageRatePer1000: 0.10,
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

  // Base subscription cost
  lineItems.push({
    description: `${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan - Monthly`,
    amount: planPricing.monthlyBase,
  });

  // Calculate overage
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
export function estimateMonthlyCost(
  plan: PlanType,
  projectedUsage: number
): {
  plan: PlanType;
  baseCost: number;
  projectedOverage: number;
  overageCharges: number;
  totalEstimate: number;
} {
  const planPricing = PLAN_PRICING[plan];
  const projectedOverage = Math.max(0, projectedUsage - planPricing.includedUsage);
  const overageCharges = (projectedOverage / 1000) * planPricing.overageRatePer1000;

  return {
    plan,
    baseCost: planPricing.monthlyBase,
    projectedOverage,
    overageCharges,
    totalEstimate: planPricing.monthlyBase + overageCharges,
  };
}

/**
 * Recommend a plan based on usage
 */
export function recommendPlan(
  projectedMonthlyUsage: number
): {
  recommendedPlan: PlanType;
  reason: string;
  estimatedMonthlyCost: number;
  alternatives: Array<{
    plan: PlanType;
    estimatedCost: number;
    savings: number;
  }>;
} {
  const estimates = (Object.keys(PLAN_PRICING) as PlanType[]).map(planType => {
    const estimate = estimateMonthlyCost(planType, projectedMonthlyUsage);
    return {
      planType,
      ...estimate,
    };
  });

  // Sort by total cost
  estimates.sort((a, b) => a.totalEstimate - b.totalEstimate);

  // Find the most cost-effective plan that can handle the usage
  let recommendedPlan: PlanType = 'free';
  let reason = '';

  if (projectedMonthlyUsage <= 1000) {
    recommendedPlan = 'free';
    reason = 'Your usage fits within the free tier.';
  } else if (projectedMonthlyUsage <= 10000) {
    recommendedPlan = 'starter';
    reason = 'Starter plan provides the best value for your usage level.';
  } else if (projectedMonthlyUsage <= 100000) {
    recommendedPlan = 'pro';
    reason = 'Pro plan offers better rates for your high usage.';
  } else {
    recommendedPlan = 'enterprise';
    reason = 'Enterprise plan provides the best rates for your scale.';
  }

  const recommendedEstimate = estimates.find(e => e.planType === recommendedPlan)!;

  // Calculate alternatives
  const alternatives = estimates
    .filter(e => e.planType !== recommendedPlan)
    .map(e => ({
      plan: e.planType,
      estimatedCost: e.totalEstimate,
      savings: e.totalEstimate - recommendedEstimate.totalEstimate,
    }));

  return {
    recommendedPlan,
    reason,
    estimatedMonthlyCost: recommendedEstimate.totalEstimate,
    alternatives,
  };
}

/**
 * Get billing history for a tenant (simplified)
 */
export function getBillingHistory(
  tenantId: string,
  months: number = 6
): Array<{
  period: { start: Date; end: Date };
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}> {
  // In production, this would query from a payments database
  // For now, return empty array
  getTenant(tenantId); // Validate tenant exists
  return [];
}

/**
 * Check if tenant can upgrade to a specific plan
 */
export function canUpgradeTo(tenantId: string, targetPlan: PlanType): {
  allowed: boolean;
  reason?: string;
} {
  const tenant = getTenant(tenantId);
  const planOrder: PlanType[] = ['free', 'starter', 'pro', 'enterprise'];
  
  const currentIndex = planOrder.indexOf(tenant.plan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (targetIndex <= currentIndex) {
    return {
      allowed: false,
      reason: 'Target plan is not an upgrade from current plan.',
    };
  }

  // In production, you might check payment method, account status, etc.
  return { allowed: true };
}

/**
 * Check if tenant can downgrade to a specific plan
 */
export function canDowngradeTo(tenantId: string, targetPlan: PlanType): {
  allowed: boolean;
  reason?: string;
} {
  const tenant = getTenant(tenantId);
  const planOrder: PlanType[] = ['free', 'starter', 'pro', 'enterprise'];
  
  const currentIndex = planOrder.indexOf(tenant.plan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (targetIndex >= currentIndex) {
    return {
      allowed: false,
      reason: 'Target plan is not a downgrade from current plan.',
    };
  }

  // Check if current usage exceeds target plan limit
  const targetLimit = PLAN_PRICING[targetPlan].includedUsage;
  if (tenant.currentUsage > targetLimit) {
    return {
      allowed: false,
      reason: `Current usage (${tenant.currentUsage}) exceeds ${targetPlan} plan limit (${targetLimit}).`,
    };
  }

  return { allowed: true };
}
