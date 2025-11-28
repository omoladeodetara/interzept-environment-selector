/**
 * Analytics Module
 * 
 * Advanced metrics, insights, and dashboard data aggregation
 * for pricing experiments.
 */

import {
  DashboardData,
  ElasticityAnalysis,
  ExperimentResults,
  ValidationError,
} from './types';
import { listExperiments, getExperimentResults } from './experiment-manager';
import { analyzeElasticity } from './price-calculator';

/**
 * Get dashboard overview data for a tenant
 */
export function getDashboardData(tenantId: string): DashboardData {
  const { experiments } = listExperiments(tenantId, { limit: 1000 });

  const activeExperiments = experiments.filter(e => e.status === 'active').length;
  const completedExperiments = experiments.filter(e => e.status === 'completed').length;

  let totalRevenue = 0;
  let totalConversions = 0;
  let totalViews = 0;
  let topExperiment: { id: string; name: string; revenueImpact: number } | undefined;
  let maxRevenueImpact = 0;

  for (const experiment of experiments) {
    try {
      const results = getExperimentResults(experiment.id);
      totalRevenue += results.summary.totalRevenue;
      totalConversions += results.summary.totalConversions;
      totalViews += results.summary.totalViews;

      // Calculate revenue impact for completed experiments
      if (experiment.status === 'completed' && results.summary.totalRevenue > maxRevenueImpact) {
        maxRevenueImpact = results.summary.totalRevenue;
        topExperiment = {
          id: experiment.id,
          name: experiment.name,
          revenueImpact: results.summary.totalRevenue,
        };
      }
    } catch {
      // Skip experiments without results
    }
  }

  const avgConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

  // Calculate overall revenue impact (simplified)
  const baselineRevenue = totalRevenue * 0.9; // Assume 10% improvement on average
  const revenueImpact = totalRevenue > 0 
    ? ((totalRevenue - baselineRevenue) / baselineRevenue) * 100 
    : 0;

  return {
    activeExperiments,
    completedExperiments,
    totalRevenue,
    avgConversionRate,
    revenueImpact,
    topPerformingExperiment: topExperiment,
    recentExperiments: experiments.slice(0, 5),
  };
}

/**
 * Get detailed analytics for a specific experiment
 */
export function getExperimentAnalytics(
  experimentId: string,
  tenantId?: string
): {
  results: ExperimentResults;
  elasticity?: ElasticityAnalysis;
  insights: string[];
  recommendations: string[];
} {
  const results = getExperimentResults(experimentId, tenantId);
  const variantIds = Object.keys(results.variants);
  const insights: string[] = [];
  const recommendations: string[] = [];

  let elasticity: ElasticityAnalysis | undefined;

  if (variantIds.length >= 2) {
    // Calculate elasticity between lowest and highest price variants
    const variants = variantIds.map(id => results.variants[id]);
    const sorted = [...variants].sort((a, b) => a.price - b.price);
    const control = sorted[0];
    const experiment = sorted[sorted.length - 1];

    try {
      elasticity = analyzeElasticity(
        { price: control.price, conversions: control.conversions, views: control.views },
        { price: experiment.price, conversions: experiment.conversions, views: experiment.views }
      );

      // Generate insights based on elasticity
      if (elasticity.interpretation === 'elastic') {
        insights.push(
          `Your customers are price-sensitive (elasticity: ${elasticity.elasticity.toFixed(2)}). ` +
          `Lowering prices may significantly increase volume.`
        );
      } else if (elasticity.interpretation === 'inelastic') {
        insights.push(
          `Your customers are less price-sensitive (elasticity: ${elasticity.elasticity.toFixed(2)}). ` +
          `You may have room to increase prices.`
        );
      }
    } catch {
      // Elasticity calculation failed, skip
    }
  }

  // Conversion rate insights
  const variants = Object.values(results.variants);
  const conversionRates = variants.map(v => v.conversionRate);
  const maxConversionRate = Math.max(...conversionRates);
  const minConversionRate = Math.min(...conversionRates);

  if (maxConversionRate - minConversionRate > 0.05) {
    insights.push(
      `Conversion rates vary significantly across variants (${(minConversionRate * 100).toFixed(1)}% to ${(maxConversionRate * 100).toFixed(1)}%).`
    );
  }

  // Revenue per view insights
  const revenuePerViews = variants.map(v => v.revenuePerView);
  const maxRPV = Math.max(...revenuePerViews);
  const bestVariant = variants.find(v => v.revenuePerView === maxRPV);
  
  if (bestVariant) {
    insights.push(
      `"${bestVariant.variantName}" has the highest revenue per view at $${bestVariant.revenuePerView.toFixed(2)}.`
    );
  }

  // Statistical significance insight
  if (results.summary.statisticalSignificance !== undefined) {
    if (results.summary.statisticalSignificance >= 0.95) {
      insights.push(
        `Results are statistically significant (${(results.summary.statisticalSignificance * 100).toFixed(1)}% confidence).`
      );
    } else if (results.summary.statisticalSignificance < 0.80) {
      insights.push(
        `Results are not yet statistically significant. Consider running the experiment longer.`
      );
    }
  }

  // Recommendations
  if (results.summary.winningVariant) {
    const winner = results.variants[results.summary.winningVariant];
    recommendations.push(
      `Consider implementing "$${winner.price.toFixed(2)}" as your new price point.`
    );
  }

  if (results.summary.totalViews < 1000) {
    recommendations.push(
      `Current sample size (${results.summary.totalViews}) is small. Run longer for more reliable results.`
    );
  }

  recommendations.push(
    `Set up monitoring to track performance after implementing changes.`
  );

  return {
    results,
    elasticity,
    insights,
    recommendations,
  };
}

/**
 * Get elasticity analysis for an experiment
 */
export function getElasticityAnalysis(
  experimentId: string,
  tenantId?: string
): ElasticityAnalysis {
  const results = getExperimentResults(experimentId, tenantId);
  const variantIds = Object.keys(results.variants);

  if (variantIds.length < 2) {
    throw new ValidationError('At least 2 variants required for elasticity analysis');
  }

  const variants = variantIds.map(id => results.variants[id]);
  const sorted = [...variants].sort((a, b) => a.price - b.price);
  const control = sorted[0];
  const experiment = sorted[sorted.length - 1];

  return analyzeElasticity(
    { price: control.price, conversions: control.conversions, views: control.views },
    { price: experiment.price, conversions: experiment.conversions, views: experiment.views }
  );
}

/**
 * Compare multiple experiments
 */
export function compareExperiments(
  experimentIds: string[],
  tenantId?: string
): {
  experiments: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    conversionRate: number;
    revenuePerView: number;
  }>;
  insights: string[];
} {
  const experimentData: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    conversionRate: number;
    revenuePerView: number;
  }> = [];

  for (const id of experimentIds) {
    try {
      const results = getExperimentResults(id, tenantId);
      const avgConversionRate = results.summary.totalViews > 0
        ? results.summary.totalConversions / results.summary.totalViews
        : 0;
      const avgRPV = results.summary.totalViews > 0
        ? results.summary.totalRevenue / results.summary.totalViews
        : 0;

      // Get experiment name - we need to access the experiment data
      // For simplicity, use ID as name in this comparison
      experimentData.push({
        id,
        name: `Experiment ${id.substring(0, 8)}`,
        totalRevenue: results.summary.totalRevenue,
        conversionRate: avgConversionRate,
        revenuePerView: avgRPV,
      });
    } catch {
      // Skip experiments that can't be loaded
    }
  }

  const insights: string[] = [];

  if (experimentData.length >= 2) {
    // Find best performing
    const sortedByRevenue = [...experimentData].sort((a, b) => b.totalRevenue - a.totalRevenue);
    insights.push(
      `"${sortedByRevenue[0].name}" generated the most revenue ($${sortedByRevenue[0].totalRevenue.toFixed(2)}).`
    );

    const sortedByConversion = [...experimentData].sort((a, b) => b.conversionRate - a.conversionRate);
    if (sortedByConversion[0].id !== sortedByRevenue[0].id) {
      insights.push(
        `"${sortedByConversion[0].name}" had the highest conversion rate (${(sortedByConversion[0].conversionRate * 100).toFixed(2)}%).`
      );
    }
  }

  return {
    experiments: experimentData,
    insights,
  };
}

/**
 * Get time-series data for an experiment (simplified)
 */
export function getExperimentTimeSeries(
  experimentId: string,
  tenantId?: string,
  granularity: 'hour' | 'day' | 'week' = 'day'
): {
  timestamps: Date[];
  variants: {
    [variantId: string]: {
      views: number[];
      conversions: number[];
      revenue: number[];
    };
  };
} {
  // In production, this would query time-series data from the database
  // For now, return empty structure
  const results = getExperimentResults(experimentId, tenantId);
  const variantIds = Object.keys(results.variants);

  const variants: {
    [variantId: string]: {
      views: number[];
      conversions: number[];
      revenue: number[];
    };
  } = {};

  for (const variantId of variantIds) {
    variants[variantId] = {
      views: [],
      conversions: [],
      revenue: [],
    };
  }

  return {
    timestamps: [],
    variants,
  };
}
