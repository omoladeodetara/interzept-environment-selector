/**
 * Recommendation Engine Module
 * 
 * AI-powered pricing recommendations based on A/B test results,
 * business goals, and market data.
 */

import {
  PricingRecommendation,
  BusinessGoals,
  ExperimentResults,
  VariantMetrics,
  ValidationError,
} from './types';
import {
  calculateElasticity,
  analyzeElasticity,
  calculateOptimalPrice,
  calculateRevenueImpact,
  applyPsychologicalPricing,
} from './price-calculator';

/**
 * Generate comprehensive pricing recommendation based on experiment results
 * 
 * @param experimentResults - Results from completed A/B test
 * @param businessGoals - Business objectives and constraints
 * @returns Full pricing recommendation with reasoning
 */
export function generateRecommendation(
  experimentResults: ExperimentResults,
  businessGoals: BusinessGoals = { objective: 'revenue' }
): PricingRecommendation {
  const variantIds = Object.keys(experimentResults.variants);
  
  if (variantIds.length < 2) {
    throw new ValidationError('At least 2 variants required for recommendation');
  }

  // Get variant metrics sorted by some criteria
  const variants = variantIds.map(id => experimentResults.variants[id]);
  
  // Find control (usually the first/lowest price variant)
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

  const conversionChange = estimateConversionChange(
    control.price,
    constrainedPrice,
    elasticityAnalysis.elasticity
  );

  // Generate reasoning
  const reasoning = generateReasoning(
    elasticityAnalysis,
    variants,
    winningVariant,
    constrainedPrice,
    businessGoals
  );

  // Generate next steps
  const nextSteps = generateNextSteps(
    elasticityAnalysis,
    experimentResults,
    constrainedPrice
  );

  // Calculate confidence
  const confidence = calculateConfidence(experimentResults, elasticityAnalysis);

  return {
    currentPrice: control.price,
    recommendedPrice: constrainedPrice,
    confidence,
    reasoning,
    expectedImpact: {
      revenueChange,
      conversionChange,
      elasticity: elasticityAnalysis.elasticity,
    },
    nextSteps,
  };
}

/**
 * Select the winning variant based on business objectives
 */
function selectWinningVariant(
  variants: VariantMetrics[],
  businessGoals: BusinessGoals
): VariantMetrics {
  switch (businessGoals.objective) {
    case 'conversion':
      // Maximize conversion rate
      return [...variants].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    
    case 'profit':
      // Maximize revenue per view (proxy for profit)
      return [...variants].sort((a, b) => b.revenuePerView - a.revenuePerView)[0];
    
    case 'market_share':
      // Maximize total conversions
      return [...variants].sort((a, b) => b.conversions - a.conversions)[0];
    
    case 'revenue':
    default:
      // Maximize total revenue
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
 * Estimate conversion rate change based on price change and elasticity
 */
function estimateConversionChange(
  currentPrice: number,
  newPrice: number,
  elasticity: number
): number {
  const priceChangePercent = (newPrice - currentPrice) / currentPrice;
  return priceChangePercent * elasticity * 100;
}

/**
 * Generate human-readable reasoning for the recommendation
 */
function generateReasoning(
  elasticityAnalysis: ReturnType<typeof analyzeElasticity>,
  variants: VariantMetrics[],
  winningVariant: VariantMetrics,
  recommendedPrice: number,
  businessGoals: BusinessGoals
): string[] {
  const reasoning: string[] = [];

  // Elasticity insight
  const absElasticity = Math.abs(elasticityAnalysis.elasticity);
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

  // Confidence insight
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
  elasticityAnalysis: ReturnType<typeof analyzeElasticity>,
  experimentResults: ExperimentResults,
  recommendedPrice: number
): string[] {
  const nextSteps: string[] = [];

  // Implementation step
  nextSteps.push(
    `Update pricing to $${recommendedPrice.toFixed(2)} and monitor conversion rates for the first week.`
  );

  // Validation step
  if (experimentResults.summary.statisticalSignificance !== undefined &&
      experimentResults.summary.statisticalSignificance < 0.95) {
    nextSteps.push(
      `Run a confirmation test with the recommended price against the current price ` +
      `to validate results with higher statistical significance.`
    );
  }

  // Monitoring step
  nextSteps.push(
    `Set up alerts for significant changes in conversion rate or average order value.`
  );

  // Further testing
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
function calculateConfidence(
  experimentResults: ExperimentResults,
  elasticityAnalysis: ReturnType<typeof analyzeElasticity>
): number {
  let confidence = 50; // Base confidence

  // Adjust based on sample size
  const sampleSize = experimentResults.summary.totalViews;
  if (sampleSize >= 10000) {
    confidence += 25;
  } else if (sampleSize >= 5000) {
    confidence += 20;
  } else if (sampleSize >= 1000) {
    confidence += 10;
  } else if (sampleSize < 500) {
    confidence -= 20;
  }

  // Adjust based on statistical significance
  if (experimentResults.summary.statisticalSignificance !== undefined) {
    if (experimentResults.summary.statisticalSignificance >= 0.95) {
      confidence += 15;
    } else if (experimentResults.summary.statisticalSignificance >= 0.90) {
      confidence += 10;
    } else if (experimentResults.summary.statisticalSignificance < 0.80) {
      confidence -= 15;
    }
  }

  // Adjust based on elasticity confidence interval
  const ciWidth = elasticityAnalysis.confidenceInterval.upper - elasticityAnalysis.confidenceInterval.lower;
  if (ciWidth < 0.5) {
    confidence += 10;
  } else if (ciWidth > 1.0) {
    confidence -= 10;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Quick analysis for a single price point comparison
 */
export function quickAnalysis(
  currentPrice: number,
  proposedPrice: number,
  estimatedElasticity: number = -1.5
): {
  expectedConversionChange: number;
  expectedRevenueChange: number;
  recommendation: 'proceed' | 'caution' | 'reconsider';
  reason: string;
} {
  const priceChange = (proposedPrice - currentPrice) / currentPrice;
  const conversionChange = priceChange * estimatedElasticity;
  const revenueChange = (1 + priceChange) * (1 + conversionChange) - 1;

  let recommendation: 'proceed' | 'caution' | 'reconsider';
  let reason: string;

  if (revenueChange > 0.05) {
    recommendation = 'proceed';
    reason = `Expected revenue increase of ${(revenueChange * 100).toFixed(1)}%`;
  } else if (revenueChange > -0.05) {
    recommendation = 'caution';
    reason = `Revenue change within ±5%, consider running an A/B test first`;
  } else {
    recommendation = 'reconsider';
    reason = `Expected revenue decrease of ${(Math.abs(revenueChange) * 100).toFixed(1)}%`;
  }

  return {
    expectedConversionChange: conversionChange * 100,
    expectedRevenueChange: revenueChange * 100,
    recommendation,
    reason,
  };
}
