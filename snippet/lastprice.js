/**
 * Last Price Embed Snippet
 * 
 * A lightweight JavaScript snippet for embedding A/B tested pricing into any website.
 * This snippet handles user identification, variant assignment, and conversion tracking.
 * 
 * Installation:
 * 1. Copy this file to your website or CDN
 * 2. Add the script tag to your HTML:
 *    <script src="https://cdn.yoursite.com/lastprice.js"></script>
 *    OR inline the code in a <script> tag
 * 3. Configure with your tenant and experiment IDs
 * 4. Call LastPrice.showPricing() when ready to display pricing
 * 
 * Usage:
 *   <div id="pricing-container"></div>
 *   <script>
 *     LastPrice.config({
 *       apiBase: 'https://api.lastprice.example.com',
 *       tenantId: 'your-tenant-id',
 *       experimentId: 'pricing_test_001'
 *     });
 *     LastPrice.showPricing('#pricing-container');
 *   </script>
 */

(function(window, document) {
  'use strict';

  // Create the LastPrice namespace
  const LP = {};

  // Default configuration
  LP.config = {
    apiBase: 'http://localhost:3000', // Base URL for the Last Price API
    tenantId: null,                   // Tenant ID (required)
    experimentId: null,               // Experiment ID (required)
    cookieName: 'lp_user_id',        // Cookie name for user ID
    cookieMaxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    debug: false                      // Enable debug logging
  };

  /**
   * Configure the LastPrice client
   * @param {Object} options - Configuration options
   */
  LP.configure = function(options) {
    Object.assign(LP.config, options);
    if (LP.config.debug) {
      console.log('[LastPrice] Configured:', LP.config);
    }
  };

  /**
   * Get or create a unique user ID
   * Stores the ID in a cookie for consistent variant assignment
   * @returns {string} User ID
   */
  function getOrCreateUserId() {
    const cookieName = LP.config.cookieName;
    
    // Try to find existing cookie
    const cookies = document.cookie.split('; ');
    const existingCookie = cookies.find(c => c.startsWith(cookieName + '='));
    
    if (existingCookie) {
      const userId = existingCookie.split('=')[1];
      if (LP.config.debug) {
        console.log('[LastPrice] Found existing user ID:', userId);
      }
      return userId;
    }
    
    // Generate new user ID
    // Use crypto.randomUUID() if available (modern browsers), otherwise fallback
    let userId;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      userId = 'user_' + crypto.randomUUID();
    } else if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Fallback using getRandomValues for older browsers
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      userId = 'user_' + Date.now() + '_' + Array.from(array).map(n => n.toString(16)).join('');
    } else {
      // Fallback for very old browsers: increase random range to reduce collisions
      const rand1 = Math.floor(Math.random() * 1e9);
      const rand2 = Math.floor(Math.random() * 1e9);
      userId = 'user_' + Date.now() + '_' + rand1 + '_' + rand2;
    }
    
    // Store in cookie
    const maxAge = LP.config.cookieMaxAge;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = cookieName + '=' + userId + '; path=/; max-age=' + maxAge + '; SameSite=Lax' + secure;
    
    if (LP.config.debug) {
      console.log('[LastPrice] Created new user ID:', userId);
    }
    
    return userId;
  }

  /**
   * Fetch pricing from the API
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Pricing data with variant assignment
   */
  async function fetchPricing(userId) {
    const { apiBase, tenantId, experimentId } = LP.config;
    
    if (!tenantId || !experimentId) {
      throw new Error('[LastPrice] tenantId and experimentId must be configured');
    }
    
    const url = `${apiBase}/api/experiments/${encodeURIComponent(experimentId)}/pricing?userId=${encodeURIComponent(userId)}&tenantId=${encodeURIComponent(tenantId)}`;
    
    if (LP.config.debug) {
      console.log('[LastPrice] Fetching pricing from:', url);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`[LastPrice] API error (${response.status}): ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * Record a conversion event
   * @param {string} userId - User identifier
   * @param {string} experimentId - Experiment identifier
   * @param {string} tenantId - Tenant identifier
   * @param {number} revenue - Optional revenue amount
   * @returns {Promise<Object>} Conversion response
   */
  async function recordConversion(userId, experimentId, tenantId, revenue = null) {
    const { apiBase } = LP.config;
    const url = `${apiBase}/api/experiments/${encodeURIComponent(experimentId)}/convert`;
    
    if (LP.config.debug) {
      console.log('[LastPrice] Recording conversion:', { userId, experimentId, tenantId, revenue });
    }
    
    const body = {
      userId,
      experimentId,
      tenantId
    };
    
    if (revenue !== null) {
      body.revenue = revenue;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`[LastPrice] Conversion API error (${response.status}): ${errorText}`);
    }
    
    return response.json();
  }

  /**
   * Default pricing card renderer
   * @param {Object} pricing - Pricing data
   * @param {Function} onConvert - Conversion callback
   * @returns {string} HTML string
   */
  function renderDefaultPricingCard(pricing, onConvert) {
    return `
      <div class="lp-pricing-card" style="
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
          ${pricing.plan || 'Plan'}
        </h3>
        <div style="margin: 16px 0;">
          <span style="font-size: 48px; font-weight: 700;">
            $${pricing.price}
          </span>
          <span style="font-size: 16px; color: #666;">
            /month
          </span>
        </div>
        ${pricing.features && pricing.features.length > 0 ? `
          <ul style="list-style: none; padding: 0; margin: 16px 0;">
            ${pricing.features.map(feature => `
              <li style="padding: 8px 0; color: #333;">
                ✓ ${feature}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        <button 
          id="lp-convert-btn" 
          style="
            width: 100%;
            background: #0070f3;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#0051cc'"
          onmouseout="this.style.background='#0070f3'"
        >
          Get Started
        </button>
      </div>
    `;
  }

  /**
   * Display pricing in the specified container
   * @param {string|HTMLElement} containerSelector - CSS selector or DOM element
   * @param {Object} options - Display options
   * @param {Function} options.onConvert - Custom conversion handler
   * @param {Function} options.customRenderer - Custom rendering function
   */
  LP.showPricing = async function(containerSelector, options = {}) {
    try {
      // Find container
      const container = typeof containerSelector === 'string' 
        ? document.querySelector(containerSelector)
        : containerSelector;
      
      if (!container) {
        throw new Error('[LastPrice] Container not found: ' + containerSelector);
      }
      
      // Get user ID
      const userId = getOrCreateUserId();
      
      // Fetch pricing
      const data = await fetchPricing(userId);
      
      if (LP.config.debug) {
        console.log('[LastPrice] Received pricing:', data);
      }
      
      // Store variant info for conversion tracking
      LP._currentVariant = {
        userId: data.userId,
        experimentId: data.experimentId,
        variant: data.variant
      };
      
      // Render pricing card
      const renderer = options.customRenderer || renderDefaultPricingCard;
      const html = renderer(data.pricing, LP.convert);
      container.innerHTML = html;
      
      // Attach conversion handler to button
      const convertBtn = container.querySelector('#lp-convert-btn');
      if (convertBtn) {
        convertBtn.addEventListener('click', async function() {
          if (options.onConvert) {
            // Custom conversion handler
            await options.onConvert(data.pricing);
          } else {
            // Default: just record conversion
            await LP.convert();
          }
        });
      }
    } catch (error) {
      console.error('[LastPrice] Error showing pricing:', error);
      throw error;
    }
  };

  /**
   * Record a conversion (subscription/purchase)
   * @param {Object} options - Conversion options
   * @param {number} options.revenue - Optional revenue amount
   * @param {Function} options.onSuccess - Success callback
   * @param {Function} options.onError - Error callback
   */
  LP.convert = async function(options = {}) {
    try {
      if (!LP._currentVariant) {
        throw new Error('[LastPrice] No active variant. Call showPricing() first.');
      }
      
      const { userId, experimentId } = LP._currentVariant;
      const { tenantId } = LP.config;
      const revenue = options.revenue || null;
      
      const response = await recordConversion(userId, experimentId, tenantId, revenue);
      
      if (LP.config.debug) {
        console.log('[LastPrice] Conversion recorded:', response);
      }
      
      if (options.onSuccess) {
        options.onSuccess(response);
      }
      
      return response;
    } catch (error) {
      console.error('[LastPrice] Error recording conversion:', error);
      
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  };

  /**
   * Get the current user ID
   * @returns {string} User ID
   */
  LP.getUserId = function() {
    return getOrCreateUserId();
  };

  /**
   * Get the current variant assignment (if any)
   * @returns {Object|null} Variant info
   */
  LP.getVariant = function() {
    return LP._currentVariant || null;
  };

  // Expose LastPrice globally
  window.LastPrice = LP;

  // Auto-initialize if data attributes are present
  if (document.currentScript) {
    const script = document.currentScript;
    const apiBase = script.getAttribute('data-api-base');
    const tenantId = script.getAttribute('data-tenant-id');
    const experimentId = script.getAttribute('data-experiment-id');
    const autoLoad = script.getAttribute('data-auto-load');
    
    if (apiBase || tenantId || experimentId) {
      LP.configure({ apiBase, tenantId, experimentId });
    }
    
    if (autoLoad !== null) {
      // Auto-load pricing when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          const container = script.getAttribute('data-container') || '#pricing-container';
          LP.showPricing(container).catch(console.error);
        });
      } else {
        const container = script.getAttribute('data-container') || '#pricing-container';
        LP.showPricing(container).catch(console.error);
      }
    }
  }

  if (LP.config.debug) {
    console.log('[LastPrice] Initialized');
  }

})(window, document);
