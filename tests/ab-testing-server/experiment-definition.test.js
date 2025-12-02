/**
 * Integration tests for GET /api/experiments/:experimentId/definition endpoint
 * 
 * Tests the endpoint that jale uses to fetch experiment variants and configuration
 */

const request = require('supertest');

// Mock database module
jest.mock('../../ab-testing-server/database', () => ({
  getExperiment: jest.fn(),
  getExperimentByKey: jest.fn(),
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

describe('GET /api/experiments/:experimentId/definition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockExperiment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenant_id: '123e4567-e89b-12d3-a456-426614174001',
    key: 'pricing_test_001',
    name: 'Pricing Experiment 1',
    description: 'Testing two price points',
    status: 'active',
    variants: [
      { name: 'control', price: 29.99, weight: 0.5 },
      { name: 'experiment', price: 39.99, weight: 0.5 }
    ],
    target_sample_size: 1000,
    start_date: '2025-01-01T00:00:00Z',
    end_date: '2025-01-31T23:59:59Z',
    metadata: { tags: ['pricing', 'conversion'] }
  };

  it('should return experiment definition when experimentId is UUID', async () => {
    db.getExperiment.mockResolvedValue(mockExperiment);

    const response = await request(app)
      .get('/api/experiments/123e4567-e89b-12d3-a456-426614174000/definition')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      experimentId: 'pricing_test_001',
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Pricing Experiment 1',
      description: 'Testing two price points',
      status: 'active',
      variants: [
        { name: 'control', price: 29.99, weight: 0.5 },
        { name: 'experiment', price: 39.99, weight: 0.5 }
      ],
      targetSampleSize: 1000,
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-01-31T23:59:59Z',
      metadata: { tags: ['pricing', 'conversion'] }
    });

    expect(db.getExperiment).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
  });

  it('should return experiment definition when experimentId is key with tenantId', async () => {
    db.getExperimentByKey.mockResolvedValue(mockExperiment);

    const response = await request(app)
      .get('/api/experiments/pricing_test_001/definition')
      .query({ tenantId: '123e4567-e89b-12d3-a456-426614174001' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.experimentId).toBe('pricing_test_001');
    expect(response.body.variants).toHaveLength(2);
    expect(db.getExperimentByKey).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174001',
      'pricing_test_001'
    );
  });

  it('should return 404 when experiment not found', async () => {
    db.getExperiment.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/experiments/nonexistent/definition')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Experiment not found');
  });

  it('should handle database errors gracefully', async () => {
    const errorMessage = 'Database connection failed';
    db.getExperiment.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get('/api/experiments/123e4567-e89b-12d3-a456-426614174000/definition')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Internal server error');
    expect(response.body).toHaveProperty('message', errorMessage);
  });
});
