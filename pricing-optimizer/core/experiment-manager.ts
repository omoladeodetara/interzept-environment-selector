/**
 * Experiment Manager Module
 * 
 * Manages A/B testing experiments including creation, activation,
 * variant management, and result aggregation.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Experiment,
  ExperimentVariant,
  ExperimentResults,
  ExperimentStatus,
  VariantMetrics,
  CreateExperimentRequest,
  UpdateExperimentRequest,
  AddVariantRequest,
  ValidationError,
  NotFoundError,
} from './types';
import { calculateStatisticalSignificance } from './price-calculator';

// In-memory storage (replace with database in production)
const experiments: Map<string, Experiment> = new Map();
const experimentMetrics: Map<string, Map<string, VariantMetrics>> = new Map();

/**
 * Create a new pricing experiment
 */
export function createExperiment(
  tenantId: string,
  request: CreateExperimentRequest
): Experiment {
  if (!request.name || request.name.trim() === '') {
    throw new ValidationError('Experiment name is required');
  }

  if (!request.variants || request.variants.length < 2) {
    throw new ValidationError('At least 2 variants are required');
  }

  // Validate variants
  for (const variant of request.variants) {
    if (!variant.name || variant.name.trim() === '') {
      throw new ValidationError('Variant name is required');
    }
    if (typeof variant.price !== 'number' || variant.price <= 0) {
      throw new ValidationError('Variant price must be a positive number');
    }
  }

  // Calculate default weights if not provided
  const totalVariants = request.variants.length;
  const defaultWeight = 100 / totalVariants;

  const variants: ExperimentVariant[] = request.variants.map((v, index) => ({
    id: uuidv4(),
    name: v.name,
    price: v.price,
    weight: v.weight ?? defaultWeight,
  }));

  // Validate weights sum to 100
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new ValidationError('Variant weights must sum to 100');
  }

  const experiment: Experiment = {
    id: uuidv4(),
    tenantId,
    name: request.name.trim(),
    description: request.description?.trim(),
    status: 'draft',
    variants,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  experiments.set(experiment.id, experiment);

  // Initialize metrics for each variant
  const variantMetrics = new Map<string, VariantMetrics>();
  for (const variant of variants) {
    variantMetrics.set(variant.id, {
      variantId: variant.id,
      variantName: variant.name,
      price: variant.price,
      views: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      revenuePerView: 0,
    });
  }
  experimentMetrics.set(experiment.id, variantMetrics);

  return experiment;
}

/**
 * Get experiment by ID
 */
export function getExperiment(experimentId: string, tenantId?: string): Experiment {
  const experiment = experiments.get(experimentId);
  
  if (!experiment) {
    throw new NotFoundError('Experiment');
  }

  if (tenantId && experiment.tenantId !== tenantId) {
    throw new NotFoundError('Experiment');
  }

  return experiment;
}

/**
 * List experiments for a tenant
 */
export function listExperiments(
  tenantId: string,
  options: { status?: ExperimentStatus; limit?: number; offset?: number } = {}
): { experiments: Experiment[]; total: number } {
  let results = Array.from(experiments.values())
    .filter(e => e.tenantId === tenantId);

  if (options.status) {
    results = results.filter(e => e.status === options.status);
  }

  // Sort by created date descending
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = results.length;
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 10;

  return {
    experiments: results.slice(offset, offset + limit),
    total,
  };
}

/**
 * Update experiment
 */
export function updateExperiment(
  experimentId: string,
  tenantId: string,
  updates: UpdateExperimentRequest
): Experiment {
  const experiment = getExperiment(experimentId, tenantId);

  // Can only update certain fields based on status
  if (experiment.status === 'completed') {
    throw new ValidationError('Cannot update a completed experiment');
  }

  if (updates.name !== undefined) {
    experiment.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    experiment.description = updates.description.trim();
  }

  if (updates.status !== undefined) {
    validateStatusTransition(experiment.status, updates.status);
    experiment.status = updates.status;
  }

  experiment.updatedAt = new Date();
  experiments.set(experimentId, experiment);

  return experiment;
}

/**
 * Add a variant to an experiment
 */
export function addVariant(
  experimentId: string,
  tenantId: string,
  request: AddVariantRequest
): ExperimentVariant {
  const experiment = getExperiment(experimentId, tenantId);

  if (experiment.status !== 'draft') {
    throw new ValidationError('Can only add variants to draft experiments');
  }

  if (!request.name || request.name.trim() === '') {
    throw new ValidationError('Variant name is required');
  }

  if (typeof request.price !== 'number' || request.price <= 0) {
    throw new ValidationError('Variant price must be a positive number');
  }

  const variant: ExperimentVariant = {
    id: uuidv4(),
    name: request.name.trim(),
    price: request.price,
    weight: request.weight ?? 0,
  };

  experiment.variants.push(variant);
  experiment.updatedAt = new Date();

  // Rebalance weights
  rebalanceWeights(experiment);

  experiments.set(experimentId, experiment);

  // Initialize metrics for new variant
  const metrics = experimentMetrics.get(experimentId);
  if (metrics) {
    metrics.set(variant.id, {
      variantId: variant.id,
      variantName: variant.name,
      price: variant.price,
      views: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      revenuePerView: 0,
    });
  }

  return variant;
}

/**
 * Activate an experiment
 */
export function activateExperiment(experimentId: string, tenantId: string): Experiment {
  const experiment = getExperiment(experimentId, tenantId);

  if (experiment.status !== 'draft' && experiment.status !== 'paused') {
    throw new ValidationError(
      `Cannot activate experiment with status "${experiment.status}"`
    );
  }

  if (experiment.variants.length < 2) {
    throw new ValidationError('Experiment must have at least 2 variants');
  }

  experiment.status = 'active';
  experiment.startDate = experiment.startDate ?? new Date();
  experiment.updatedAt = new Date();

  experiments.set(experimentId, experiment);

  return experiment;
}

/**
 * Stop an experiment
 */
export function stopExperiment(experimentId: string, tenantId: string): Experiment {
  const experiment = getExperiment(experimentId, tenantId);

  if (experiment.status !== 'active' && experiment.status !== 'paused') {
    throw new ValidationError(
      `Cannot stop experiment with status "${experiment.status}"`
    );
  }

  experiment.status = 'completed';
  experiment.endDate = new Date();
  experiment.updatedAt = new Date();

  experiments.set(experimentId, experiment);

  return experiment;
}

/**
 * Assign a user to a variant based on consistent hashing
 */
export function assignVariant(
  experimentId: string,
  userId: string
): ExperimentVariant | null {
  const experiment = experiments.get(experimentId);

  if (!experiment || experiment.status !== 'active') {
    return null;
  }

  // Consistent hash based on userId + experimentId
  const hash = simpleHash(`${userId}:${experimentId}`);
  const bucket = hash % 100;

  // Assign based on weight distribution
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) {
      return variant;
    }
  }

  // Fallback to first variant
  return experiment.variants[0];
}

/**
 * Record a view for a variant
 */
export function recordView(experimentId: string, variantId: string): void {
  const metrics = experimentMetrics.get(experimentId);
  if (!metrics) return;

  const variantMetrics = metrics.get(variantId);
  if (!variantMetrics) return;

  variantMetrics.views++;
  updateDerivedMetrics(variantMetrics);
}

/**
 * Record a conversion for a variant
 */
export function recordConversion(
  experimentId: string,
  variantId: string,
  revenue: number
): void {
  const metrics = experimentMetrics.get(experimentId);
  if (!metrics) return;

  const variantMetrics = metrics.get(variantId);
  if (!variantMetrics) return;

  variantMetrics.conversions++;
  variantMetrics.revenue += revenue;
  updateDerivedMetrics(variantMetrics);
}

/**
 * Get experiment results
 */
export function getExperimentResults(
  experimentId: string,
  tenantId?: string
): ExperimentResults {
  const experiment = getExperiment(experimentId, tenantId);
  const metrics = experimentMetrics.get(experimentId);

  if (!metrics) {
    throw new NotFoundError('Experiment metrics');
  }

  const variants: { [variantId: string]: VariantMetrics } = {};
  let totalViews = 0;
  let totalConversions = 0;
  let totalRevenue = 0;
  let maxRevenue = 0;
  let winningVariantId: string | undefined;

  for (const [variantId, variantMetrics] of metrics) {
    variants[variantId] = { ...variantMetrics };
    totalViews += variantMetrics.views;
    totalConversions += variantMetrics.conversions;
    totalRevenue += variantMetrics.revenue;

    if (variantMetrics.revenue > maxRevenue) {
      maxRevenue = variantMetrics.revenue;
      winningVariantId = variantId;
    }
  }

  // Calculate statistical significance between top 2 variants
  let statisticalSignificance: number | undefined;
  const variantList = Array.from(metrics.values());
  if (variantList.length >= 2) {
    const sorted = variantList.sort((a, b) => b.revenue - a.revenue);
    const pValue = calculateStatisticalSignificance(sorted[1], sorted[0]);
    statisticalSignificance = 1 - pValue;
  }

  return {
    experimentId,
    variants,
    summary: {
      totalViews,
      totalConversions,
      totalRevenue,
      winningVariant: winningVariantId,
      statisticalSignificance,
    },
  };
}

/**
 * Delete an experiment
 */
export function deleteExperiment(experimentId: string, tenantId: string): void {
  const experiment = getExperiment(experimentId, tenantId);

  if (experiment.status === 'active') {
    throw new ValidationError('Cannot delete an active experiment');
  }

  experiments.delete(experimentId);
  experimentMetrics.delete(experimentId);
}

// Helper functions

function validateStatusTransition(from: ExperimentStatus, to: ExperimentStatus): void {
  const validTransitions: Record<ExperimentStatus, ExperimentStatus[]> = {
    draft: ['active'],
    active: ['paused', 'completed'],
    paused: ['active', 'completed'],
    completed: [],
  };

  if (!validTransitions[from].includes(to)) {
    throw new ValidationError(
      `Invalid status transition from "${from}" to "${to}"`
    );
  }
}

function rebalanceWeights(experiment: Experiment): void {
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  
  if (totalWeight !== 100) {
    const newWeight = 100 / experiment.variants.length;
    for (const variant of experiment.variants) {
      variant.weight = newWeight;
    }
  }
}

function updateDerivedMetrics(metrics: VariantMetrics): void {
  metrics.conversionRate = metrics.views > 0 ? metrics.conversions / metrics.views : 0;
  metrics.averageOrderValue = metrics.conversions > 0 ? metrics.revenue / metrics.conversions : 0;
  metrics.revenuePerView = metrics.views > 0 ? metrics.revenue / metrics.views : 0;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Clear all experiments (for testing)
 */
export function clearAllExperiments(): void {
  experiments.clear();
  experimentMetrics.clear();
}
