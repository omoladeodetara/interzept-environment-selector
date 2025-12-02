/**
 * A/B Testing Server for Paid.ai Pricing Experiments
 * 
 * This server implements A/B testing for pricing experiments
 * using Paid.ai's APIs and webhooks with OpenAPI specification.
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const config = require('./config');
const abTesting = require('./ab-testing');
const signals = require('./signals');
const jale = require('../jale');
const db = require('./database');
const tenantRoutes = require('./tenants');

const app = express();

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'A/B Testing Server - API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  // Test database connection
  const dbHealthy = await db.testConnection().catch(() => false);
  
  res.json({ 
    status: dbHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

/**
 * Tenant management routes
 * Mounted at /api/tenants
 */
app.use('/api/tenants', tenantRoutes);

/**
 * Tenant-aware pricing endpoint
 * GET /api/experiments/:experimentId/pricing
 * 
 * This is the new multi-tenant endpoint that supports BYOK and Managed modes
 */
app.get('/api/experiments/:experimentId/pricing', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { userId, tenantId } = req.query;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    
    // Lookup experiment (supports both UUID and key)
    let experiment;
    if (tenantId) {
      // If tenantId provided, lookup by key
      const tenant = await db.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      experiment = await db.getExperimentByKey(tenantId, experimentId);
    } else {
      // Try to lookup by UUID (backward compatibility)
      experiment = await db.getExperiment(experimentId);
    }
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get or create assignment
    let assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      // Assign variant using deterministic algorithm
      const variant = abTesting.assignVariant(userId, experimentId);
      assignment = await db.createAssignment(experiment.id, userId, variant);
    }
    
    // Get variant details from experiment
    let variantData = experiment.variants.find(v => v.name === assignment.variant);
    
    if (!variantData) {
      // Fallback to first variant if not found
      variantData = experiment.variants[0];
    }
    
    // Record view
    await db.recordView(experiment.id, userId, assignment.variant);
    
    // Emit signal to Paid.ai (non-blocking)
    // Use tenant's API key if BYOK mode
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key)
        .catch(error => {
          console.error('Failed to emit pricing view signal:', error.message);
        });
    } else {
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId)
        .catch(error => {
          console.error('Failed to emit pricing view signal:', error.message);
        });
    }
    
    res.json({
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      pricing: {
        plan: variantData.name.charAt(0).toUpperCase() + variantData.name.slice(1),
        price: variantData.price,
        features: ['Feature A', 'Feature B', 'Feature C'] // Customize as needed
      }
    });
  } catch (error) {
    console.error('Error in /api/experiments/:experimentId/pricing:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Tenant-aware conversion endpoint
 * POST /api/experiments/:experimentId/convert
 */
app.post('/api/experiments/:experimentId/convert', async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { userId, tenantId, revenue } = req.body;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Lookup experiment
    let experiment;
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      experiment = await db.getExperimentByKey(tenantId, experimentId);
    } else {
      experiment = await db.getExperiment(experimentId);
    }
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Get assignment
    const assignment = await db.getAssignment(experiment.id, userId);
    
    if (!assignment) {
      return res.status(404).json({ 
        error: 'No variant assignment found for this user and experiment' 
      });
    }
    
    // Get variant price if revenue not provided
    const variantData = experiment.variants.find(v => v.name === assignment.variant);
    const conversionRevenue = revenue || variantData?.price || 0;
    
    // Record conversion
    await db.recordConversion(
      experiment.id,
      userId,
      assignment.variant,
      conversionRevenue
    );
    
    // Emit conversion signal to Paid.ai (non-blocking)
    if (tenantId) {
      const tenant = await db.getTenant(tenantId);
      signals.emitConversionSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key)
        .catch(error => {
          console.error('Failed to emit conversion signal:', error.message);
        });
    } else {
      signals.emitConversionSignal(userId, assignment.variant, experimentId)
        .catch(error => {
          console.error('Failed to emit conversion signal:', error.message);
        });
    }
    
    res.json({
      success: true,
      userId,
      experimentId: experiment.key,
      variant: assignment.variant,
      revenue: conversionRevenue
    });
  } catch (error) {
    console.error('Error in /api/experiments/:experimentId/convert:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get experiment results
 * GET /api/experiments/:experimentId/results
 */
app.get('/api/experiments/:experimentId/results', async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    // Try to lookup experiment (supports both UUID and key with tenant context)
    let experiment = await db.getExperiment(experimentId);
    
    if (!experiment) {
      // Try old format lookup
      const results = abTesting.getExperimentResults(experimentId);
      return res.json(results);
    }
    
    // Get results from database
    const results = await db.getExperimentResults(experiment.id);
    
    res.json(results);
  } catch (error) {
    console.error('Error in /api/experiments/:experimentId/results:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Legacy /api/pricing endpoint (backward compatibility)
 * 
 * This endpoint assigns users to a variant and emits a signal to Paid.ai
 * tracking which pricing they saw.
 */
app.get('/api/pricing', async (req, res) => {
  try {
    // Get or generate user ID (in production, this would come from authentication)
    const userId = req.query.userId || req.headers['x-user-id'] || `user_${Date.now()}`;
    const experimentId = req.query.experimentId || 'pricing_test_001';
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId parameter' 
      });
    }
    
    // Assign user to a variant
    const variant = abTesting.assignVariant(userId, experimentId);
    
    // Define pricing based on variant
    const pricing = variant === 'control' 
      ? {
          plan: 'Standard',
          price: 29.99,
          features: ['Feature A', 'Feature B', 'Feature C']
        }
      : {
          plan: 'Premium',
          price: 39.99,
          features: ['Feature A', 'Feature B', 'Feature C', 'Feature D']
        };
    
    // Emit signal to Paid.ai (non-blocking)
    signals.emitPricingViewSignal(userId, variant, experimentId)
      .catch(error => {
        console.error('Failed to emit pricing view signal:', error.message);
        // Don't fail the request if signal emission fails
      });
    
    res.json({
      userId,
      experimentId,
      variant,
      pricing
    });
  } catch (error) {
    console.error('Error in /api/pricing:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Simulate a conversion (subscription/purchase)
 * 
 * In a real application, this would be called after successful payment
 * or integrated with your payment processor.
 */
app.post('/api/convert', async (req, res) => {
  try {
    const { userId, experimentId } = req.body;
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing userId' 
      });
    }
    
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    // Get the user's variant
    const variant = abTesting.getExperimentVariant(userId, experimentId);
    
    if (!variant) {
      return res.status(404).json({ 
        error: 'No variant assignment found for this user and experiment' 
      });
    }
    
    // Simulate revenue (in production, this would come from actual payment)
    const revenue = variant === 'control' ? 29.99 : 39.99;
    
    // Track conversion in A/B testing system
    abTesting.trackConversion(userId, experimentId, { 
      revenue,
      timestamp: new Date()
    });
    
    // Emit conversion signal to Paid.ai (non-blocking)
    signals.emitConversionSignal(userId, variant, experimentId)
      .catch(error => {
        console.error('Failed to emit conversion signal:', error.message);
        // Don't fail the request if signal emission fails
      });
    
    res.json({
      success: true,
      userId,
      experimentId,
      variant,
      revenue
    });
  } catch (error) {
    console.error('Error in /api/convert:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Paid.ai webhook endpoint
 * 
 * Receives webhook events from Paid.ai about subscriptions, payments, etc.
 * Links these events to A/B test experiments for tracking.
 * 
 * SECURITY WARNING: Webhook signature verification should be enabled in production.
 */
app.post('/webhooks/paid', async (req, res) => {
  try {
    const event = req.body;
    
    // Validate event data exists
    if (!event || !event.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Webhook signature verification (if enabled)
    if (config.enableWebhookVerification) {
      if (!config.webhookSecret) {
        console.error('Webhook verification enabled but WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      // TODO: Implement actual signature verification based on Paid.ai's webhook signature scheme
      // Until implemented, return error to prevent insecure webhook processing
      console.error('Webhook signature verification is enabled but not yet implemented');
      return res.status(501).json({ 
        error: 'Webhook signature verification not implemented',
        message: 'Set ENABLE_WEBHOOK_VERIFICATION=false to process webhooks without verification (development only)'
      });
      
      // Example implementation when ready:
      //   const signature = req.headers['x-paid-signature'];
      //   const crypto = require('crypto');
      //   const computedSignature = crypto
      //     .createHmac('sha256', config.webhookSecret)
      //     .update(JSON.stringify(req.body))
      //     .digest('hex');
      //   
      //   if (signature !== computedSignature) {
      //     return res.status(401).json({ error: 'Invalid webhook signature' });
      //   }
    }
    
    // Log webhook event (development only)
    if (config.nodeEnv === 'development') {
      console.log('Received webhook event:', JSON.stringify(event, null, 2));
    }
    
    // Extract customer and experiment data from webhook
    // NOTE: These field names are examples. Adjust based on actual Paid.ai webhook structure
    const customerId = event.data.customer_id || event.data.customerId;
    const experimentId = event.data.metadata?.experiment_id || 'pricing_test_001';
    
    if (!customerId) {
      console.warn('Webhook received without customer_id');
      return res.status(200).send('OK'); // Accept webhook but don't process
    }
    
    // Event-specific validation and processing
    if (event.type === 'subscription.created') {
      const amount = event.data.amount || event.data.plan?.amount;
      
      if (
        !amount ||
        typeof amount !== 'number' ||
        amount <= 0 ||
        !isFinite(amount)
      ) {
        console.warn('Invalid amount in subscription webhook');
        return res.status(200).send('OK');
      }
      
      // Track conversion - trackConversion will look up the variant internally
      // and throw an error if no variant is found
      try {
        abTesting.trackConversion(
          customerId,
          experimentId,
          {
            revenue: amount,
            timestamp: new Date(),
            eventType: event.type
          }
        );
        
        // Get variant for logging purposes only
        const variant = abTesting.getExperimentVariant(customerId, experimentId);
        console.log(`Tracked conversion from webhook: user=${customerId}, variant=${variant}, revenue=${amount}`);
      } catch (conversionError) {
        console.warn(`Failed to track conversion: ${conversionError.message}`);
      }
    }
    
    // Acknowledge webhook receipt
    res.status(200).send('OK');
  } catch (error) {
    // Log error but still acknowledge webhook to prevent retries
    console.error('Error processing webhook:', error);
    
    // In production, consider using a dead letter queue or retry mechanism
    // for failed webhook processing
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get experiment results
 * 
 * Returns analytics and statistics for an A/B test experiment.
 */
app.get('/api/experiments/:experimentId/results', (req, res) => {
  try {
    const { experimentId } = req.params;
    
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid experimentId parameter' 
      });
    }
    
    const results = abTesting.getExperimentResults(experimentId);
    res.json(results);
  } catch (error) {
    console.error('Error in /api/experiments/:experimentId/results:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get pricing recommendation from jale optimization service
 * 
 * Calls the jale service to recommend a price based on experiment data
 * and returns the result. Requires experimentId in request body.
 */
app.post('/api/jale/optimize', async (req, res) => {
  try {
    const { experimentId, objective, candidates, lookbackDays } = req.body;
    
    // Validate required experimentId
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    // Call jale recommendation service (non-blocking for the event loop)
    const result = await jale.recommendPrice({ 
      experimentId, 
      objective, 
      candidates, 
      lookbackDays 
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error in /api/jale/optimize:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get all experiment assignments (for debugging/testing)
 */
app.get('/api/debug/assignments', (req, res) => {
  if (config.nodeEnv !== 'development') {
    return res.status(403).json({ 
      error: 'This endpoint is only available in development mode' 
    });
  }
  
  const assignments = abTesting.getAllAssignments();
  res.json({ 
    count: assignments.length,
    assignments 
  });
});

/**
 * 404 handler
 * Must be placed before error handling middleware
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

/**
 * Error handling middleware
 * Must be placed last to catch all errors
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server only when run directly (not when imported for testing)
let server;
if (require.main === module) {
  server = app.listen(config.port, () => {
    console.log('='.repeat(50));
    console.log('🚀 A/B Testing Server Started');
    console.log('='.repeat(50));
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Server running at: http://localhost:${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`API Documentation: http://localhost:${config.port}/api-docs`);
    console.log('='.repeat(50));
    console.log('\nAvailable endpoints:');
    console.log('  Tenant Management:');
    console.log('    POST /api/tenants - Create a new tenant');
    console.log('    GET  /api/tenants - List all tenants');
    console.log('    GET  /api/tenants/:id - Get tenant details');
    console.log('    POST /api/tenants/:id/experiments - Create experiment for tenant');
    console.log('  Experiments:');
    console.log('    GET  /api/experiments/:id/pricing - Get pricing with variant (tenant-aware)');
    console.log('    POST /api/experiments/:id/convert - Record conversion (tenant-aware)');
    console.log('    GET  /api/experiments/:id/results - Get experiment results');
    console.log('  Legacy (backward compatibility):');
    console.log('    GET  /api/pricing - Get pricing with A/B test variant');
    console.log('    POST /api/convert - Simulate a conversion');
    console.log('  Optimization:');
    console.log('    POST /api/jale/optimize - Get pricing recommendation from jale');
    console.log('  Webhooks:');
    console.log('    POST /webhooks/paid - Paid.ai webhook endpoint');
    if (config.nodeEnv === 'development') {
      console.log('  Debug:');
      console.log('    GET  /api/debug/assignments - View all assignments (dev only)');
    }
    console.log('='.repeat(50));
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('\nSIGTERM received, shutting down gracefully...');
    server.close(() => {
      db.close().then(() => {
        console.log('Server and database connections closed');
        process.exit(0);
      }).catch((err) => {
        console.error('Error closing database:', err);
        process.exit(1);
      });
    });
  });

  process.on('SIGINT', async () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    server.close(() => {
      db.close().then(() => {
        console.log('Server and database connections closed');
        process.exit(0);
      }).catch((err) => {
        console.error('Error closing database:', err);
        process.exit(1);
      });
    });
  });
}

module.exports = app;
