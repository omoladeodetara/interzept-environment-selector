/**
 * Vercel Serverless Function Entry Point
 * 
 * Re-exports the existing Express app for Vercel's serverless environment.
 * All API routes are defined in server.ts following the OpenAPI spec.
 */

import app from '../server';

export default app;
