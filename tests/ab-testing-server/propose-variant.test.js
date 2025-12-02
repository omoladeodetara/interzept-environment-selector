/**
 * Integration tests for POST /api/jale/propose-variant endpoint
 * 
 * Tests the endpoint that allows jale to propose new variants for experiments
 */

const request = require('supertest');

// Mock database module
jest.mock('../../ab-testing-server/database', () => ({
  getExperiment: jest.fn(),
  getExperimentByKey: jest.fn(),
  getTenant: jest.fn(),
  updateExperiment: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined),
}));

// Mock config to avoid PAID_API_KEY requirement
jest.mock('../../ab-testing-server/config', () => ({
  paidApiKey: 'test-api-key',
  paidApiBaseUrl: 'https://api.paid.ai/v1',
  port: 3001,
  nodeEnv: 'development',
  webhookSecret: null,
  enableWebhookVerification: false,
  experimentDefaults: {
    controlWeight: 0.5,
    experimentWeight: 0.5
  }
}));

const db = require('../../ab-testing-server/database');
const app = require('../../ab-testing-server/server');

describe('POST /api/jale/propose-variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockExperiment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenant_id: '123e4567-e89b-12d3-a456-426614174001',
    key: 'pricing_test_001',
    name: 'Pricing Experiment 1',
    description: 'Testing price points',
    status: 'active',
    variants: [
      { name: 'control', price: 29.99, weight: 0.5 },
      { name: 'experiment', price: 39.99, weight: 0.5 }
    ],
    target_sample_size: 1000
  };

  const mockUpdatedExperiment = {
    ...mockExperiment,
    variants: [
      { name: 'control', price: 29.99, weight: 0.5 },
      { name: 'experiment', price: 39.99, weight: 0.5 },
      { name: 'variant_3', price: 34.99, weight: 0.0, metadata: {} }
    ]
  };

  it('should propose a new variant successfully', async () => {
    db.getExperiment.mockResolvedValue(mockExperiment);
    db.updateExperiment.mockResolvedValue(mockUpdatedExperiment);

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: '123e4567-e89b-12d3-a456-426614174000',
        price: 34.99
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      experimentId: 'pricing_test_001',
      variant: {
        name: 'variant_3',
        price: 34.99,
        weight: 0.0,
        metadata: {}
      }
    });

    expect(db.updateExperiment).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      expect.objectContaining({
        variants: expect.arrayContaining([
          expect.objectContaining({ name: 'control' }),
          expect.objectContaining({ name: 'experiment' }),
          expect.objectContaining({ name: 'variant_3', price: 34.99 })
        ])
      })
    );
  });

  it('should accept custom label for variant', async () => {
    db.getExperiment.mockResolvedValue(mockExperiment);
    db.updateExperiment.mockResolvedValue({
      ...mockExperiment,
      variants: [
        ...mockExperiment.variants,
        { name: 'premium', price: 49.99, weight: 0.0, metadata: {} }
      ]
    });

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: '123e4567-e89b-12d3-a456-426614174000',
        price: 49.99,
        label: 'premium'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.variant.name).toBe('premium');
    expect(response.body.variant.price).toBe(49.99);
  });

  it('should support tenantId for experiment lookup', async () => {
    db.getTenant.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Test Tenant' });
    db.getExperimentByKey.mockResolvedValue(mockExperiment);
    db.updateExperiment.mockResolvedValue(mockUpdatedExperiment);

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: 'pricing_test_001',
        tenantId: '123e4567-e89b-12d3-a456-426614174001',
        price: 34.99
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(db.getTenant).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
    expect(db.getExperimentByKey).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174001',
      'pricing_test_001'
    );
  });

  it('should accept metadata for variant', async () => {
    db.getExperiment.mockResolvedValue(mockExperiment);
    db.updateExperiment.mockResolvedValue(mockUpdatedExperiment);

    const metadata = { source: 'jale', confidence: 0.85 };

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: '123e4567-e89b-12d3-a456-426614174000',
        price: 34.99,
        metadata
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.variant.metadata).toEqual(metadata);
  });

  it('should return 400 when experimentId is missing', async () => {
    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({ price: 34.99 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid or missing experimentId');
    expect(db.updateExperiment).not.toHaveBeenCalled();
  });

  it('should return 400 when price is missing', async () => {
    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({ experimentId: 'pricing_test_001' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid or missing price (must be a positive number)');
  });

  it('should return 400 when price is not a number', async () => {
    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({ experimentId: 'pricing_test_001', price: 'invalid' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid or missing price (must be a positive number)');
  });

  it('should return 400 when price is negative', async () => {
    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({ experimentId: 'pricing_test_001', price: -10.00 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid or missing price (must be a positive number)');
  });

  it('should return 400 when price is zero', async () => {
    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({ experimentId: 'pricing_test_001', price: 0 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.error).toBe('Invalid or missing price (must be a positive number)');
  });

  it('should return 404 when experiment not found', async () => {
    db.getExperiment.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: 'nonexistent',
        price: 34.99
      })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.error).toBe('Experiment not found');
  });

  it('should return 404 when tenant not found', async () => {
    db.getTenant.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: 'pricing_test_001',
        tenantId: 'nonexistent-tenant',
        price: 34.99
      })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body.error).toBe('Tenant not found');
  });

  it('should handle database errors gracefully', async () => {
    const errorMessage = 'Database update failed';
    db.getExperiment.mockResolvedValue(mockExperiment);
    db.updateExperiment.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .post('/api/jale/propose-variant')
      .send({
        experimentId: '123e4567-e89b-12d3-a456-426614174000',
        price: 34.99
      })
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Internal server error');
    expect(response.body).toHaveProperty('message', errorMessage);
  });
});
