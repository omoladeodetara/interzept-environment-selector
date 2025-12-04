/**
 * A/B Testing Server for Paid.ai Pricing Experiments
 * 
 * This server implements A/B testing for pricing experiments
 * using Paid.ai's APIs and webhooks with OpenAPI specification.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import config from './config';
// Use compiled TypeScript module for A/B testing logic
import * as elo from './index';
import * as signals from './signals';
// Jale pricing engine from root jale/ module (compiles to dist/)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jale = require('../../jale');
import * as db from './database';
import tenantRoutes from './tenants';

const app: Express = express();

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware using cors package
const corsOptions: cors.CorsOptions = {
  origin: config.nodeEnv === 'development' 
    ? 'http://localhost:3002'
    : (origin, callback) => {
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
          ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
          : [];
        
        // If no origins configured in production, allow no CORS (same as before)
        if (allowedOrigins.length === 0) {
          callback(null, false);
        } else if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
  credentials: config.nodeEnv === 'production', // Only enable credentials in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'A/B Testing Server - API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// Types
// ============================================================================

interface PricingQuery {
  userId?: string;
  tenantId?: string;
}

interface ConvertBody {
  userId: string;
  tenantId?: string;
  revenue?: number;
}

interface LegacyPricingQuery {
  userId?: string;
  experimentId?: string;
}

interface LegacyConvertBody {
  userId: string;
  experimentId: string;
}

interface WebhookEvent {
  type: string;
  data: {
    customer_id?: string;
    customerId?: string;
    amount?: number;
    plan?: { amount?: number };
    metadata?: { experiment_id?: string };
  };
}

interface JaleOptimizeBody {
  experimentId: string;
  objective?: string;
  candidates?: number[];
  lookbackDays?: number;
}

interface ProposeVariantBody {
  experimentId: string;
  tenantId?: string;
  price: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to lookup experiment by ID or key
 */
async function lookupExperiment(experimentId: string, tenantId?: string) {
  if (tenantId) {
    // Validate tenant exists before looking up experiment
    const tenant = await db.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return await db.getExperimentByKey(tenantId, experimentId);
  } else {
    return await db.getExperiment(experimentId);
  }
}

// ============================================================================
// Routes
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', async (_req: Request, res: Response) => {
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
app.get('/api/experiments/:experimentId/pricing', async (
  req: Request<{ experimentId: string }, unknown, unknown, PricingQuery>, 
  res: Response
) => {
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
      const variant = await elo.assignVariant(userId, experimentId);
      assignment = await db.createAssignment(experiment.id, userId, variant);
    }
    
    // Get variant details from experiment
    let variantData = experiment.variants.find(v => v.name === assignment!.variant);
    
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
      signals.emitPricingViewSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
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
  } catch (error: unknown) {
    console.error('Error in /api/experiments/:experimentId/pricing:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Tenant-aware conversion endpoint
 * POST /api/experiments/:experimentId/convert
 */
app.post('/api/experiments/:experimentId/convert', async (
  req: Request<{ experimentId: string }, unknown, ConvertBody>,
  res: Response
) => {
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
      signals.emitConversionSignal(userId, assignment.variant, experimentId, tenant?.paid_api_key || undefined)
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
  } catch (error: unknown) {
    console.error('Error in /api/experiments/:experimentId/convert:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Get experiment definition (variants and configuration)
 * GET /api/experiments/:experimentId/definition
 * 
 * Returns experiment details including variants for jale to use
 */
app.get('/api/experiments/:experimentId/definition', async (
  req: Request<{ experimentId: string }, unknown, unknown, { tenantId?: string }>,
  res: Response
) => {
  try {
    const { experimentId } = req.params;
    const { tenantId } = req.query;
    
    const experiment = await lookupExperiment(experimentId, tenantId);
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Return experiment definition with variants
    res.json({
      experimentId: experiment.key,
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      status: experiment.status,
      variants: experiment.variants,
      targetSampleSize: experiment.target_sample_size,
      startDate: experiment.start_date,
      endDate: experiment.end_date,
      metadata: experiment.metadata
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '';
    // Handle tenant not found error
    if (errorMessage === 'Tenant not found') {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    console.error('Error in /api/experiments/:experimentId/definition:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Get experiment results
 * GET /api/experiments/:experimentId/results
 */
app.get('/api/experiments/:experimentId/results', async (
  req: Request<{ experimentId: string }>,
  res: Response
) => {
  try {
    const { experimentId } = req.params;
    
    // Try to lookup experiment (supports both UUID and key with tenant context)
    const experiment = await db.getExperiment(experimentId);
    
    if (!experiment) {
      // Try old format lookup
      const results = await elo.getExperimentResults(experimentId);
      return res.json(results);
    }
    
    // Get results from database
    const results = await db.getExperimentResults(experiment.id);
    
    res.json(results);
  } catch (error: unknown) {
    console.error('Error in /api/experiments/:experimentId/results:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Legacy /api/pricing endpoint (backward compatibility)
 * 
 * This endpoint assigns users to a variant and emits a signal to Paid.ai
 * tracking which pricing they saw.
 */
app.get('/api/pricing', async (
  req: Request<unknown, unknown, unknown, LegacyPricingQuery>,
  res: Response
) => {
  try {
    // Get or generate user ID (in production, this would come from authentication)
    const userId = req.query.userId || (req.headers['x-user-id'] as string) || `user_${Date.now()}`;
    const experimentId = req.query.experimentId || 'pricing_test_001';
    
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid userId parameter' 
      });
    }
    
    // Assign user to a variant
    const variant = await elo.assignVariant(userId, experimentId);
    
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
  } catch (error: unknown) {
    console.error('Error in /api/pricing:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Simulate a conversion (subscription/purchase)
 * 
 * In a real application, this would be called after successful payment
 * or integrated with your payment processor.
 */
app.post('/api/convert', async (
  req: Request<unknown, unknown, LegacyConvertBody>,
  res: Response
) => {
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
    const variant = await elo.getExperimentVariant(userId, experimentId);
    
    if (!variant) {
      return res.status(404).json({ 
        error: 'No variant assignment found for this user and experiment' 
      });
    }
    
    // Simulate revenue (in production, this would come from actual payment)
    const revenue = variant === 'control' ? 29.99 : 39.99;
    
    // Track conversion in A/B testing system
    await elo.trackConversion(userId, experimentId, { 
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
  } catch (error: unknown) {
    console.error('Error in /api/convert:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
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
app.post('/webhooks/paid', async (
  req: Request<unknown, unknown, WebhookEvent>,
  res: Response
) => {
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
        await elo.trackConversion(
          customerId,
          experimentId,
          {
            revenue: amount,
            timestamp: new Date(),
            eventType: event.type
          }
        );
        
        // Get variant for logging purposes only
        const variant = await elo.getExperimentVariant(customerId, experimentId);
        console.log(`Tracked conversion from webhook: user=${customerId}, variant=${variant}, revenue=${amount}`);
      } catch (conversionError) {
        const errorMsg = conversionError instanceof Error ? conversionError.message : 'Unknown error';
        console.warn(`Failed to track conversion: ${errorMsg}`);
      }
    }
    
    // Acknowledge webhook receipt
    res.status(200).send('OK');
  } catch (error: unknown) {
    // Log error but still acknowledge webhook to prevent retries
    console.error('Error processing webhook:', error);
    
    // In production, consider using a dead letter queue or retry mechanism
    // for failed webhook processing
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Get pricing recommendation from jale optimization service
 * 
 * Calls the jale service to recommend a price based on experiment data
 * and returns the result. Requires experimentId in request body.
 */
app.post('/api/jale/optimize', async (
  req: Request<unknown, unknown, JaleOptimizeBody>,
  res: Response
) => {
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
  } catch (error: unknown) {
    console.error('Error in /api/jale/optimize:', error);
    const errorMessage = error instanceof Error ? error.message : undefined;
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Propose a new variant for an experiment
 * POST /api/jale/propose-variant
 * 
 * Allows jale to propose a new variant to be added to an experiment.
 * This can be used after jale's optimization to create a new test variant.
 */
app.post('/api/jale/propose-variant', async (
  req: Request<unknown, unknown, ProposeVariantBody>,
  res: Response
) => {
  try {
    const { experimentId, tenantId, price, label, metadata } = req.body;
    
    // Validate required fields
    if (!experimentId || typeof experimentId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid or missing experimentId' 
      });
    }
    
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ 
        error: 'Invalid or missing price (must be a positive number)' 
      });
    }
    
    const experiment = await lookupExperiment(experimentId, tenantId);
    
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    // Generate variant label if not provided, ensuring uniqueness
    let variantLabel = label;
    if (!variantLabel) {
      // Find next available variant number that doesn't conflict with existing names
      const existingNames = new Set(experiment.variants.map(v => v.name));
      let counter = experiment.variants.length + 1;
      do {
        variantLabel = `variant_${counter}`;
        counter++;
      } while (existingNames.has(variantLabel));
    }
    
    // Create new variant object using shorthand property syntax
    const newVariant = {
      name: variantLabel,
      price,
      weight: 0.0, // New variants start with 0 weight until activated
      metadata: metadata || {}
    };
    
    // Add to experiment variants
    const updatedVariants = [...experiment.variants, newVariant];
    
    // Update experiment in database
    const updatedExperiment = await db.updateExperiment(experiment.id, {
      variants: updatedVariants
    });
    
    res.json({
      success: true,
      experimentId: experiment.key,
      variant: newVariant,
      message: `Variant '${variantLabel}' proposed successfully`,
      experiment: {
        id: updatedExperiment?.id,
        key: updatedExperiment?.key,
        variants: updatedExperiment?.variants
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '';
    // Handle tenant not found error
    if (errorMessage === 'Tenant not found') {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    console.error('Error in /api/jale/propose-variant:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? errorMessage : undefined
    });
  }
});

/**
 * Get all experiment assignments (for debugging/testing)
 */
app.get('/api/debug/assignments', async (_req: Request, res: Response) => {
  if (config.nodeEnv !== 'development') {
    return res.status(403).json({ 
      error: 'This endpoint is only available in development mode' 
    });
  }
  
  const assignments = await elo.getAllAssignments();
  res.json({ 
    count: assignments.length,
    assignments 
  });
});

/**
 * 404 handler
 * Must be placed before error handling middleware
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not found',
    path: _req.path 
  });
});

/**
 * Error handling middleware
 * Must be placed last to catch all errors
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server only when run directly (not when imported for testing)
let server: ReturnType<typeof app.listen> | undefined;

// Check if this module is being run directly
const isMainModule = require.main === module;

if (isMainModule) {
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
    console.log('    GET  /api/experiments/:id/definition - Get experiment definition and variants');
    console.log('    POST /api/experiments/:id/convert - Record conversion (tenant-aware)');
    console.log('    GET  /api/experiments/:id/results - Get experiment results');
    console.log('  Legacy (backward compatibility):');
    console.log('    GET  /api/pricing - Get pricing with A/B test variant');
    console.log('    POST /api/convert - Simulate a conversion');
    console.log('  Optimization:');
    console.log('    POST /api/jale/optimize - Get pricing recommendation from jale');
    console.log('    POST /api/jale/propose-variant - Propose a new variant for an experiment');
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
    server?.close(() => {
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
    server?.close(() => {
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

export default app;
export { server };
