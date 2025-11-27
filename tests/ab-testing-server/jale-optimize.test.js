/**
 * Integration tests for POST /api/jale/optimize endpoint
 * 
 * These tests stub jale.recommendPrice to avoid external dependencies
 * and verify the endpoint correctly handles requests and responses.
 */

const request = require('supertest');

// Mock the jale module before requiring the app
jest.mock('../../jale', () => ({
  recommendPrice: jest.fn()
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

const jale = require('../../jale');
const app = require('../../ab-testing-server/server');

describe('POST /api/jale/optimize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return pricing recommendation when experimentId is provided', async () => {
    const mockResult = {
      recommendedPrice: 35.99,
      expectedRevenue: 1799.50,
      confidence: 0.5,
      simulation: [
        { price: 29.99, estimatedCv: 0.12, expectedRevenue: 3598.80 },
        { price: 35.99, estimatedCv: 0.10, expectedRevenue: 3599.00 },
        { price: 39.99, estimatedCv: 0.08, expectedRevenue: 3199.20 }
      ]
    };

    jale.recommendPrice.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/api/jale/optimize')
      .send({ experimentId: 'pricing_test_001' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(mockResult);
    expect(jale.recommendPrice).toHaveBeenCalledWith({
      experimentId: 'pricing_test_001',
      objective: undefined,
      candidates: undefined,
      lookbackDays: undefined
    });
  });

  it('should pass optional parameters to jale.recommendPrice', async () => {
    const mockResult = {
      recommendedPrice: 29.99,
      expectedRevenue: 2999.00,
      confidence: 0.6,
      simulation: []
    };

    jale.recommendPrice.mockResolvedValue(mockResult);

    const requestBody = {
      experimentId: 'pricing_test_002',
      objective: 'conversion',
      candidates: [19.99, 29.99, 39.99],
      lookbackDays: 14
    };

    const response = await request(app)
      .post('/api/jale/optimize')
      .send(requestBody)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(mockResult);
    expect(jale.recommendPrice).toHaveBeenCalledWith({
      experimentId: 'pricing_test_002',
      objective: 'conversion',
      candidates: [19.99, 29.99, 39.99],
      lookbackDays: 14
    });
  });

  it('should return 400 when experimentId is missing', async () => {
    const response = await request(app)
      .post('/api/jale/optimize')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid or missing experimentId');
    expect(jale.recommendPrice).not.toHaveBeenCalled();
  });

  it('should return 400 when experimentId is not a string', async () => {
    const response = await request(app)
      .post('/api/jale/optimize')
      .send({ experimentId: 123 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid or missing experimentId');
    expect(jale.recommendPrice).not.toHaveBeenCalled();
  });

  it('should return 400 when experimentId is empty string', async () => {
    const response = await request(app)
      .post('/api/jale/optimize')
      .send({ experimentId: '' })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(jale.recommendPrice).not.toHaveBeenCalled();
  });

  it('should return 500 with error message in development when jale throws', async () => {
    const errorMessage = 'Failed to fetch experiment data';
    jale.recommendPrice.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .post('/api/jale/optimize')
      .send({ experimentId: 'pricing_test_001' })
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Internal server error');
    expect(response.body).toHaveProperty('message', errorMessage);
  });
});
