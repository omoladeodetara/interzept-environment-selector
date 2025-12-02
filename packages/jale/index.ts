/**
 * Jale - Pricing Engine Module
 *
 * Responsibilities:
 * - Fetch experiment variants and results from Elo (ab-testing-server)
 * - Fetch historical data from Elo results endpoint
 * - Calculate simple elasticity / expected revenue for candidate prices
 * - Return recommended price and a simulation
 *
 * NOTE: This is a minimal POC implementation. Replace fetch/db calls with your
 * actual DB client and add proper error handling, authentication, and testing.
 */

import axios from 'axios';
import { PricingRecommendation, PriceSimulation } from '@models/types';

const ELO_BASE = process.env.ELO_BASE_URL || 'http://localhost:3000'; // elo (ab-testing-server) base URL

interface ObservedPoint {
  price: number;
  cv: number;
}

async function fetchExperimentDefinition(experimentId: string): Promise<any> {
  const res = await axios.get(`${ELO_BASE}/api/experiments/${encodeURIComponent(experimentId)}/definition`);
  return res.data; // expected { experimentId, variants: [{ label, price }, ...] }
}

async function fetchExperimentResults(experimentId: string): Promise<any> {
  const res = await axios.get(`${ELO_BASE}/api/experiments/${encodeURIComponent(experimentId)}/results`);
  return res.data; // uses ab-testing-server result shape
}

function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildObservedPointsFromResults(results: any): ObservedPoint[] {
  const observed: ObservedPoint[] = [];
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
    // fallback empty
  }
  return observed;
}

/**
 * Simple linear interpolation/extrapolation estimator for conversion rate by price
 */
function estimateCvForPrice(observed: ObservedPoint[], price: number): number {
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

function simulateRevenueForCandidates(
  results: any,
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

export async function recommendPrice(options: {
  experimentId: string;
  objective?: string;
  candidates?: number[] | null;
  lookbackDays?: number;
}): Promise<PricingRecommendation> {
  const { experimentId, objective = 'revenue', candidates = null, lookbackDays = 30 } = options;
  
  if (!experimentId) throw new Error('experimentId is required');

  // Fetch experiment definition (variants) and results
  const def = await fetchExperimentDefinition(experimentId).catch(() => null);
  const results = await fetchExperimentResults(experimentId).catch(() => null);

  // Derive candidate prices: from variants or provided candidates
  let candidatePrices: number[] = [];
  if (Array.isArray(candidates) && candidates.length > 0) {
    candidatePrices = candidates.map(c => parseFloat(String(c))).filter(Number.isFinite);
  } else if (def && Array.isArray(def.variants) && def.variants.length > 0) {
    candidatePrices = def.variants.map((v: any) => parseFloat(v.price)).filter(Number.isFinite);
  }

  // Expand candidate grid with +/-10% around each price
  const expanded = new Set(candidatePrices.length > 0 ? candidatePrices : [29.99, 39.99]);
  Array.from(expanded).forEach(p => {
    expanded.add(parseFloat((p * 0.9).toFixed(2)));
    expanded.add(parseFloat((p * 1.1).toFixed(2)));
  });
  const candidatesArray = Array.from(expanded).sort((a, b) => a - b);

  // Determine avg views per period from results (fallback)
  const totalViews = (results && ((results.control?.views || 0) + (results.experiment?.views || 0))) || 1000;

  const sims = simulateRevenueForCandidates(results || {}, candidatesArray, Math.max(1, totalViews));

  // Choose best by objective
  let best: PriceSimulation;
  if (objective === 'conversion') {
    sims.sort((a, b) => b.estimatedCv - a.estimatedCv);
    best = sims[0];
  } else if (objective === 'profit') {
    // profit requires cost info - for now treat same as revenue
    best = sims[0];
  } else {
    // revenue
    best = sims[0];
  }

  const confidence = 0.5; // placeholder; compute using statistical test later

  return {
    recommendedPrice: best.price,
    expectedRevenue: best.expectedRevenue,
    confidence,
    simulation: sims
  };
}

// Export helper functions for testing
export {
  simulateRevenueForCandidates,
  estimateCvForPrice,
  buildObservedPointsFromResults
};
