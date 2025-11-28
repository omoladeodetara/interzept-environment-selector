/**
 * Pricing Optimizer API Server
 * 
 * Main Express server providing API endpoints for the hybrid
 * multi-tenant pricing optimizer with BYOK and Managed mode support.
 */

import express from 'express';
import { config } from 'dotenv';

// Load environment variables
config();

import { authenticate, generateToken } from './middleware/auth';
import { rateLimit, checkUsageLimit, trackApiUsage } from './middleware/rate-limit';
import experimentsRouter from './routes/experiments';
import recommendationsRouter from './routes/recommendations';
import analyticsRouter from './routes/analytics';
import settingsRouter from './routes/settings';
import { createTenant, getTenant, listTenants } from '../multi-tenant/tenant-manager';
import { ValidationError, NotFoundError } from '../core/types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: process.env.PLATFORM_MODE || 'hybrid',
  });
});

// Public routes for tenant registration and token generation
app.post('/api/tenants', async (req, res) => {
  try {
    const { name, plan, mode, provider } = req.body;

    if (!name) {
      throw new ValidationError('Tenant name is required');
    }

    const tenant = createTenant(name, { plan, mode, defaultProvider: provider });
    const token = generateToken(tenant.id);

    res.status(201).json({
      tenant,
      token,
      message: 'Tenant created successfully. Use the token for API authentication.',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token generation for existing tenants (in production, add proper authentication)
app.post('/api/auth/token', async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      throw new ValidationError('tenantId is required');
    }

    // Verify tenant exists
    getTenant(tenantId);

    const token = generateToken(tenantId);
    res.json({ token });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to list tenants (in production, add proper admin authentication)
app.get('/api/admin/tenants', async (req, res) => {
  try {
    const { plan, mode, limit, offset } = req.query;

    const result = listTenants({
      plan: plan as 'free' | 'starter' | 'pro' | 'enterprise' | undefined,
      mode: mode as 'managed' | 'byok' | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected API routes
app.use('/api/experiments', authenticate, rateLimit, checkUsageLimit, trackApiUsage, experimentsRouter);
app.use('/api/recommendations', authenticate, rateLimit, checkUsageLimit, trackApiUsage, recommendationsRouter);
app.use('/api/analytics', authenticate, rateLimit, trackApiUsage, analyticsRouter);
app.use('/api/settings', authenticate, rateLimit, settingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Sanitize error for logging - avoid exposing sensitive data
  const sanitizedError = {
    name: err.name,
    message: err.message,
    // Only include stack in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  // Log sanitized error (avoid logging request body which may contain API keys)
  console.error('Unhandled error:', sanitizedError);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server only when run directly
let server: ReturnType<typeof app.listen>;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Pricing Optimizer API Server Started');
    console.log('='.repeat(60));
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Platform mode: ${process.env.PLATFORM_MODE || 'hybrid'}`);
    console.log('='.repeat(60));
    console.log('\nPublic endpoints:');
    console.log('  POST /api/tenants - Create a new tenant');
    console.log('  POST /api/auth/token - Generate auth token');
    console.log('\nProtected endpoints (require Bearer token):');
    console.log('  /api/experiments/* - Experiment management');
    console.log('  /api/recommendations/* - Pricing recommendations');
    console.log('  /api/analytics/* - Analytics and insights');
    console.log('  /api/settings/* - Configuration and billing');
    console.log('='.repeat(60));
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export default app;
