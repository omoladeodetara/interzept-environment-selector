/**
 * Tests for Price Calculator Module
 */

import {
  calculateElasticity,
  analyzeElasticity,
  calculateOptimalPrice,
  applyPsychologicalPricing,
  calculateRevenueImpact,
  calculateStatisticalSignificance,
} from '../core/price-calculator';
import { ValidationError, VariantMetrics } from '../core/types';

describe('Price Calculator', () => {
  describe('calculateElasticity', () => {
    it('should calculate negative elasticity when price increase reduces conversions', () => {
      const controlData = { price: 29.99, conversions: 100, views: 1000 };
      const experimentData = { price: 39.99, conversions: 70, views: 1000 };

      const elasticity = calculateElasticity(controlData, experimentData);
      
      // Price increased ~33%, conversions decreased ~30%
      // Elasticity should be negative (inverse relationship)
      expect(elasticity).toBeLessThan(0);
    });

    it('should calculate positive elasticity when price decrease increases conversions', () => {
      const controlData = { price: 39.99, conversions: 70, views: 1000 };
      const experimentData = { price: 29.99, conversions: 100, views: 1000 };

      const elasticity = calculateElasticity(controlData, experimentData);
      
      expect(elasticity).toBeLessThan(0);
    });

    it('should return 0 when prices are the same', () => {
      const controlData = { price: 29.99, conversions: 100, views: 1000 };
      const experimentData = { price: 29.99, conversions: 90, views: 1000 };

      const elasticity = calculateElasticity(controlData, experimentData);
      
      expect(elasticity).toBe(0);
    });

    it('should throw error for invalid prices', () => {
      expect(() => 
        calculateElasticity(
          { price: 0, conversions: 100, views: 1000 },
          { price: 29.99, conversions: 100, views: 1000 }
        )
      ).toThrow(ValidationError);
    });

    it('should throw error for invalid views', () => {
      expect(() => 
        calculateElasticity(
          { price: 29.99, conversions: 100, views: 0 },
          { price: 39.99, conversions: 100, views: 1000 }
        )
      ).toThrow(ValidationError);
    });
  });

  describe('analyzeElasticity', () => {
    it('should identify elastic demand (|E| > 1)', () => {
      const controlData = { price: 29.99, conversions: 100, views: 1000 };
      const experimentData = { price: 34.99, conversions: 50, views: 1000 };

      const analysis = analyzeElasticity(controlData, experimentData);
      
      expect(analysis.interpretation).toBe('elastic');
      expect(Math.abs(analysis.elasticity)).toBeGreaterThan(1);
    });

    it('should identify inelastic demand (|E| < 1)', () => {
      const controlData = { price: 29.99, conversions: 100, views: 1000 };
      const experimentData = { price: 39.99, conversions: 95, views: 1000 };

      const analysis = analyzeElasticity(controlData, experimentData);
      
      expect(analysis.interpretation).toBe('inelastic');
    });

    it('should include confidence interval', () => {
      const controlData = { price: 29.99, conversions: 100, views: 1000 };
      const experimentData = { price: 39.99, conversions: 70, views: 1000 };

      const analysis = analyzeElasticity(controlData, experimentData);
      
      expect(analysis.confidenceInterval.lower).toBeLessThan(analysis.elasticity);
      expect(analysis.confidenceInterval.upper).toBeGreaterThan(analysis.elasticity);
      expect(analysis.sampleSize).toBe(2000);
    });
  });

  describe('calculateOptimalPrice', () => {
    it('should suggest higher price for inelastic demand', () => {
      const currentPrice = 29.99;
      const elasticity = -0.5; // Inelastic

      const optimalPrice = calculateOptimalPrice(currentPrice, elasticity);
      
      expect(optimalPrice).toBeGreaterThan(currentPrice);
    });

    it('should suggest lower price for elastic demand', () => {
      const currentPrice = 39.99;
      const elasticity = -2.0; // Elastic

      const optimalPrice = calculateOptimalPrice(currentPrice, elasticity);
      
      expect(optimalPrice).toBeLessThan(currentPrice);
    });

    it('should throw error for non-positive price', () => {
      expect(() => calculateOptimalPrice(0, -1)).toThrow(ValidationError);
      expect(() => calculateOptimalPrice(-10, -1)).toThrow(ValidationError);
    });
  });

  describe('applyPsychologicalPricing', () => {
    it('should apply .99 ending for prices under $10', () => {
      expect(applyPsychologicalPricing(5.50)).toBe(5.99);
      expect(applyPsychologicalPricing(8.20)).toBe(8.99);
    });

    it('should apply -0.01 ending for medium prices', () => {
      expect(applyPsychologicalPricing(29.50)).toBe(29.99);
      expect(applyPsychologicalPricing(50.00)).toBe(49.99);
    });

    it('should round high prices to nearest $5 - $1', () => {
      expect(applyPsychologicalPricing(103.00)).toBe(104);
      expect(applyPsychologicalPricing(197.00)).toBe(194); // 200 - 1 = 199, but rounds to 195 first - 1 = 194
    });
  });

  describe('calculateRevenueImpact', () => {
    it('should calculate positive revenue impact for optimal price increase', () => {
      const impact = calculateRevenueImpact(29.99, 34.99, 100, -0.5);
      
      // With inelastic demand, price increase should increase revenue
      expect(impact).toBeGreaterThan(0);
    });

    it('should calculate negative revenue impact for wrong price increase', () => {
      const impact = calculateRevenueImpact(29.99, 49.99, 100, -2.0);
      
      // With elastic demand, big price increase should decrease revenue
      expect(impact).toBeLessThan(0);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateRevenueImpact(0, 29.99, 100, -1)).toBe(0);
      expect(calculateRevenueImpact(29.99, 39.99, 0, -1)).toBe(0);
    });
  });

  describe('calculateStatisticalSignificance', () => {
    it('should return high p-value for similar conversion rates', () => {
      const control: VariantMetrics = {
        variantId: 'a',
        variantName: 'Control',
        price: 29.99,
        views: 1000,
        conversions: 100,
        revenue: 2999,
        conversionRate: 0.10,
        averageOrderValue: 29.99,
        revenuePerView: 2.999,
      };

      const experiment: VariantMetrics = {
        variantId: 'b',
        variantName: 'Experiment',
        price: 39.99,
        views: 1000,
        conversions: 98,
        revenue: 3919.02,
        conversionRate: 0.098,
        averageOrderValue: 39.99,
        revenuePerView: 3.919,
      };

      const pValue = calculateStatisticalSignificance(control, experiment);
      
      // Small difference should have high p-value (not significant)
      expect(pValue).toBeGreaterThan(0.05);
    });

    it('should return low p-value for significantly different conversion rates', () => {
      const control: VariantMetrics = {
        variantId: 'a',
        variantName: 'Control',
        price: 29.99,
        views: 1000,
        conversions: 200,
        revenue: 5998,
        conversionRate: 0.20,
        averageOrderValue: 29.99,
        revenuePerView: 5.998,
      };

      const experiment: VariantMetrics = {
        variantId: 'b',
        variantName: 'Experiment',
        price: 39.99,
        views: 1000,
        conversions: 100,
        revenue: 3999,
        conversionRate: 0.10,
        averageOrderValue: 39.99,
        revenuePerView: 3.999,
      };

      const pValue = calculateStatisticalSignificance(control, experiment);
      
      // Large difference should have low p-value (significant)
      expect(pValue).toBeLessThan(0.05);
    });
  });
});
