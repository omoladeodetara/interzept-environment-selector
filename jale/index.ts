/**
 * Jale - Advanced Pricing Optimization Engine
 *
 * Responsibilities:
 * - Fetch experiment variants and results from Elo (ab-testing-server)
 * - Fetch historical data from Elo results endpoint
 * - Calculate price elasticity and statistical analysis
 * - Generate AI-powered pricing recommendations
 * - Return recommended price with simulation and reasoning
 *
 * This module combines core pricing optimization algorithms with experiment
 * data fetching to provide comprehensive pricing recommendations.
 */

import fetch from 'node-fetch';

const ELO_BASE = process.env.ELO_BASE_URL || 'http://localhost:3000'; // elo (ab-testing-server) base URL

// ==================== Type Definitions ====================

export type OptimizationObjective = 'revenue' | 'conversion' | 'profit' | 'market_share';

export interface PriceSimulation {
  price: number;
  estimatedCv: number;
  expectedRevenue: number;
}

export interface ObservedPoint {
  price: number;
  cv: number;
}

export interface ElasticityAnalysis {
  elasticity: number;
  interpretation: 'elastic' | 'inelastic' | 'unit_elastic';
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  sampleSize: number;
}

export interface BusinessGoals {
  objective: OptimizationObjective;
  minPrice?: number;
  maxPrice?: number;
  targetMargin?: number;
  competitorPrices?: number[];
}

export interface VariantMetrics {
  variantId: string;
  variantName: string;
  price: number;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerView: number;
}

export interface AdvancedPricingRecommendation {
  // Base PricingRecommendation properties
  recommendedPrice: number;
  expectedRevenue: number;
  confidence: number;
  simulation: PriceSimulation[];
  // Advanced properties
  currentPrice?: number;
  reasoning?: string[];
  expectedImpact?: {
    revenueChange: number;
    conversionChange: number;
    elasticity: number;
  };
  nextSteps?: string[];
}

// ==================== Error Classes ====================

export class PricingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'PricingError';
  }
}

export class ValidationError extends PricingError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

// ==================== Elasticity Calculations ====================

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
  return conversionChange / priceChange;
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

  // Simple confidence interval estimation using approximation based on sample size
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

// ==================== Optimal Price Calculations ====================

/**
 * Calculate optimal price based on elasticity and current metrics
 *
 * Uses elasticity to determine price adjustment direction and magnitude.
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
  return applyPsychologicalPricing(optimalPrice);
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

  // Handle sub-dollar prices (under $1.00)
  if (price < 1) {
    const cents = Math.round(price * 100);
    const base = Math.floor(cents / 10) * 10;
    return Math.max(0.09, (base + 9) / 100);
  } else if (price < 10) {
    // For prices $1-$10, use .99
    const floor = Math.floor(price);
    if (floor + 0.99 <= price * 1.5) {
      return floor + 0.99;
    }
    return price < floor + 0.5 ? floor + 0.49 : floor + 0.99;
  } else if (price < 100) {
    // For medium prices, round to nearest .99
    return Math.round(price) - 0.01;
  } else {
    // For higher prices, round to nearest $5 - $1
    const roundedTo5 = Math.round(price / 5) * 5;
    return roundedTo5 - 1;
  }
}

// ==================== Revenue Impact Calculations ====================

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

  return ((expectedNewRevenue - currentRevenue) / currentRevenue) * 100;
}

// ==================== Statistical Significance ====================

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
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

  if (se === 0) {
    return 1;
  }

  // Z-score
  const z = Math.abs(p2 - p1) / se;

  // Approximate p-value using normal distribution
  return 2 * (1 - normalCDF(z));
}

// ==================== Recommendation Engine ====================

/**
 * Select the winning variant based on business objectives
 */
function selectWinningVariant(
  variants: VariantMetrics[],
  businessGoals: BusinessGoals
): VariantMetrics {
  switch (businessGoals.objective) {
    case 'conversion':
      return [...variants].sort((a, b) => b.conversionRate - a.conversionRate)[0];

    case 'profit':
      return [...variants].sort((a, b) => b.revenuePerView - a.revenuePerView)[0];

    case 'market_share':
      return [...variants].sort((a, b) => b.conversions - a.conversions)[0];

    case 'revenue':
    default:
      return [...variants].sort((a, b) => b.revenue - a.revenue)[0];
  }
}

/**
 * Apply price constraints from business goals
 */
function applyPriceConstraints(
  price: number,
  minPrice?: number,
  maxPrice?: number
): number {
  let constrainedPrice = price;

  if (minPrice !== undefined && price < minPrice) {
    constrainedPrice = minPrice;
  }

  if (maxPrice !== undefined && price > maxPrice) {
    constrainedPrice = maxPrice;
  }

  return applyPsychologicalPricing(constrainedPrice);
}

/**
 * Generate human-readable reasoning for the recommendation
 */
function generateReasoning(
  elasticityAnalysis: ElasticityAnalysis,
  winningVariant: VariantMetrics,
  recommendedPrice: number,
  businessGoals: BusinessGoals
): string[] {
  const reasoning: string[] = [];
  const absElasticity = Math.abs(elasticityAnalysis.elasticity);

  // Elasticity insight
  if (elasticityAnalysis.interpretation === 'elastic') {
    reasoning.push(
      `Demand is elastic (E=${absElasticity.toFixed(2)}), meaning customers are price-sensitive. ` +
      `Price decreases may significantly boost volume.`
    );
  } else if (elasticityAnalysis.interpretation === 'inelastic') {
    reasoning.push(
      `Demand is inelastic (E=${absElasticity.toFixed(2)}), meaning customers are less price-sensitive. ` +
      `There may be room to increase prices without losing significant volume.`
    );
  } else {
    reasoning.push(
      `Demand is approximately unit elastic (E=${absElasticity.toFixed(2)}). ` +
      `Price changes have proportional effects on demand.`
    );
  }

  // Winning variant insight
  reasoning.push(
    `Based on your "${businessGoals.objective}" objective, the $${winningVariant.price.toFixed(2)} ` +
    `price point performed best with a ${(winningVariant.conversionRate * 100).toFixed(2)}% conversion rate ` +
    `and $${winningVariant.revenue.toFixed(2)} total revenue.`
  );

  // Recommended price insight
  if (recommendedPrice !== winningVariant.price) {
    reasoning.push(
      `We recommend $${recommendedPrice.toFixed(2)} based on elasticity analysis and ` +
      `psychological pricing principles.`
    );
  }

  // Sample size warning
  if (elasticityAnalysis.sampleSize < 1000) {
    reasoning.push(
      `Note: Sample size of ${elasticityAnalysis.sampleSize} is relatively small. ` +
      `Consider running the experiment longer for more reliable results.`
    );
  }

  return reasoning;
}

/**
 * Generate actionable next steps
 */
function generateNextSteps(
  elasticityAnalysis: ElasticityAnalysis,
  recommendedPrice: number,
  statisticalSignificance?: number
): string[] {
  const nextSteps: string[] = [];

  // Implementation step
  nextSteps.push(
    `Update pricing to $${recommendedPrice.toFixed(2)} and monitor conversion rates for the first week.`
  );

  // Validation step
  if (statisticalSignificance !== undefined && statisticalSignificance < 0.95) {
    nextSteps.push(
      `Run a confirmation test with the recommended price against the current price ` +
      `to validate results with higher statistical significance.`
    );
  }

  // Monitoring step
  nextSteps.push(
    `Set up alerts for significant changes in conversion rate or average order value.`
  );

  // Further testing based on elasticity
  if (elasticityAnalysis.interpretation === 'inelastic') {
    nextSteps.push(
      `Consider testing higher price points to capture additional value.`
    );
  } else if (elasticityAnalysis.interpretation === 'elastic') {
    nextSteps.push(
      `Explore bundle pricing or tiered options to maintain revenue while offering lower entry prices.`
    );
  }

  // Segment analysis
  nextSteps.push(
    `Analyze results by customer segment to identify opportunities for personalized pricing.`
  );

  return nextSteps;
}

/**
 * Calculate confidence score for the recommendation (0-100)
 */
function calculateRecommendationConfidence(
  sampleSize: number,
  elasticityAnalysis: ElasticityAnalysis
): number {
  let confidence = 50; // Base confidence

  // Adjust based on sample size
  if (sampleSize >= 10000) {
    confidence += 25;
  } else if (sampleSize >= 5000) {
    confidence += 20;
  } else if (sampleSize >= 1000) {
    confidence += 10;
  } else if (sampleSize < 500) {
    confidence -= 20;
  }

  // Adjust based on confidence interval width
  const ciWidth = elasticityAnalysis.confidenceInterval.upper - elasticityAnalysis.confidenceInterval.lower;
  if (ciWidth < 0.5) {
    confidence += 15;
  } else if (ciWidth < 1) {
    confidence += 10;
  } else if (ciWidth > 2) {
    confidence -= 10;
  }

  return Math.max(0, Math.min(100, confidence));
}

/**
 * Generate advanced pricing recommendation with full analysis
 */
export function generateAdvancedRecommendation(
  variants: VariantMetrics[],
  businessGoals: BusinessGoals = { objective: 'revenue' }
): AdvancedPricingRecommendation {
  if (variants.length < 2) {
    throw new ValidationError('At least 2 variants required for recommendation');
  }

  // Sort by price to identify control and experiment
  const sortedByPrice = [...variants].sort((a, b) => a.price - b.price);
  const control = sortedByPrice[0];
  const experiment = sortedByPrice[sortedByPrice.length - 1];

  // Calculate elasticity
  const elasticityAnalysis = analyzeElasticity(
    { price: control.price, conversions: control.conversions, views: control.views },
    { price: experiment.price, conversions: experiment.conversions, views: experiment.views }
  );

  // Determine winning variant based on business goal
  const winningVariant = selectWinningVariant(variants, businessGoals);

  // Calculate optimal price
  const optimalPrice = calculateOptimalPrice(
    winningVariant.price,
    elasticityAnalysis.elasticity,
    businessGoals.targetMargin
  );

  // Apply constraints
  const constrainedPrice = applyPriceConstraints(
    optimalPrice,
    businessGoals.minPrice,
    businessGoals.maxPrice
  );

  // Calculate expected impact
  const revenueChange = calculateRevenueImpact(
    control.price,
    constrainedPrice,
    control.conversions,
    elasticityAnalysis.elasticity
  );

  const priceChangePercent = (constrainedPrice - control.price) / control.price;
  const conversionChange = priceChangePercent * elasticityAnalysis.elasticity * 100;

  // Calculate statistical significance
  const pValue = calculateStatisticalSignificance(control, experiment);
  const statisticalSignificance = 1 - pValue;

  // Generate reasoning and next steps
  const reasoning = generateReasoning(
    elasticityAnalysis,
    winningVariant,
    constrainedPrice,
    businessGoals
  );

  const nextSteps = generateNextSteps(
    elasticityAnalysis,
    constrainedPrice,
    statisticalSignificance
  );

  // Calculate confidence
  const totalViews = variants.reduce((sum, v) => sum + v.views, 0);
  const confidence = calculateRecommendationConfidence(totalViews, elasticityAnalysis) / 100;

  // Build simulation data
  const simulation: PriceSimulation[] = variants.map(v => ({
    price: v.price,
    estimatedCv: v.conversionRate,
    expectedRevenue: v.revenue
  }));

  return {
    recommendedPrice: constrainedPrice,
    expectedRevenue: winningVariant.revenue * (1 + revenueChange / 100),
    confidence,
    simulation,
    currentPrice: control.price,
    reasoning,
    expectedImpact: {
      revenueChange,
      conversionChange,
      elasticity: elasticityAnalysis.elasticity,
    },
    nextSteps,
  };
}

// ==================== Legacy Interface Types ====================

interface ExperimentDefinition {
  experimentId: string;
  variants: Array<{ label: string; price: string | number }>;
}

interface VariantResults {
  views?: number;
  conversions?: number;
  revenue?: number;
  arpu?: number;
}

interface ExperimentResults {
  control?: VariantResults;
  experiment?: VariantResults;
}

interface RecommendPriceOptions {
  experimentId: string;
  objective?: OptimizationObjective;
  candidates?: number[] | null;
  lookbackDays?: number;
  businessGoals?: BusinessGoals;
}

// ==================== Data Fetching ====================

async function fetchExperimentDefinition(experimentId: string): Promise<ExperimentDefinition> {
  const res = await fetch(`${ELO_BASE}/api/experiments/${encodeURIComponent(experimentId)}/definition`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch experiment definition: ${res.status} ${text}`);
  }
  return res.json() as Promise<ExperimentDefinition>;
}

async function fetchExperimentResults(experimentId: string): Promise<ExperimentResults> {
  const res = await fetch(`${ELO_BASE}/api/experiments/${encodeURIComponent(experimentId)}/results`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch experiment results: ${res.status} ${text}`);
  }
  return res.json() as Promise<ExperimentResults>;
}

// ==================== Utility Functions ====================

function parseNumeric(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function buildObservedPointsFromResults(results: ExperimentResults | null): ObservedPoint[] {
  const observed: ObservedPoint[] = [];

  if (!results || typeof results !== 'object') {
    console.warn('[Jale] buildObservedPointsFromResults: Invalid or empty results provided');
    return observed;
  }

  try {
    if (results.control) {
      const views = parseNumeric(results.control.views);
      const conversions = parseNumeric(results.control.conversions);
      const revenue = parseNumeric(results.control.revenue);
      const arpu = conversions > 0 ? revenue / conversions : parseNumeric(results.control.arpu) || 0;
      const cv = views > 0 ? conversions / views : 0;
      if (arpu > 0) observed.push({ price: arpu, cv });
    }
    if (results.experiment) {
      const views = parseNumeric(results.experiment.views);
      const conversions = parseNumeric(results.experiment.conversions);
      const revenue = parseNumeric(results.experiment.revenue);
      const arpu = conversions > 0 ? revenue / conversions : parseNumeric(results.experiment.arpu) || 0;
      const cv = views > 0 ? conversions / views : 0;
      if (arpu > 0) observed.push({ price: arpu, cv });
    }
  } catch (err) {
    console.error('[Jale] Error building observed points from results:', err);
  }
  return observed;
}

/**
 * Simple linear interpolation/extrapolation estimator for conversion rate by price
 */
export function estimateCvForPrice(observed: ObservedPoint[], price: number): number {
  if (!observed || observed.length === 0) return 0.05; // default baseline
  observed.sort((a, b) => a.price - b.price);
  if (price <= observed[0].price) return observed[0].cv;
  if (price >= observed[observed.length - 1].price) return observed[observed.length - 1].cv;
  for (let i = 0; i < observed.length - 1; i++) {
    const a = observed[i];
    const b = observed[i + 1];
    if (price >= a.price && price <= b.price) {
      const t = (price - a.price) / (b.price - a.price);
      return a.cv + t * (b.cv - a.cv);
    }
  }
  return observed[0].cv;
}

export function simulateRevenueForCandidates(
  results: ExperimentResults | null,
  candidates: number[],
  avgViewsPerPeriod: number = 1000
): PriceSimulation[] {
  const observed = buildObservedPointsFromResults(results);
  if (observed.length === 0) {
    // fallback baseline conversion rate
    const baseline = 0.05;
    return candidates.map(p => ({
      price: p,
      estimatedCv: baseline,
      expectedRevenue: p * baseline * avgViewsPerPeriod
    }));
  }
  return candidates.map(p => {
    const cv = estimateCvForPrice(observed, p);
    const expectedRevenue = p * cv * avgViewsPerPeriod;
    return { price: p, estimatedCv: cv, expectedRevenue };
  }).sort((a, b) => b.expectedRevenue - a.expectedRevenue);
}

// ==================== Main Recommendation Function ====================

export async function recommendPrice(options: RecommendPriceOptions): Promise<AdvancedPricingRecommendation> {
  const { experimentId, objective = 'revenue', candidates = null, businessGoals } = options;

  if (!experimentId) throw new ValidationError('experimentId is required');

  // Fetch experiment definition (variants) and results
  const def = await fetchExperimentDefinition(experimentId).catch((err) => {
    console.warn(`[Jale] Failed to fetch experiment definition for ${experimentId}:`, err.message);
    return null;
  });
  const results = await fetchExperimentResults(experimentId).catch((err) => {
    console.warn(`[Jale] Failed to fetch experiment results for ${experimentId}:`, err.message);
    return null;
  });

  // Derive candidate prices: from variants or provided candidates
  let candidatePrices: number[] = [];
  if (Array.isArray(candidates) && candidates.length > 0) {
    candidatePrices = candidates.map(c => parseFloat(String(c))).filter(Number.isFinite);
  } else if (def && Array.isArray(def.variants) && def.variants.length > 0) {
    candidatePrices = def.variants.map((v) => parseFloat(String(v.price))).filter(Number.isFinite);
  }

  // Expand candidate grid with +/-10% around each price
  const expanded = new Set(candidatePrices.length > 0 ? candidatePrices : [29.99, 39.99]);
  Array.from(expanded).forEach(p => {
    expanded.add(parseFloat((p * 0.9).toFixed(2)));
    expanded.add(parseFloat((p * 1.1).toFixed(2)));
  });
  const candidatesArray = Array.from(expanded).sort((a, b) => a - b);

  // Determine avg views per period from results (fallback)
  const controlViews = results?.control?.views || 0;
  const experimentViews = results?.experiment?.views || 0;
  const totalViews = controlViews + experimentViews || 1000;

  const sims = simulateRevenueForCandidates(results || {}, candidatesArray, Math.max(1, totalViews));

  // If we have enough data, use advanced recommendation engine
  if (results?.control && results?.experiment && controlViews > 0 && experimentViews > 0) {
    const controlPrice = candidatePrices[0] || 29.99;
    const experimentPrice = candidatePrices[1] || candidatePrices[0] * 1.1 || 32.99;

    const variantMetrics: VariantMetrics[] = [
      {
        variantId: 'control',
        variantName: 'Control',
        price: controlPrice,
        views: controlViews,
        conversions: results.control.conversions || 0,
        revenue: results.control.revenue || 0,
        conversionRate: (results.control.conversions || 0) / controlViews,
        averageOrderValue: (results.control.conversions || 0) > 0
          ? (results.control.revenue || 0) / (results.control.conversions || 1)
          : controlPrice,
        revenuePerView: (results.control.revenue || 0) / controlViews
      },
      {
        variantId: 'experiment',
        variantName: 'Experiment',
        price: experimentPrice,
        views: experimentViews,
        conversions: results.experiment.conversions || 0,
        revenue: results.experiment.revenue || 0,
        conversionRate: (results.experiment.conversions || 0) / experimentViews,
        averageOrderValue: (results.experiment.conversions || 0) > 0
          ? (results.experiment.revenue || 0) / (results.experiment.conversions || 1)
          : experimentPrice,
        revenuePerView: (results.experiment.revenue || 0) / experimentViews
      }
    ];

    const goals: BusinessGoals = businessGoals || { objective: objective as OptimizationObjective };
    return generateAdvancedRecommendation(variantMetrics, goals);
  }

  // Fallback to simple recommendation for insufficient data
  let best: PriceSimulation;
  if (objective === 'conversion') {
    sims.sort((a, b) => b.estimatedCv - a.estimatedCv);
    best = sims[0];
  } else {
    // revenue or profit
    best = sims[0];
  }

  const confidence = 0.3; // Lower confidence for simple recommendation

  return {
    recommendedPrice: best.price,
    expectedRevenue: best.expectedRevenue,
    confidence,
    simulation: sims,
    reasoning: [
      'Recommendation based on limited data.',
      'Consider running a longer experiment for more accurate results.'
    ],
    nextSteps: [
      'Continue collecting data to improve recommendation accuracy.',
      'Set up A/B tests with clear price variants.'
    ]
  };
}
