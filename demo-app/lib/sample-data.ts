/**
 * Sample data for demo app
 * This is used for initial rendering and fallbacks when API is not available
 */

export const sampleDashboard = {
  activeExperiments: 3,
  completedExperiments: 12,
  totalRevenue: 45650,
  avgConversionRate: 18.5,
};

export const sampleExperiments = [
  {
    id: 'exp_001',
    tenantId: 'tenant_001',
    key: 'pricing_test_001',
    name: 'Premium Plan Pricing Test',
    description: 'Testing $29.99 vs $39.99 for premium plan',
    status: 'active',
    variants: [
      { id: 'v1', name: 'control', price: 29.99, weight: 50 },
      { id: 'v2', name: 'experiment', price: 39.99, weight: 50 },
    ],
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'exp_002',
    tenantId: 'tenant_001',
    key: 'annual_discount_test',
    name: 'Annual Discount Test',
    description: 'Testing 15% vs 20% annual discount',
    status: 'completed',
    variants: [
      { id: 'v1', name: 'control', price: 299.99, weight: 50 },
      { id: 'v2', name: 'experiment', price: 279.99, weight: 50 },
    ],
    createdAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'exp_003',
    tenantId: 'tenant_001',
    key: 'starter_plan_test',
    name: 'Starter Plan Pricing',
    description: 'Testing $9.99 vs $14.99 for starter plan',
    status: 'draft',
    variants: [
      { id: 'v1', name: 'control', price: 9.99, weight: 50 },
      { id: 'v2', name: 'experiment', price: 14.99, weight: 50 },
    ],
    createdAt: '2024-11-20T00:00:00Z',
  },
];

export const sampleRecommendations = [
  {
    id: 'rec_001',
    experimentId: 'exp_001',
    experimentName: 'Premium Plan Pricing Test',
    recommendedPrice: 35.99,
    currentPrice: 29.99,
    expectedRevenue: 7917.80,
    currentRevenue: 7197.60,
    lift: '+10.0%',
    confidence: 0.85,
    createdAt: '2024-11-25T00:00:00Z',
  },
  {
    id: 'rec_002',
    experimentId: 'exp_002',
    experimentName: 'Annual Discount Test',
    recommendedPrice: 289.99,
    currentPrice: 299.99,
    expectedRevenue: 15420.00,
    currentRevenue: 14985.00,
    lift: '+2.9%',
    confidence: 0.72,
    createdAt: '2024-11-22T00:00:00Z',
  },
];

export const sampleTenant = {
  id: 'tenant_001',
  name: 'Demo Company',
  email: 'demo@example.com',
  mode: 'managed' as const,
  plan: 'starter' as const,
  createdAt: '2024-10-01T00:00:00Z',
};

export const sampleUsage = {
  signals: { used: 3245, limit: 10000 },
  apiCalls: { used: 1567, limit: 50000 },
  activeExperiments: { used: 2, limit: 5 },
};

export const sampleBilling = {
  period: { start: '2024-11-01', end: '2024-11-30' },
  baseSubscription: 29.00,
  overageCharges: 0.00,
  totalDue: 29.00,
};
