/**
 * Key Manager Module
 *
 * Handles API key storage, retrieval, and validation for both BYOK and Managed modes.
 * Keys are encrypted at rest using AES-256-GCM.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ValidationError } from './types';
import { getTenant, updateTenant } from './tenant-manager';

const ALGORITHM = 'aes-256-gcm';

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  const env = process.env.NODE_ENV || 'development';

  if (!key && (env === 'production' || env === 'staging')) {
    throw new Error(
      'API_KEY_ENCRYPTION_KEY must be set in production and staging environments. ' +
        'Generate a 32-character random string for this value.'
    );
  }

  if (!key) {
    console.warn(
      '[SECURITY WARNING] Using default encryption key. ' +
        'This is only acceptable for local development. ' +
        'Set API_KEY_ENCRYPTION_KEY environment variable for any shared environment.'
    );
  }

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
export function storeApiKey(tenantId: string, apiKey: string, baseUrl?: string): void {
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
    const isLegacyFormat = !tenant.paidApiKey.includes(':');
    const env = process.env.NODE_ENV || 'development';

    if (isLegacyFormat) {
      console.warn(
        `[SECURITY] Tenant ${tenantId} has unencrypted API key (legacy format). ` +
          'Consider migrating to encrypted storage.'
      );

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

    console.error(`[SECURITY] Failed to decrypt API key for tenant ${tenantId}:`, error);
    throw new Error('Failed to decrypt API key. Key may have been tampered with or corrupted.');
  }
}

/**
 * Remove API key for a tenant (switch back to managed mode)
 */
export function removeApiKey(tenantId: string): void {
  updateTenant(tenantId, {
    paidApiKey: undefined,
    paidApiBaseUrl: undefined,
    mode: 'managed',
  });
}

/**
 * Check if tenant has a stored API key
 */
export function hasApiKey(tenantId: string): boolean {
  const tenant = getTenant(tenantId);
  return !!tenant.paidApiKey;
}

/**
 * Validate an API key format (basic validation)
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Basic format check - adjust based on actual API key format
  const trimmed = apiKey.trim();
  return trimmed.length >= 20 && trimmed.length <= 100;
}

/**
 * Rotate API key for a tenant
 */
export function rotateApiKey(tenantId: string, newApiKey: string, baseUrl?: string): void {
  if (!validateApiKeyFormat(newApiKey)) {
    throw new ValidationError('Invalid API key format');
  }

  storeApiKey(tenantId, newApiKey, baseUrl);
}
