/**
 * Authentication Middleware
 * 
 * JWT-based authentication for tenant API access.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../core/types';
import { getTenant } from '../../multi-tenant/tenant-manager';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'pricing-optimizer-dev-secret';
const JWT_EXPIRES_IN = '24h';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantConfig?: ReturnType<typeof getTenant>;
    }
  }
}

/**
 * Generate a JWT token for a tenant
 */
export function generateToken(tenantId: string): string {
  return jwt.sign({ tenantId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { tenantId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { tenantId: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Authentication middleware
 * Extracts tenant ID from JWT token in Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authorization header required');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedError('Invalid authorization format. Use: Bearer <token>');
    }

    const token = parts[1];
    const { tenantId } = verifyToken(token);

    // Verify tenant exists
    const tenantConfig = getTenant(tenantId);

    // Attach to request
    req.tenantId = tenantId;
    req.tenantConfig = tenantConfig;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Allows unauthenticated requests but attaches tenant info if token present
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      next();
      return;
    }

    const token = parts[1];
    const { tenantId } = verifyToken(token);
    const tenantConfig = getTenant(tenantId);

    req.tenantId = tenantId;
    req.tenantConfig = tenantConfig;

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
}

/**
 * API Key authentication middleware
 * Alternative to JWT for simpler integrations
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('X-API-Key header required');
    }

    // In production, look up API key in database
    // For now, assume format: tenant_<tenantId>_<random>
    const match = apiKey.match(/^tenant_([^_]+)_/);
    if (!match) {
      throw new UnauthorizedError('Invalid API key format');
    }

    const tenantId = match[1];
    const tenantConfig = getTenant(tenantId);

    req.tenantId = tenantId;
    req.tenantConfig = tenantConfig;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Generate an API key for a tenant
 */
export function generateApiKey(tenantId: string): string {
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `tenant_${tenantId}_${randomPart}`;
}
