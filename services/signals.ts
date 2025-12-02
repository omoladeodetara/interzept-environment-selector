/**
 * Paid.ai Signals Service
 * 
 * Handles communication with Paid.ai's Signals API to emit events
 * for tracking user behavior and A/B test outcomes.
 */

import axios from 'axios';
import config from '@utils/config';

/**
 * Emit an A/B test signal to Paid.ai
 * 
 * @param orderId - The order/user identifier
 * @param variant - The variant name ('control' or 'experiment')
 * @param conversionEvent - Whether this is a conversion event
 * @param experimentId - The experiment identifier
 * @param apiKey - Optional tenant-specific API key (BYOK mode)
 * @returns The API response
 */
export async function emitABTestSignal(
  orderId: string,
  variant: string,
  conversionEvent: boolean,
  experimentId: string,
  apiKey?: string
): Promise<any> {
  // Input validation (in parameter order for better maintainability)
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('Invalid orderId: must be a non-empty string');
  }
  
  if (!['control', 'experiment'].includes(variant)) {
    throw new Error('Invalid variant: must be "control" or "experiment"');
  }
  
  if (typeof conversionEvent !== 'boolean') {
    throw new Error('Invalid conversionEvent: must be a boolean');
  }
  
  if (typeof experimentId !== 'string' || experimentId.trim() === '') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  try {
    const url = `${config.paidApiBaseUrl}/signals`;
    const payload = {
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
    
    // Use tenant API key if provided (BYOK mode), otherwise use platform key
    const authKey = apiKey || config.paidApiKey;
    
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (config.nodeEnv === 'development') {
      console.log('Signal emitted successfully:', response.data);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error emitting A/B test signal:', error.message);
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
 * @param apiKey - Optional tenant-specific API key (BYOK mode)
 * @returns The API response
 */
export async function emitPricingViewSignal(
  orderId: string,
  variant: string,
  experimentId: string,
  apiKey?: string
): Promise<any> {
  return await emitABTestSignal(orderId, variant, false, experimentId, apiKey);
}

/**
 * Emit a conversion signal
 * Tracks when a user completes a conversion (subscription/purchase)
 * 
 * @param orderId - The order/user identifier
 * @param variant - The variant name ('control' or 'experiment')
 * @param experimentId - The experiment identifier
 * @param apiKey - Optional tenant-specific API key (BYOK mode)
 * @returns The API response
 */
export async function emitConversionSignal(
  orderId: string,
  variant: string,
  experimentId: string,
  apiKey?: string
): Promise<any> {
  return await emitABTestSignal(orderId, variant, true, experimentId, apiKey);
}
