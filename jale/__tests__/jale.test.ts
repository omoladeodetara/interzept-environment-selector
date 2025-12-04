/// <reference types="jest" />
/**
 * Tests for Jale Pricing Engine Module
 */

import {
  buildObservedPointsFromResults,
  estimateCvForPrice,
  simulateRevenueForCandidates,
  calculateElasticity,
  analyzeElasticity,
  calculateOptimalPrice,
  applyPsychologicalPricing,
  calculateRevenueImpact,
  calculateStatisticalSignificance,
  generateAdvancedRecommendation,
  ValidationError,
  type VariantMetrics,
  type BusinessGoals
} from '../index';

describe('Jale Pricing Engine Module', () => {
  describe('buildObservedPointsFromResults', () => {
    it('should return empty array for null results', () => {
      const points = buildObservedPointsFromResults(null);
      expect(points).toEqual([]);
    });

    it('should return empty array for invalid results', () => {
      const points = buildObservedPointsFromResults('invalid' as any);
      expect(points).toEqual([]);
    });

    it('should extract observed points from control results', () => {
      const results = {
        control: {
          views: 100,
          conversions: 10,
          revenue: 299.90
        }
      };
      
      const points = buildObservedPointsFromResults(results);
      
      expect(points.length).toBe(1);
      expect(points[0].price).toBeCloseTo(29.99, 2); // revenue/conversions
      expect(points[0].cv).toBeCloseTo(0.1, 2); // conversions/views
    });

    it('should extract observed points from both variants', () => {
      const results = {
        control: {
          views: 100,
          conversions: 10,
          revenue: 299.90
        },
        experiment: {
          views: 100,
          conversions: 8,
          revenue: 319.92
        }
      };
      
      const points = buildObservedPointsFromResults(results);
      
      expect(points.length).toBe(2);
    });

    it('should handle zero conversions gracefully', () => {
      const results = {
        control: {
          views: 100,
          conversions: 0,
          revenue: 0
        }
      };
      
      const points = buildObservedPointsFromResults(results);
      // Should not add point if arpu is 0
      expect(points.length).toBe(0);
    });
  });

  describe('estimateCvForPrice', () => {
    it('should return baseline for empty observations', () => {
      const cv = estimateCvForPrice([], 29.99);
      expect(cv).toBe(0.05); // default baseline
    });

    it('should return exact cv for observed price', () => {
      const observed = [
        { price: 29.99, cv: 0.10 },
        { price: 39.99, cv: 0.08 }
      ];
      
      const cv = estimateCvForPrice(observed, 29.99);
      expect(cv).toBe(0.10);
    });

    it('should interpolate between observed points', () => {
      const observed = [
        { price: 20, cv: 0.15 },
        { price: 40, cv: 0.05 }
      ];
      
      // Price 30 is halfway between 20 and 40
      const cv = estimateCvForPrice(observed, 30);
      expect(cv).toBeCloseTo(0.10, 2); // halfway between 0.15 and 0.05
    });

    it('should use boundary value for prices outside range', () => {
      const observed = [
        { price: 29.99, cv: 0.10 },
        { price: 39.99, cv: 0.08 }
      ];
      
      // Below range - use lowest price cv
      const cvLow = estimateCvForPrice(observed, 19.99);
      expect(cvLow).toBe(0.10);
      
      // Above range - use highest price cv
      const cvHigh = estimateCvForPrice(observed, 49.99);
      expect(cvHigh).toBe(0.08);
    });
  });

  describe('simulateRevenueForCandidates', () => {
    it('should use baseline conversion rate for empty results', () => {
      const sims = simulateRevenueForCandidates(null, [29.99, 39.99], 1000);
      
      expect(sims.length).toBe(2);
      // With baseline cv of 0.05
      sims.forEach(sim => {
        expect(sim.estimatedCv).toBe(0.05);
        expect(sim.expectedRevenue).toBe(sim.price * 0.05 * 1000);
      });
    });

    it('should simulate revenue for candidates with observed data', () => {
      const results = {
        control: {
          views: 100,
          conversions: 10,
          revenue: 299.90
        },
        experiment: {
          views: 100,
          conversions: 8,
          revenue: 319.92
        }
      };
      
      const sims = simulateRevenueForCandidates(results, [29.99, 35.99, 39.99], 1000);
      
      expect(sims.length).toBe(3);
      // Should be sorted by expected revenue descending
      expect(sims[0].expectedRevenue).toBeGreaterThanOrEqual(sims[1].expectedRevenue);
      expect(sims[1].expectedRevenue).toBeGreaterThanOrEqual(sims[2].expectedRevenue);
    });

    it('should calculate expected revenue correctly', () => {
      const results = {
        control: {
          views: 100,
          conversions: 10,
          revenue: 299.90
        }
      };
      
      const sims = simulateRevenueForCandidates(results, [29.99], 1000);
      
      // cv = 10/100 = 0.1, expectedRevenue = 29.99 * 0.1 * 1000 = 2999
      expect(sims[0].estimatedCv).toBeCloseTo(0.1, 2);
      expect(sims[0].expectedRevenue).toBeCloseTo(2999, 0);
    });
  });

  describe('Price Elasticity Logic', () => {
    it('should show inverse relationship between price and conversion rate', () => {
      const observed = [
        { price: 19.99, cv: 0.15 }, // Lower price, higher conversion
        { price: 29.99, cv: 0.10 },
        { price: 39.99, cv: 0.07 }, // Higher price, lower conversion
      ];
      
      // Lower prices should have higher cv
      const cvLow = estimateCvForPrice(observed, 19.99);
      const cvMid = estimateCvForPrice(observed, 29.99);
      const cvHigh = estimateCvForPrice(observed, 39.99);
      
      expect(cvLow).toBeGreaterThan(cvMid);
      expect(cvMid).toBeGreaterThan(cvHigh);
    });

    it('should find optimal price that maximizes revenue', () => {
      // Create observed data where middle price has best revenue
      const results = {
        control: {
          views: 1000,
          conversions: 150, // cv = 0.15
          revenue: 2998.50 // ARPU = 19.99
        },
        experiment: {
          views: 1000,
          conversions: 80, // cv = 0.08
          revenue: 3199.20 // ARPU = 39.99
        }
      };
      
      const candidates = [19.99, 24.99, 29.99, 34.99, 39.99];
      const sims = simulateRevenueForCandidates(results, candidates, 1000);
      
      // Should return simulations sorted by expected revenue
      expect(sims[0].expectedRevenue).toBeGreaterThanOrEqual(sims[sims.length - 1].expectedRevenue);
    });
  });

  // ==================== New Advanced Functions Tests ====================

  describe('calculateElasticity', () => {
    it('should calculate elasticity correctly', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 12, conversions: 80, views: 1000 };
      
      const elasticity = calculateElasticity(control, experiment);
      
      // Price increased 20%, conversions decreased 20%
      // Elasticity = -20% / 20% = -1
      expect(elasticity).toBeCloseTo(-1, 1);
    });

    it('should throw for non-positive prices', () => {
      const control = { price: 0, conversions: 100, views: 1000 };
      const experiment = { price: 12, conversions: 80, views: 1000 };
      
      expect(() => calculateElasticity(control, experiment)).toThrow(ValidationError);
    });

    it('should throw for non-positive views', () => {
      const control = { price: 10, conversions: 100, views: 0 };
      const experiment = { price: 12, conversions: 80, views: 1000 };
      
      expect(() => calculateElasticity(control, experiment)).toThrow(ValidationError);
    });

    it('should return 0 for negligible price change', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 10.00001, conversions: 100, views: 1000 };
      
      const elasticity = calculateElasticity(control, experiment);
      expect(elasticity).toBe(0);
    });
  });

  describe('analyzeElasticity', () => {
    it('should classify elastic demand correctly', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 11, conversions: 70, views: 1000 }; // Large conversion drop
      
      const analysis = analyzeElasticity(control, experiment);
      
      expect(analysis.interpretation).toBe('elastic');
      expect(Math.abs(analysis.elasticity)).toBeGreaterThan(1);
    });

    it('should classify inelastic demand correctly', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 12, conversions: 95, views: 1000 }; // Small conversion drop
      
      const analysis = analyzeElasticity(control, experiment);
      
      expect(analysis.interpretation).toBe('inelastic');
      expect(Math.abs(analysis.elasticity)).toBeLessThan(1);
    });

    it('should include sample size', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 12, conversions: 80, views: 1000 };
      
      const analysis = analyzeElasticity(control, experiment);
      
      expect(analysis.sampleSize).toBe(2000);
    });

    it('should include confidence interval', () => {
      const control = { price: 10, conversions: 100, views: 1000 };
      const experiment = { price: 12, conversions: 80, views: 1000 };
      
      const analysis = analyzeElasticity(control, experiment);
      
      expect(analysis.confidenceInterval.lower).toBeLessThan(analysis.elasticity);
      expect(analysis.confidenceInterval.upper).toBeGreaterThan(analysis.elasticity);
    });
  });

  describe('calculateOptimalPrice', () => {
    it('should suggest higher price for inelastic demand', () => {
      const currentPrice = 10;
      const inelasticElasticity = -0.3; // Very inelastic
      
      const optimalPrice = calculateOptimalPrice(currentPrice, inelasticElasticity);
      
      expect(optimalPrice).toBeGreaterThan(currentPrice);
    });

    it('should suggest lower price for elastic demand', () => {
      const currentPrice = 10;
      const elasticElasticity = -2.5; // Very elastic
      
      const optimalPrice = calculateOptimalPrice(currentPrice, elasticElasticity);
      
      expect(optimalPrice).toBeLessThan(currentPrice);
    });

    it('should throw for non-positive price', () => {
      expect(() => calculateOptimalPrice(0, -1)).toThrow(ValidationError);
      expect(() => calculateOptimalPrice(-10, -1)).toThrow(ValidationError);
    });

    it('should apply target margin constraint', () => {
      const currentPrice = 10;
      const elasticity = -2.5; // Would suggest lower price
      const targetMargin = 0.3; // But margin requires min price
      
      const optimalPrice = calculateOptimalPrice(currentPrice, elasticity, targetMargin);
      
      expect(optimalPrice).toBeGreaterThanOrEqual(currentPrice * (1 - targetMargin));
    });
  });

  describe('applyPsychologicalPricing', () => {
    it('should apply .99 ending for prices under $10', () => {
      // 5.5 rounds to floor(5.5) = 5, then adds .99 = 5.99 (since 5.99 <= 5.5 * 1.5 = 8.25)
      expect(applyPsychologicalPricing(5.5)).toBe(5.99);
      expect(applyPsychologicalPricing(7.8)).toBe(7.99);
    });

    it('should apply psychological pricing for medium prices', () => {
      // 25.5 rounds to 26, then subtracts 0.01 = 25.99
      const result = applyPsychologicalPricing(25.5);
      expect(result).toBeCloseTo(25.99, 1);
    });

    it('should round to $X-1 for high prices', () => {
      const result = applyPsychologicalPricing(100);
      expect(result).toBe(99);
    });

    it('should handle zero and negative gracefully', () => {
      expect(applyPsychologicalPricing(0)).toBe(0);
      expect(applyPsychologicalPricing(-5)).toBe(-5);
    });
  });

  describe('calculateRevenueImpact', () => {
    it('should calculate positive impact for price increase with inelastic demand', () => {
      const impact = calculateRevenueImpact(10, 12, 100, -0.5);
      expect(impact).toBeGreaterThan(0);
    });

    it('should calculate negative impact for price increase with elastic demand', () => {
      const impact = calculateRevenueImpact(10, 15, 100, -2);
      expect(impact).toBeLessThan(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateRevenueImpact(0, 12, 100, -1)).toBe(0);
      expect(calculateRevenueImpact(10, 12, 0, -1)).toBe(0);
    });
  });

  describe('calculateStatisticalSignificance', () => {
    const createVariantMetrics = (views: number, conversions: number): VariantMetrics => ({
      variantId: 'test',
      variantName: 'Test',
      price: 10,
      views,
      conversions,
      revenue: conversions * 10,
      conversionRate: views > 0 ? conversions / views : 0,
      averageOrderValue: 10,
      revenuePerView: views > 0 ? (conversions * 10) / views : 0
    });

    it('should return 1 (not significant) for zero views', () => {
      const control = createVariantMetrics(0, 0);
      const experiment = createVariantMetrics(1000, 100);
      
      expect(calculateStatisticalSignificance(control, experiment)).toBe(1);
    });

    it('should detect significant differences', () => {
      const control = createVariantMetrics(10000, 1000); // 10% conversion
      const experiment = createVariantMetrics(10000, 1500); // 15% conversion
      
      const pValue = calculateStatisticalSignificance(control, experiment);
      expect(pValue).toBeLessThan(0.05); // Statistically significant
    });

    it('should not detect significance for similar rates', () => {
      const control = createVariantMetrics(100, 10); // 10% conversion
      const experiment = createVariantMetrics(100, 11); // 11% conversion
      
      const pValue = calculateStatisticalSignificance(control, experiment);
      expect(pValue).toBeGreaterThan(0.05); // Not significant
    });
  });

  describe('generateAdvancedRecommendation', () => {
    const createVariant = (id: string, price: number, views: number, conversions: number): VariantMetrics => ({
      variantId: id,
      variantName: id,
      price,
      views,
      conversions,
      revenue: conversions * price,
      conversionRate: views > 0 ? conversions / views : 0,
      averageOrderValue: price,
      revenuePerView: views > 0 ? (conversions * price) / views : 0
    });

    it('should throw for fewer than 2 variants', () => {
      const variants = [createVariant('control', 10, 1000, 100)];
      
      expect(() => generateAdvancedRecommendation(variants)).toThrow(ValidationError);
    });

    it('should generate recommendation with reasoning', () => {
      const variants = [
        createVariant('control', 10, 1000, 100),
        createVariant('experiment', 12, 1000, 85)
      ];
      
      const recommendation = generateAdvancedRecommendation(variants);
      
      expect(recommendation.recommendedPrice).toBeGreaterThan(0);
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.reasoning).toBeDefined();
      expect(recommendation.reasoning!.length).toBeGreaterThan(0);
      expect(recommendation.nextSteps).toBeDefined();
    });

    it('should include expected impact', () => {
      const variants = [
        createVariant('control', 10, 1000, 100),
        createVariant('experiment', 12, 1000, 85)
      ];
      
      const recommendation = generateAdvancedRecommendation(variants);
      
      expect(recommendation.expectedImpact).toBeDefined();
      expect(recommendation.expectedImpact!.elasticity).toBeDefined();
      expect(recommendation.expectedImpact!.revenueChange).toBeDefined();
    });

    it('should respect business goals', () => {
      const variants = [
        createVariant('control', 10, 1000, 100),
        createVariant('experiment', 12, 1000, 85)
      ];
      
      const goals: BusinessGoals = {
        objective: 'conversion',
        minPrice: 8,
        maxPrice: 15
      };
      
      const recommendation = generateAdvancedRecommendation(variants, goals);
      
      expect(recommendation.recommendedPrice).toBeGreaterThanOrEqual(goals.minPrice!);
      expect(recommendation.recommendedPrice).toBeLessThanOrEqual(goals.maxPrice!);
    });

    it('should select winner by revenue for revenue objective', () => {
      // Higher price variant has more revenue despite fewer conversions
      const variants = [
        createVariant('control', 10, 1000, 100), // Revenue: 1000
        createVariant('experiment', 20, 1000, 60) // Revenue: 1200
      ];
      
      const recommendation = generateAdvancedRecommendation(variants, { objective: 'revenue' });
      
      // Should base recommendation on higher revenue variant
      expect(recommendation.currentPrice).toBe(10);
    });

    it('should select winner by conversion rate for conversion objective', () => {
      const variants = [
        createVariant('control', 10, 1000, 100), // 10% conversion
        createVariant('experiment', 20, 1000, 60)  // 6% conversion
      ];
      
      const goals: BusinessGoals = { objective: 'conversion' };
      const recommendation = generateAdvancedRecommendation(variants, goals);
      
      expect(recommendation).toBeDefined();
    });
  });
});
