/**
 * Tests for Experiment Manager Module
 */

import {
  createExperiment,
  getExperiment,
  listExperiments,
  updateExperiment,
  addVariant,
  activateExperiment,
  stopExperiment,
  deleteExperiment,
  assignVariant,
  recordView,
  recordConversion,
  getExperimentResults,
  clearAllExperiments,
} from '../core/experiment-manager';
import { ValidationError, NotFoundError } from '../core/types';

describe('Experiment Manager', () => {
  beforeEach(() => {
    clearAllExperiments();
  });

  describe('createExperiment', () => {
    it('should create a new experiment with variants', () => {
      const experiment = createExperiment('tenant-1', {
        name: 'Pricing Test',
        description: 'Test pricing options',
        variants: [
          { name: 'control', price: 29.99 },
          { name: 'experiment', price: 39.99 },
        ],
      });

      expect(experiment.id).toBeDefined();
      expect(experiment.name).toBe('Pricing Test');
      expect(experiment.tenantId).toBe('tenant-1');
      expect(experiment.status).toBe('draft');
      expect(experiment.variants.length).toBe(2);
      expect(experiment.variants[0].weight).toBe(50);
      expect(experiment.variants[1].weight).toBe(50);
    });

    it('should throw error if name is missing', () => {
      expect(() =>
        createExperiment('tenant-1', {
          name: '',
          variants: [
            { name: 'control', price: 29.99 },
            { name: 'experiment', price: 39.99 },
          ],
        })
      ).toThrow(ValidationError);
    });

    it('should throw error if less than 2 variants', () => {
      expect(() =>
        createExperiment('tenant-1', {
          name: 'Test',
          variants: [{ name: 'control', price: 29.99 }],
        })
      ).toThrow(ValidationError);
    });

    it('should throw error if variant price is invalid', () => {
      expect(() =>
        createExperiment('tenant-1', {
          name: 'Test',
          variants: [
            { name: 'control', price: -10 },
            { name: 'experiment', price: 39.99 },
          ],
        })
      ).toThrow(ValidationError);
    });
  });

  describe('getExperiment', () => {
    it('should retrieve an existing experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      const retrieved = getExperiment(created.id, 'tenant-1');
      expect(retrieved.id).toBe(created.id);
    });

    it('should throw NotFoundError for non-existent experiment', () => {
      expect(() => getExperiment('non-existent', 'tenant-1')).toThrow(NotFoundError);
    });

    it('should throw NotFoundError for wrong tenant', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      expect(() => getExperiment(created.id, 'tenant-2')).toThrow(NotFoundError);
    });
  });

  describe('listExperiments', () => {
    it('should list experiments for a tenant', () => {
      createExperiment('tenant-1', {
        name: 'Test 1',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      createExperiment('tenant-1', {
        name: 'Test 2',
        variants: [
          { name: 'a', price: 19.99 },
          { name: 'b', price: 24.99 },
        ],
      });

      createExperiment('tenant-2', {
        name: 'Other',
        variants: [
          { name: 'a', price: 9.99 },
          { name: 'b', price: 14.99 },
        ],
      });

      const result = listExperiments('tenant-1');
      expect(result.total).toBe(2);
      expect(result.experiments.length).toBe(2);
    });

    it('should filter by status', () => {
      const exp = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      activateExperiment(exp.id, 'tenant-1');

      const drafts = listExperiments('tenant-1', { status: 'draft' });
      const active = listExperiments('tenant-1', { status: 'active' });

      expect(drafts.total).toBe(0);
      expect(active.total).toBe(1);
    });
  });

  describe('updateExperiment', () => {
    it('should update experiment name and description', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      const updated = updateExperiment(created.id, 'tenant-1', {
        name: 'Updated Name',
        description: 'New description',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('New description');
    });

    it('should not update completed experiments', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');
      stopExperiment(created.id, 'tenant-1');

      expect(() =>
        updateExperiment(created.id, 'tenant-1', { name: 'New Name' })
      ).toThrow(ValidationError);
    });
  });

  describe('activateExperiment', () => {
    it('should activate a draft experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      const activated = activateExperiment(created.id, 'tenant-1');
      expect(activated.status).toBe('active');
      expect(activated.startDate).toBeDefined();
    });

    it('should not activate an already active experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');

      expect(() => activateExperiment(created.id, 'tenant-1')).toThrow(
        ValidationError
      );
    });
  });

  describe('stopExperiment', () => {
    it('should stop an active experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');
      const stopped = stopExperiment(created.id, 'tenant-1');

      expect(stopped.status).toBe('completed');
      expect(stopped.endDate).toBeDefined();
    });
  });

  describe('assignVariant', () => {
    it('should consistently assign the same variant to a user', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'control', price: 29.99 },
          { name: 'experiment', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');

      const variant1 = assignVariant(created.id, 'user-123');
      const variant2 = assignVariant(created.id, 'user-123');

      expect(variant1).not.toBeNull();
      expect(variant2).not.toBeNull();
      expect(variant1!.id).toBe(variant2!.id);
    });

    it('should return null for inactive experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      const variant = assignVariant(created.id, 'user-123');
      expect(variant).toBeNull();
    });
  });

  describe('getExperimentResults', () => {
    it('should aggregate results from recorded events', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'control', price: 29.99 },
          { name: 'experiment', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');

      // Simulate some traffic
      const controlVariant = created.variants[0];
      const experimentVariant = created.variants[1];

      recordView(created.id, controlVariant.id);
      recordView(created.id, controlVariant.id);
      recordConversion(created.id, controlVariant.id, 29.99);

      recordView(created.id, experimentVariant.id);
      recordConversion(created.id, experimentVariant.id, 39.99);

      const results = getExperimentResults(created.id, 'tenant-1');

      expect(results.summary.totalViews).toBe(3);
      expect(results.summary.totalConversions).toBe(2);
      expect(results.summary.totalRevenue).toBe(69.98);
    });
  });

  describe('deleteExperiment', () => {
    it('should delete a draft experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      deleteExperiment(created.id, 'tenant-1');

      expect(() => getExperiment(created.id, 'tenant-1')).toThrow(NotFoundError);
    });

    it('should not delete an active experiment', () => {
      const created = createExperiment('tenant-1', {
        name: 'Test',
        variants: [
          { name: 'a', price: 29.99 },
          { name: 'b', price: 39.99 },
        ],
      });

      activateExperiment(created.id, 'tenant-1');

      expect(() => deleteExperiment(created.id, 'tenant-1')).toThrow(
        ValidationError
      );
    });
  });
});
