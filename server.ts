/**
 * Last Price - Modular Monolith Server
 * 
 * Main server entry point that orchestrates all modules and API delegates
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import config from './utils/config';
import * as db from './services/database';

// Import API delegates
import tenantsDelegate from './api-delegates/tenants';
import experimentsDelegate from './api-delegates/experiments';
import pricingDelegate from './api-delegates/pricing';
import webhooksDelegate from './api-delegates/webhooks';
import healthDelegate from './api-delegates/health';

const app: Express = express();

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
const corsOptions = {
  origin: config.nodeEnv === 'development' 
    ? 'http://localhost:3002'
    : (req: any, callback: any) => {
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
          ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
          : [];
        
        // If no origins configured in production, allow no CORS
        if (allowedOrigins.length === 0) {
          callback(null, false);
        } else if (allowedOrigins.includes(req.header('Origin'))) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
  credentials: config.nodeEnv === 'production',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Swagger UI for API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'Last Price - API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Mount API delegates
app.use('/health', healthDelegate);
app.use('/api/tenants', tenantsDelegate);
app.use('/api/experiments', experimentsDelegate);
app.use('/api', pricingDelegate);
app.use('/webhooks', webhooksDelegate);
app.get('/api/debug/assignments', healthDelegate); // Debug endpoint

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
let server: any;
if (require.main === module) {
  server = app.listen(config.port, () => {
    console.log('='.repeat(50));
    console.log('🚀 Last Price Server Started (Modular Monolith)');
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

export default app;
