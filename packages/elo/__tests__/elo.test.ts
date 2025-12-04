/// <reference types="jest" />
/**
 * Tests for Elo A/B Testing Module
 */

import {
  assignVariant,
  getExperimentVariant,
  trackConversion,
  getExperimentResults,
  getAllAssignments,
  clearAll,
  setStorageAdapter,
  getStorageAdapter,
  setConfig,
  StorageAdapter
} from '../index';

describe('Elo A/B Testing Module', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await clearAll();
    // Set test config
    setConfig({ nodeEnv: 'test' });
  });

  describe('assignVariant', () => {
    it('should assign a user to a variant', async () => {
      const variant = await assignVariant('user1', 'exp1');
      expect(['control', 'experiment']).toContain(variant);
    });

    it('should return the same variant for the same user and experiment', async () => {
      const variant1 = await assignVariant('user1', 'exp1');
      const variant2 = await assignVariant('user1', 'exp1');
      expect(variant1).toBe(variant2);
    });

    it('should potentially assign different variants for different users', async () => {
      // With enough users, we should see both variants
      const variants = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const variant = await assignVariant(`user_${i}`, 'exp1');
        variants.add(variant);
      }
      // Both variants should appear with 100 users and 50/50 split
      expect(variants.size).toBe(2);
    });

    it('should throw error for invalid userId', async () => {
      await expect(assignVariant('', 'exp1')).rejects.toThrow('Invalid userId');
      await expect(assignVariant(null as any, 'exp1')).rejects.toThrow('Invalid userId');
    });

    it('should throw error for invalid experimentId', async () => {
      await expect(assignVariant('user1', '')).rejects.toThrow('Invalid experimentId');
      await expect(assignVariant('user1', null as any)).rejects.toThrow('Invalid experimentId');
    });

    it('should respect custom weights', async () => {
      // Assign many users with 100% control weight
      const variants: string[] = [];
      for (let i = 0; i < 50; i++) {
        const variant = await assignVariant(`user_control_${i}`, 'exp_weighted', {
          controlWeight: 1.0,
          experimentWeight: 0.0
        });
        variants.push(variant);
      }
      // All should be control
      expect(variants.every(v => v === 'control')).toBe(true);
    });
  });

  describe('getExperimentVariant', () => {
    it('should return the assigned variant', async () => {
      const assigned = await assignVariant('user1', 'exp1');
      const retrieved = await getExperimentVariant('user1', 'exp1');
      expect(retrieved).toBe(assigned);
    });

    it('should return null for non-existent assignment', async () => {
      const variant = await getExperimentVariant('nonexistent', 'exp1');
      expect(variant).toBeNull();
    });
  });

  describe('trackConversion', () => {
    it('should track a conversion for an assigned user', async () => {
      await assignVariant('user1', 'exp1');
      const results = await trackConversion('user1', 'exp1', { revenue: 29.99 });
      expect(results).not.toBeNull();
    });

    it('should throw error for user without assignment', async () => {
      await expect(
        trackConversion('nonexistent', 'exp1', { revenue: 10 })
      ).rejects.toThrow('No variant assignment found');
    });

    it('should accumulate revenue correctly', async () => {
      await assignVariant('user1', 'exp1');
      await assignVariant('user2', 'exp1');
      
      await trackConversion('user1', 'exp1', { revenue: 29.99 });
      await trackConversion('user2', 'exp1', { revenue: 39.99 });
      
      const results = await getExperimentResults('exp1');
      const totalRevenue = parseFloat(results.summary.totalRevenue);
      expect(totalRevenue).toBeCloseTo(69.98, 2);
    });
  });

  describe('getExperimentResults', () => {
    it('should return not_found for non-existent experiment', async () => {
      const results = await getExperimentResults('nonexistent');
      expect(results.status).toBe('not_found');
    });

    it('should return correct statistics', async () => {
      // Create some assignments
      for (let i = 0; i < 10; i++) {
        await assignVariant(`user_${i}`, 'stats_exp');
      }
      
      // Track some conversions
      await trackConversion('user_0', 'stats_exp', { revenue: 29.99 });
      
      const results = await getExperimentResults('stats_exp');
      
      expect(results.experimentId).toBe('stats_exp');
      expect(results.summary.totalViews).toBe(10);
      expect(results.summary.totalConversions).toBe(1);
    });
  });

  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      await assignVariant('user1', 'exp1');
      await assignVariant('user2', 'exp1');
      await assignVariant('user3', 'exp2');
      
      const assignments = await getAllAssignments();
      expect(assignments.length).toBe(3);
    });
  });

  describe('StorageAdapter', () => {
    it('should allow custom storage adapter', async () => {
      // Create a mock adapter
      const mockAssignments = new Map<string, string>();
      const mockAdapter: StorageAdapter = {
        getAssignment: jest.fn(async (userId, expId) => mockAssignments.get(`${userId}:${expId}`) || null),
        setAssignment: jest.fn(async (userId, expId, variant) => {
          mockAssignments.set(`${userId}:${expId}`, variant);
        }),
        getResults: jest.fn(async () => ({ 
          control: { views: 0, conversions: 0, revenue: 0 },
          experiment: { views: 0, conversions: 0, revenue: 0 }
        })),
        initResults: jest.fn(async () => {}),
        incrementViews: jest.fn(async () => {}),
        incrementConversions: jest.fn(async () => {}),
        getAllAssignments: jest.fn(async () => []),
        clear: jest.fn(async () => { mockAssignments.clear(); })
      };
      
      const originalAdapter = getStorageAdapter();
      setStorageAdapter(mockAdapter);
      
      await assignVariant('testUser', 'testExp');
      
      expect(mockAdapter.setAssignment).toHaveBeenCalled();
      
      // Restore original adapter
      setStorageAdapter(originalAdapter);
    });
  });

  describe('Deterministic Hashing', () => {
    it('should produce consistent results across multiple runs', async () => {
      // This tests that the same user+experiment always gets the same variant
      const results: string[] = [];
      
      for (let run = 0; run < 5; run++) {
        await clearAll();
        const variant = await assignVariant('consistent_user', 'consistent_exp');
        results.push(variant);
      }
      
      // All results should be the same
      expect(new Set(results).size).toBe(1);
    });
  });
});
