/**
 * Tests for Tenant Manager Module
 */

import {
  createTenant,
  getTenant,
  listTenants,
  updateTenant,
  deleteTenant,
  switchMode,
  changePlan,
  isUsageLimitExceeded,
  getRemainingUsage,
  resetUsage,
  incrementUsage,
  clearAllTenants,
} from '../multi-tenant/tenant-manager';
import { ValidationError, NotFoundError } from '../core/types';

describe('Tenant Manager', () => {
  beforeEach(() => {
    clearAllTenants();
  });

  describe('createTenant', () => {
    it('should create a tenant with default settings', () => {
      const tenant = createTenant('Test Company');

      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBe('Test Company');
      expect(tenant.plan).toBe('free');
      expect(tenant.mode).toBe('managed');
      expect(tenant.usageLimit).toBe(1000);
      expect(tenant.currentUsage).toBe(0);
    });

    it('should create a tenant with custom settings', () => {
      const tenant = createTenant('Pro Company', {
        plan: 'pro',
        mode: 'byok',
        defaultProvider: 'stripe',
      });

      expect(tenant.plan).toBe('pro');
      expect(tenant.mode).toBe('byok');
      expect(tenant.defaultProvider).toBe('stripe');
      expect(tenant.usageLimit).toBe(100000);
    });

    it('should throw error for empty name', () => {
      expect(() => createTenant('')).toThrow(ValidationError);
    });
  });

  describe('getTenant', () => {
    it('should retrieve an existing tenant', () => {
      const created = createTenant('Test');
      const retrieved = getTenant(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test');
    });

    it('should throw NotFoundError for non-existent tenant', () => {
      expect(() => getTenant('non-existent')).toThrow(NotFoundError);
    });
  });

  describe('listTenants', () => {
    it('should list all tenants', () => {
      createTenant('Tenant 1');
      createTenant('Tenant 2');
      createTenant('Tenant 3');

      const result = listTenants();
      expect(result.total).toBe(3);
    });

    it('should filter by plan', () => {
      createTenant('Free 1');
      createTenant('Pro 1', { plan: 'pro' });
      createTenant('Pro 2', { plan: 'pro' });

      const result = listTenants({ plan: 'pro' });
      expect(result.total).toBe(2);
    });

    it('should filter by mode', () => {
      createTenant('Managed 1');
      createTenant('BYOK 1', { mode: 'byok' });

      const result = listTenants({ mode: 'byok' });
      expect(result.total).toBe(1);
    });

    it('should support pagination', () => {
      for (let i = 0; i < 25; i++) {
        createTenant(`Tenant ${i}`);
      }

      const page1 = listTenants({ limit: 10, offset: 0 });
      const page2 = listTenants({ limit: 10, offset: 10 });

      expect(page1.tenants.length).toBe(10);
      expect(page2.tenants.length).toBe(10);
      expect(page1.total).toBe(25);
    });
  });

  describe('updateTenant', () => {
    it('should update tenant fields', () => {
      const created = createTenant('Original Name');

      const updated = updateTenant(created.id, {
        name: 'New Name',
        webhookUrl: 'https://example.com/webhook',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.webhookUrl).toBe('https://example.com/webhook');
    });

    it('should throw error for empty name', () => {
      const tenant = createTenant('Test');

      expect(() => updateTenant(tenant.id, { name: '' })).toThrow(ValidationError);
    });
  });

  describe('deleteTenant', () => {
    it('should delete an existing tenant', () => {
      const tenant = createTenant('Test');
      deleteTenant(tenant.id);

      expect(() => getTenant(tenant.id)).toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent tenant', () => {
      expect(() => deleteTenant('non-existent')).toThrow(NotFoundError);
    });
  });

  describe('switchMode', () => {
    it('should switch to BYOK mode with API key', () => {
      const tenant = createTenant('Test');

      const updated = switchMode(tenant.id, 'byok', {
        apiKey: 'test-api-key',
        baseUrl: 'https://custom.api.com',
      });

      expect(updated.mode).toBe('byok');
      expect(updated.paidApiKey).toBe('test-api-key');
      expect(updated.paidApiBaseUrl).toBe('https://custom.api.com');
    });

    it('should throw error when switching to BYOK without API key', () => {
      const tenant = createTenant('Test');

      expect(() => switchMode(tenant.id, 'byok')).toThrow(ValidationError);
    });

    it('should clear API key when switching to managed', () => {
      const tenant = createTenant('Test', { mode: 'byok' });
      updateTenant(tenant.id, { paidApiKey: 'test-key' });

      const updated = switchMode(tenant.id, 'managed');

      expect(updated.mode).toBe('managed');
      expect(updated.paidApiKey).toBeUndefined();
    });
  });

  describe('changePlan', () => {
    it('should change plan and update usage limit', () => {
      const tenant = createTenant('Test');
      expect(tenant.plan).toBe('free');
      expect(tenant.usageLimit).toBe(1000);

      const updated = changePlan(tenant.id, 'pro');

      expect(updated.plan).toBe('pro');
      expect(updated.usageLimit).toBe(100000);
    });
  });

  describe('usage tracking', () => {
    it('should track current usage', () => {
      const tenant = createTenant('Test');

      incrementUsage(tenant.id, 100);
      incrementUsage(tenant.id, 50);

      const updated = getTenant(tenant.id);
      expect(updated.currentUsage).toBe(150);
    });

    it('should detect when usage limit is exceeded', () => {
      const tenant = createTenant('Test'); // Free tier: 1000 limit

      incrementUsage(tenant.id, 1001);

      expect(isUsageLimitExceeded(tenant.id)).toBe(true);
    });

    it('should calculate remaining usage', () => {
      const tenant = createTenant('Test');
      incrementUsage(tenant.id, 300);

      const remaining = getRemainingUsage(tenant.id);
      expect(remaining).toBe(700);
    });

    it('should reset usage', () => {
      const tenant = createTenant('Test');
      incrementUsage(tenant.id, 500);

      resetUsage(tenant.id);

      const updated = getTenant(tenant.id);
      expect(updated.currentUsage).toBe(0);
    });
  });
});
