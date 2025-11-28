/**
 * Price Calculator Module
 * 
 * Handles price elasticity calculations and related statistical analysis
 * for A/B test results.
 */

import { ElasticityAnalysis, VariantMetrics, ValidationError } from './types';

/**
 * Calculate price elasticity of demand from A/B test results
 * 
 * Formula: % change in quantity / % change in price
 * 
 * @param controlData - Metrics from the control variant
 * @param experimentData - Metrics from the experiment variant
 * @returns Elasticity value (negative indicates inverse relationship)
 */
export function calculateElasticity(
  controlData: { price: number; conversions: number; views: number },
  experimentData: { price: number; conversions: number; views: number }
): number {
  if (controlData.price <= 0 || experimentData.price <= 0) {
    throw new ValidationError('Prices must be positive values');
  }

  if (controlData.views <= 0 || experimentData.views <= 0) {
    throw new ValidationError('Views must be positive values');
  }

  // Calculate conversion rates
  const controlConversionRate = controlData.conversions / controlData.views;
  const experimentConversionRate = experimentData.conversions / experimentData.views;

  // Calculate percentage changes
  const priceChange = (experimentData.price - controlData.price) / controlData.price;
  const conversionChange = (experimentConversionRate - controlConversionRate) / controlConversionRate;

  // Avoid division by zero
  if (Math.abs(priceChange) < 0.0001) {
    return 0; // No meaningful price change
  }

  // Elasticity = % change in quantity / % change in price
  const elasticity = conversionChange / priceChange;

  return elasticity;
}

/**
 * Perform comprehensive elasticity analysis with confidence intervals
 * 
 * @param controlData - Metrics from the control variant
 * @param experimentData - Metrics from the experiment variant
 * @returns Full elasticity analysis including interpretation
 */
export function analyzeElasticity(
  controlData: { price: number; conversions: number; views: number },
  experimentData: { price: number; conversions: number; views: number }
): ElasticityAnalysis {
  const elasticity = calculateElasticity(controlData, experimentData);
  const absElasticity = Math.abs(elasticity);
  
  // Determine interpretation
  let interpretation: 'elastic' | 'inelastic' | 'unit_elastic';
  if (absElasticity > 1.05) {
    interpretation = 'elastic';
  } else if (absElasticity < 0.95) {
    interpretation = 'inelastic';
  } else {
    interpretation = 'unit_elastic';
  }

  // Calculate sample size for confidence
  const sampleSize = controlData.views + experimentData.views;

  // Simple confidence interval estimation
  // Using approximation based on sample size
  const standardError = 1 / Math.sqrt(sampleSize);
  const zScore = 1.96; // 95% confidence

  return {
    elasticity,
    interpretation,
    confidenceInterval: {
      lower: elasticity - zScore * standardError,
      upper: elasticity + zScore * standardError,
    },
    sampleSize,
  };
}

/**
 * Calculate optimal price based on elasticity and current metrics
 * 
 * Uses the formula: Optimal Price = MC × (E / (E + 1))
 * where MC is marginal cost and E is price elasticity
 * 
 * For simplicity, we use current price as a proxy when MC is unknown
 * 
 * @param currentPrice - Current price point
 * @param elasticity - Calculated price elasticity
 * @param targetMargin - Optional target profit margin (0-1)
 * @returns Recommended optimal price
 */
export function calculateOptimalPrice(
  currentPrice: number,
  elasticity: number,
  targetMargin?: number
): number {
  if (currentPrice <= 0) {
    throw new ValidationError('Current price must be positive');
  }

  const absElasticity = Math.abs(elasticity);

  // If demand is inelastic (|E| < 1), we can raise prices
  // If demand is elastic (|E| > 1), we should consider lowering prices
  
  let priceFactor: number;
  
  if (absElasticity < 0.5) {
    // Very inelastic - significant room for price increase
    priceFactor = 1.15;
  } else if (absElasticity < 1) {
    // Inelastic - moderate room for increase
    priceFactor = 1.08;
  } else if (absElasticity < 1.5) {
    // Slightly elastic - small adjustments
    priceFactor = 1.0;
  } else if (absElasticity < 2) {
    // Elastic - consider slight decrease
    priceFactor = 0.95;
  } else {
    // Very elastic - room for price decrease to gain volume
    priceFactor = 0.90;
  }

  let optimalPrice = currentPrice * priceFactor;

  // Apply target margin constraint if provided
  if (targetMargin !== undefined && targetMargin > 0 && targetMargin < 1) {
    const minPriceForMargin = currentPrice * (1 - targetMargin);
    optimalPrice = Math.max(optimalPrice, minPriceForMargin);
  }

  // Round to psychological pricing
  optimalPrice = applyPsychologicalPricing(optimalPrice);

  return optimalPrice;
}

/**
 * Apply psychological pricing principles
 * Rounds to .99 or .95 endings based on price level
 * 
 * @param price - Raw price value
 * @returns Price adjusted for psychological impact
 */
export function applyPsychologicalPricing(price: number): number {
  if (price <= 0) {
    return price;
  }

  if (price < 10) {
    // For low prices, use .99
    return Math.floor(price) + 0.99;
  } else if (price < 100) {
    // For medium prices, round to nearest .99
    return Math.round(price) - 0.01;
  } else {
    // For higher prices, round to nearest $5 - $1
    const roundedTo5 = Math.round(price / 5) * 5;
    return roundedTo5 - 1;
  }
}

/**
 * Calculate revenue impact of a price change
 * 
 * @param currentPrice - Current price
 * @param newPrice - Proposed new price
 * @param currentConversions - Current conversion count
 * @param elasticity - Price elasticity of demand
 * @returns Expected revenue change as percentage
 */
export function calculateRevenueImpact(
  currentPrice: number,
  newPrice: number,
  currentConversions: number,
  elasticity: number
): number {
  if (currentPrice <= 0 || currentConversions <= 0) {
    return 0;
  }

  const priceChangePercent = (newPrice - currentPrice) / currentPrice;
  const expectedConversionChange = priceChangePercent * elasticity;
  
  const expectedNewConversions = currentConversions * (1 + expectedConversionChange);
  
  const currentRevenue = currentPrice * currentConversions;
  const expectedNewRevenue = newPrice * expectedNewConversions;
  
  const revenueImpact = ((expectedNewRevenue - currentRevenue) / currentRevenue) * 100;
  
  return revenueImpact;
}

/**
 * Calculate statistical significance using z-test
 * 
 * @param control - Control variant metrics
 * @param experiment - Experiment variant metrics
 * @returns p-value for the difference
 */
export function calculateStatisticalSignificance(
  control: VariantMetrics,
  experiment: VariantMetrics
): number {
  if (control.views === 0 || experiment.views === 0) {
    return 1; // Not significant
  }

  const p1 = control.conversionRate;
  const p2 = experiment.conversionRate;
  const n1 = control.views;
  const n2 = experiment.views;

  // Pooled proportion
  const pooledP = (control.conversions + experiment.conversions) / (n1 + n2);
  
  // Standard error
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  
  if (se === 0) {
    return 1;
  }

  // Z-score
  const z = Math.abs(p2 - p1) / se;
  
  // Approximate p-value using normal distribution
  // Using a simplified approximation
  const pValue = 2 * (1 - normalCDF(z));
  
  return pValue;
}

/**
 * Standard normal cumulative distribution function approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
