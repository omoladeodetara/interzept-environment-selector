/**
 * Paid.ai Signals API Integration Module
 * 
 * Handles communication with Paid.ai's Signals API to emit events
 * for tracking user behavior and A/B test outcomes.
 */

const axios = require('axios');
const config = require('./config');

/**
 * Emit an A/B test signal to Paid.ai
 * 
 * @param {string} orderId - The order/user identifier
 * @param {string} variant - The variant name ('control' or 'experiment')
 * @param {boolean} conversionEvent - Whether this is a conversion event
 * @param {string} experimentId - The experiment identifier
 * @returns {Promise<Object>} The API response
 * @throws {Error} If validation fails or API request fails
 */
async function emitABTestSignal(orderId, variant, conversionEvent, experimentId) {
  // Input validation
  if (typeof experimentId !== 'string' || experimentId.trim() === '') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    throw new Error('Invalid orderId: must be a non-empty string');
  }
  
  if (!['control', 'experiment'].includes(variant)) {
    throw new Error('Invalid variant: must be "control" or "experiment"');
  }
  
  if (typeof conversionEvent !== 'boolean') {
    throw new Error('Invalid conversionEvent: must be a boolean');
  }
  
  try {
    const url = `${config.paidApiBaseUrl}/signals`;
    const payload = {
      order_id: orderId,
      event_type: 'ab_test',
      properties: {
        variant: variant,
        experiment_id: experimentId,
        conversion: conversionEvent,
        timestamp: new Date().toISOString()
      }
    };
    
    if (config.nodeEnv === 'development') {
      console.log(`Emitting signal to ${url}:`, JSON.stringify(payload, null, 2));
    }
    
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${config.paidApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (config.nodeEnv === 'development') {
      console.log('Signal emitted successfully:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error emitting A/B test signal:', error.message);
    throw error;
  }
}

/**
 * Emit a pricing page view signal
 * Tracks when a user views the pricing page
 * 
 * @param {string} orderId - The order/user identifier
 * @param {string} variant - The variant name ('control' or 'experiment')
 * @param {string} experimentId - The experiment identifier
 * @returns {Promise<Object>} The API response
 */
async function emitPricingViewSignal(orderId, variant, experimentId) {
  return await emitABTestSignal(orderId, variant, false, experimentId);
}

/**
 * Emit a conversion signal
 * Tracks when a user completes a conversion (subscription/purchase)
 * 
 * @param {string} orderId - The order/user identifier
 * @param {string} variant - The variant name ('control' or 'experiment')
 * @param {string} experimentId - The experiment identifier
 * @returns {Promise<Object>} The API response
 */
async function emitConversionSignal(orderId, variant, experimentId) {
  return await emitABTestSignal(orderId, variant, true, experimentId);
}

module.exports = {
  emitABTestSignal,
  emitPricingViewSignal,
  emitConversionSignal
};
