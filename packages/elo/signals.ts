/**
 * Paid.ai Signals API Integration Module
 * 
 * Handles communication with Paid.ai's Signals API to emit events
 * for tracking user behavior and A/B test outcomes.
 */

import axios from 'axios';
import config from './config';

// Variant can be 'control', 'experiment', or any custom variant name
export type Variant = string;

export interface SignalPayload {
  order_id: string;
  event_type: string;
  properties: {
    variant: Variant;
    experiment_id: string;
    conversion: boolean;
    timestamp: string;
  };
}

export interface SignalResponse {
  success: boolean;
  [key: string]: unknown;
}

/**
 * Emit an A/B test signal to Paid.ai
 * 
 * @param orderId - The order/user identifier
 * @param variant - The variant name (e.g., 'control', 'experiment', or custom)
 * @param conversionEvent - Whether this is a conversion event
 * @param experimentId - The experiment identifier
 * @param apiKey - Optional API key override for BYOK mode
 * @returns The API response
 * @throws Error if validation fails or API request fails
 */
export async function emitABTestSignal(
  orderId: string,
  variant: Variant,
  conversionEvent: boolean,
  experimentId: string,
  apiKey: string | null = null
): Promise<SignalResponse> {
  // Input validation
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('Invalid orderId: must be a non-empty string');
  }
  
  if (typeof variant !== 'string' || variant.trim() === '') {
    throw new Error('Invalid variant: must be a non-empty string');
  }
  
  if (typeof conversionEvent !== 'boolean') {
    throw new Error('Invalid conversionEvent: must be a boolean');
  }
  
  if (typeof experimentId !== 'string' || experimentId.trim() === '') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  // Use provided API key or fall back to default config
  const effectiveApiKey = apiKey || config.paidApiKey;
  
  try {
    const url = `${config.paidApiBaseUrl}/signals`;
    const payload: SignalPayload = {
      order_id: orderId,
      event_type: 'ab_test',
      properties: {
        variant,
        experiment_id: experimentId,
        conversion: conversionEvent,
        timestamp: new Date().toISOString()
      }
    };
    
    if (config.nodeEnv === 'development') {
      console.log(`Emitting signal to ${url}:`, JSON.stringify(payload, null, 2));
    }
    
    const response = await axios.post<SignalResponse>(url, payload, {
      headers: {
        'Authorization': `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (config.nodeEnv === 'development') {
      console.log('Signal emitted successfully:', response.data);
    }
    
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error emitting A/B test signal:', message);
    throw error;
  }
}

/**
 * Emit a pricing page view signal
 * Tracks when a user views the pricing page
 * 
 * @param orderId - The order/user identifier
 * @param variant - The variant name ('control' or 'experiment')
 * @param experimentId - The experiment identifier
 * @param apiKey - Optional API key override for BYOK mode
 * @returns The API response
 */
export async function emitPricingViewSignal(
  orderId: string,
  variant: Variant,
  experimentId: string,
  apiKey: string | null = null
): Promise<SignalResponse> {
  return emitABTestSignal(orderId, variant, false, experimentId, apiKey);
}

/**
 * Emit a conversion signal
 * Tracks when a user completes a conversion (subscription/purchase)
 * 
 * @param orderId - The order/user identifier
 * @param variant - The variant name ('control' or 'experiment')
 * @param experimentId - The experiment identifier
 * @param apiKey - Optional API key override for BYOK mode
 * @returns The API response
 */
export async function emitConversionSignal(
  orderId: string,
  variant: Variant,
  experimentId: string,
  apiKey: string | null = null
): Promise<SignalResponse> {
  return emitABTestSignal(orderId, variant, true, experimentId, apiKey);
}
