/**
 * Rate Limiting Middleware
 * 
 * Usage-based rate limiting per tenant tier.
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimitError, PlanType } from '../../core/types';
import { getTenant, isUsageLimitExceeded } from '../../multi-tenant/tenant-manager';
import { trackTenantUsage, isApproachingLimit } from '../../multi-tenant/usage-tracker';

// Rate limits per minute by plan
const RATE_LIMITS: Record<PlanType, number> = {
  free: 60,
  starter: 300,
  pro: 1000,
  enterprise: 5000,
};

// In-memory rate limit tracking
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

// IPv4 and IPv6 format validation
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_REGEX = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

/**
 * Validate IP address format (basic check for IPv4/IPv6)
 */
function isValidIpFormat(ip: string): boolean {
  // Handle IPv6-mapped IPv4 addresses (::ffff:192.168.1.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
}

/**
 * Rate limiting middleware based on tenant plan
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      // No tenant context, apply default limit
      applyDefaultRateLimit(req, res, next);
      return;
    }

    const tenant = getTenant(tenantId);
    const limit = RATE_LIMITS[tenant.plan];
    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    const key = `rate:${tenantId}`;
    let record = rateLimitStore.get(key);

    if (!record || now >= record.resetTime) {
      // New window
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }

    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.status(429).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * Apply default rate limit for unauthenticated requests
 */
function applyDefaultRateLimit(req: Request, res: Response, next: NextFunction): void {
  const limit = 30; // 30 requests per minute for unauthenticated
  const now = Date.now();
  const windowMs = 60000;

  // Use req.ip which respects Express's 'trust proxy' setting
  // Note: Ensure app.set('trust proxy', 1) or similar is configured
  // when running behind a reverse proxy (nginx, load balancer, etc.)
  let ip = req.ip || req.socket.remoteAddress;
  
  // Fallback for edge cases, but log a warning
  if (!ip) {
    console.warn(
      '[RATE LIMIT] Could not determine client IP. ' +
      'Ensure Express trust proxy is configured correctly.'
    );
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      ip = forwardedFor.split(',')[0].trim();
    }
  }
  
  // Validate IP format (basic check for IPv4/IPv6)
  if (ip && !isValidIpFormat(ip)) {
    console.warn(`[RATE LIMIT] Invalid IP format detected: ${ip}`);
    ip = undefined;
  }
  
  // If still no valid IP, reject the request
  if (!ip) {
    res.status(400).json({
      error: 'Unable to identify request source for rate limiting',
    });
    return;
  }
  
  const key = `rate:ip:${ip}`;
  let record = rateLimitStore.get(key);

  if (!record || now >= record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
  } else {
    record.count++;
  }

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

  if (record.count > limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    });
    return;
  }

  next();
}

/**
 * Usage limit middleware
 * Checks if tenant has exceeded their plan's usage limit
 */
export function checkUsageLimit(req: Request, res: Response, next: NextFunction): void {
  try {
    const tenantId = req.tenantId;

    if (!tenantId) {
      next();
      return;
    }

    const tenant = getTenant(tenantId);

    // Free tier cannot exceed limit
    if (tenant.plan === 'free' && isUsageLimitExceeded(tenantId)) {
      res.status(403).json({
        error: 'Usage limit exceeded',
        message: 'You have exceeded your free tier usage limit. Please upgrade your plan.',
        currentUsage: tenant.currentUsage,
        limit: tenant.usageLimit,
      });
      return;
    }

    // Check if approaching limit and add warning header
    const { approaching, percentUsed } = isApproachingLimit(tenantId);
    if (approaching) {
      res.setHeader('X-Usage-Warning', `${percentUsed.toFixed(1)}% of limit used`);
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Track API call usage
 */
export async function trackApiUsage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tenantId = req.tenantId;

    if (tenantId) {
      // Track asynchronously to not block the request
      trackTenantUsage(tenantId, 'api_call', {
        path: req.path,
        method: req.method,
      }).catch(console.error);
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Clear rate limit store (for testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Get current rate limit status for a tenant
 */
export function getRateLimitStatus(tenantId: string): {
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const tenant = getTenant(tenantId);
  const limit = RATE_LIMITS[tenant.plan];
  const key = `rate:${tenantId}`;
  const record = rateLimitStore.get(key);

  if (!record || Date.now() >= record.resetTime) {
    return {
      limit,
      remaining: limit,
      resetTime: Date.now() + 60000,
    };
  }

  return {
    limit,
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime,
  };
}
