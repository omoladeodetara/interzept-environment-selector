/**
 * Key Manager Module
 * 
 * Handles API key storage, retrieval, and validation for both BYOK and Managed modes.
 * In production, keys should be encrypted at rest using a proper encryption key.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ValidationError } from '../core/types';
import { getTenant, updateTenant } from './tenant-manager';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';

/**
 * Get encryption key from environment
 * In production and staging, this MUST be set via API_KEY_ENCRYPTION_KEY env variable
 */
function getEncryptionKey(): string {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  const env = process.env.NODE_ENV || 'development';
  
  // Enforce encryption key in production and staging
  if (!key && (env === 'production' || env === 'staging')) {
    throw new Error(
      'API_KEY_ENCRYPTION_KEY must be set in production and staging environments. ' +
      'Generate a 32-character random string for this value.'
    );
  }
  
  // Warn if using default key in any environment
  if (!key) {
    console.warn(
      '[SECURITY WARNING] Using default encryption key. ' +
      'This is only acceptable for local development. ' +
      'Set API_KEY_ENCRYPTION_KEY environment variable for any shared environment.'
    );
  }
  
  // Use default only for local development/testing
  return key || 'default-dev-key-32-bytes-long!!';
}

/**
 * Encrypt a string value
 */
function encrypt(text: string): string {
  const iv = randomBytes(16);
  const encryptionKey = getEncryptionKey();
  const key = Buffer.from(encryptionKey.padEnd(32).slice(0, 32));
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return IV + AuthTag + Encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a string value
 */
function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const encryptionKey = getEncryptionKey();
  const key = Buffer.from(encryptionKey.padEnd(32).slice(0, 32));

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Store an encrypted API key for a tenant (BYOK mode)
 */
export function storeApiKey(
  tenantId: string,
  apiKey: string,
  baseUrl?: string
): void {
  if (!apiKey || apiKey.trim() === '') {
    throw new ValidationError('API key is required');
  }

  const encryptedKey = encrypt(apiKey.trim());
  
  updateTenant(tenantId, {
    paidApiKey: encryptedKey,
    paidApiBaseUrl: baseUrl,
    mode: 'byok',
  });
}

/**
 * Retrieve and decrypt API key for a tenant
 */
export function getApiKey(tenantId: string): { apiKey: string; baseUrl: string } | null {
  const tenant = getTenant(tenantId);

  if (!tenant.paidApiKey) {
    return null;
  }

  try {
    const decryptedKey = decrypt(tenant.paidApiKey);
    return {
      apiKey: decryptedKey,
      baseUrl: tenant.paidApiBaseUrl || 'https://api.paid.ai/v1',
    };
  } catch (error) {
    // Check if this looks like legacy unencrypted data (no colons = not encrypted format)
    const isLegacyFormat = !tenant.paidApiKey.includes(':');
    const env = process.env.NODE_ENV || 'development';
    
    if (isLegacyFormat) {
      // Legacy unencrypted key - log warning and return as-is
      console.warn(
        `[SECURITY] Tenant ${tenantId} has unencrypted API key (legacy format). ` +
        'Consider migrating to encrypted storage.'
      );
      
      // In production, reject unencrypted keys
      if (env === 'production') {
        throw new Error(
          'Unencrypted API keys are not allowed in production. ' +
          'Please re-store the API key to encrypt it.'
        );
      }
      
      return {
        apiKey: tenant.paidApiKey,
        baseUrl: tenant.paidApiBaseUrl || 'https://api.paid.ai/v1',
      };
    }
    
    // Actual decryption failure - could indicate tampering or key rotation issue
    console.error(
      `[SECURITY] Decryption failed for tenant ${tenantId}. ` +
      'This may indicate data corruption, tampering, or encryption key rotation. ' +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error('Failed to decrypt API key. Please contact support.');
  }
}

/**
 * Remove stored API key (switch from BYOK to Managed)
 */
export function removeApiKey(tenantId: string): void {
  updateTenant(tenantId, {
    paidApiKey: undefined,
    paidApiBaseUrl: undefined,
    mode: 'managed',
  });
}

/**
 * Rotate API key (store new key, invalidate old)
 */
export function rotateApiKey(
  tenantId: string,
  newApiKey: string,
  newBaseUrl?: string
): void {
  if (!newApiKey || newApiKey.trim() === '') {
    throw new ValidationError('New API key is required');
  }

  const tenant = getTenant(tenantId);
  
  if (tenant.mode !== 'byok') {
    throw new ValidationError('API key rotation is only available in BYOK mode');
  }

  storeApiKey(tenantId, newApiKey, newBaseUrl || tenant.paidApiBaseUrl);
}

/**
 * Check if tenant has a valid stored API key
 */
export function hasValidApiKey(tenantId: string): boolean {
  try {
    const keyData = getApiKey(tenantId);
    return keyData !== null && keyData.apiKey.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the effective API configuration for a tenant
 * Returns BYOK config if available, otherwise platform config
 */
export function getEffectiveApiConfig(tenantId: string): {
  apiKey: string;
  baseUrl: string;
  mode: 'byok' | 'managed';
} {
  const tenant = getTenant(tenantId);

  if (tenant.mode === 'byok' && tenant.paidApiKey) {
    const keyData = getApiKey(tenantId);
    if (keyData) {
      return {
        ...keyData,
        mode: 'byok',
      };
    }
  }

  // Fall back to platform API key
  const platformKey = process.env.PAID_API_KEY;
  if (!platformKey) {
    throw new ValidationError(
      'No API key available. Configure BYOK or ensure platform API key is set.'
    );
  }

  return {
    apiKey: platformKey,
    baseUrl: process.env.PAID_API_BASE_URL || 'https://api.paid.ai/v1',
    mode: 'managed',
  };
}

/**
 * Mask an API key for display (show only first/last 4 chars)
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return '****';
  }
  
  const first = apiKey.substring(0, 4);
  const last = apiKey.substring(apiKey.length - 4);
  const masked = '*'.repeat(Math.min(apiKey.length - 8, 16));
  
  return `${first}${masked}${last}`;
}
