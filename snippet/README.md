# Last Price Client Snippet

A lightweight JavaScript snippet for embedding A/B tested pricing into any website. No dependencies required.

## Features

- 🚀 **Zero Dependencies**: Pure vanilla JavaScript
- 🔄 **Automatic Variant Assignment**: Deterministic user-to-variant mapping
- 🍪 **User Persistence**: Cookie-based user identification
- 📊 **Conversion Tracking**: One-line conversion recording
- 🎨 **Customizable**: Bring your own UI or use the default renderer
- 📱 **Responsive**: Mobile-friendly default styles

## Installation

### Option 1: Script Tag (Recommended)

Add the script to your HTML:

```html
<div id="pricing-container"></div>

<script src="https://cdn.yoursite.com/lastprice.js"></script>
<script>
  LastPrice.configure({
    apiBase: 'https://api.lastprice.example.com',
    tenantId: 'your-tenant-id',
    experimentId: 'pricing_test_001'
  });
  
  LastPrice.showPricing('#pricing-container');
</script>
```

### Option 2: Data Attributes (Auto-load)

Use data attributes for automatic initialization:

```html
<div id="pricing-container"></div>

<script 
  src="https://cdn.yoursite.com/lastprice.js"
  data-api-base="https://api.lastprice.example.com"
  data-tenant-id="your-tenant-id"
  data-experiment-id="pricing_test_001"
  data-auto-load
  data-container="#pricing-container"
></script>
```

### Option 3: Inline (for maximum control)

Copy the contents of `lastprice.js` directly into a `<script>` tag in your HTML.

## Configuration

```javascript
LastPrice.configure({
  apiBase: 'https://api.lastprice.example.com', // API endpoint
  tenantId: 'your-tenant-id',                   // Your tenant ID
  experimentId: 'pricing_test_001',             // Experiment identifier
  cookieName: 'lp_user_id',                     // Cookie name (optional)
  cookieMaxAge: 365 * 24 * 60 * 60,            // Cookie expiry (optional, default 1 year)
  debug: false                                  // Enable console logging (optional)
});
```

### Getting Your Configuration Values

1. **apiBase**: The URL of your Last Price API server (e.g., `https://api.lastprice.example.com`)
2. **tenantId**: Find this in your Last Price dashboard or sign up at the API
3. **experimentId**: Create an experiment via the API or dashboard to get an experiment ID

## Usage

### Basic Usage

```html
<div id="pricing-container"></div>

<script src="https://cdn.yoursite.com/lastprice.js"></script>
<script>
  LastPrice.configure({
    apiBase: 'https://api.lastprice.example.com',
    tenantId: 'tenant_abc123',
    experimentId: 'pricing_test_001'
  });
  
  // Display pricing
  LastPrice.showPricing('#pricing-container');
</script>
```

### Custom Conversion Handler

```javascript
LastPrice.showPricing('#pricing-container', {
  onConvert: async function(pricing) {
    console.log('User clicked buy for:', pricing);
    
    // Your custom logic (e.g., redirect to checkout)
    window.location.href = '/checkout?plan=' + pricing.plan;
    
    // Record conversion
    await LastPrice.convert({ revenue: pricing.price });
  }
});
```

### Custom Renderer

```javascript
LastPrice.showPricing('#pricing-container', {
  customRenderer: function(pricing, convertFn) {
    return `
      <div class="my-custom-pricing">
        <h2>${pricing.plan}</h2>
        <p class="price">$${pricing.price}/mo</p>
        <button onclick="convertFn()">Subscribe</button>
      </div>
    `;
  }
});
```

### Manual Conversion Tracking

```javascript
// Record a conversion manually
await LastPrice.convert({
  revenue: 39.99,
  onSuccess: function(response) {
    console.log('Conversion recorded!', response);
    alert('Thank you for subscribing!');
  },
  onError: function(error) {
    console.error('Failed to record conversion', error);
  }
});
```

## API Reference

### `LastPrice.configure(options)`

Configure the Last Price client.

**Parameters:**
- `options` (Object): Configuration options
  - `apiBase` (string): API base URL
  - `tenantId` (string): Your tenant ID
  - `experimentId` (string): Experiment identifier
  - `cookieName` (string, optional): Cookie name for user ID (default: `'lp_user_id'`)
  - `cookieMaxAge` (number, optional): Cookie max age in seconds (default: 1 year)
  - `debug` (boolean, optional): Enable debug logging (default: `false`)

### `LastPrice.showPricing(containerSelector, options)`

Display pricing in a container element.

**Parameters:**
- `containerSelector` (string | HTMLElement): CSS selector or DOM element
- `options` (Object, optional): Display options
  - `onConvert` (Function): Custom conversion handler
  - `customRenderer` (Function): Custom rendering function

**Returns:** Promise

**Example:**
```javascript
await LastPrice.showPricing('#pricing-container', {
  onConvert: async (pricing) => {
    // Your logic
    await LastPrice.convert({ revenue: pricing.price });
  }
});
```

### `LastPrice.convert(options)`

Record a conversion event.

**Parameters:**
- `options` (Object, optional):
  - `revenue` (number): Revenue amount
  - `onSuccess` (Function): Success callback
  - `onError` (Function): Error callback

**Returns:** Promise<Object>

**Example:**
```javascript
await LastPrice.convert({
  revenue: 49.99,
  onSuccess: (response) => console.log('Success!', response),
  onError: (error) => console.error('Error:', error)
});
```

### `LastPrice.getUserId()`

Get the current user ID (creates one if it doesn't exist).

**Returns:** string

### `LastPrice.getVariant()`

Get the current variant assignment.

**Returns:** Object | null
- `userId`: User identifier
- `experimentId`: Experiment identifier
- `variant`: Assigned variant name

## Examples

### Example 1: Simple Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Pricing Page</title>
</head>
<body>
  <h1>Choose Your Plan</h1>
  <div id="pricing-container"></div>
  
  <script src="https://cdn.yoursite.com/lastprice.js"></script>
  <script>
    LastPrice.configure({
      apiBase: 'https://api.lastprice.example.com',
      tenantId: 'tenant_demo',
      experimentId: 'pricing_test_001'
    });
    
    LastPrice.showPricing('#pricing-container');
  </script>
</body>
</html>
```

### Example 2: React Integration

```jsx
import { useEffect, useRef } from 'react';

function PricingPage() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Load LastPrice script
    const script = document.createElement('script');
    script.src = 'https://cdn.yoursite.com/lastprice.js';
    script.async = true;
    script.onload = () => {
      window.LastPrice.configure({
        apiBase: 'https://api.lastprice.example.com',
        tenantId: 'tenant_demo',
        experimentId: 'pricing_test_001'
      });
      
      window.LastPrice.showPricing(containerRef.current, {
        onConvert: async (pricing) => {
          // Handle conversion in React
          console.log('Converting:', pricing);
          await window.LastPrice.convert({ revenue: pricing.price });
          // Navigate to checkout, show success message, etc.
        }
      });
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <div>
      <h1>Choose Your Plan</h1>
      <div ref={containerRef}></div>
    </div>
  );
}
```

### Example 3: Multiple Experiments

```javascript
// Show different experiments on different pages
if (window.location.pathname === '/basic-plan') {
  LastPrice.configure({
    apiBase: 'https://api.lastprice.example.com',
    tenantId: 'tenant_demo',
    experimentId: 'basic_plan_pricing'
  });
} else if (window.location.pathname === '/premium-plan') {
  LastPrice.configure({
    apiBase: 'https://api.lastprice.example.com',
    tenantId: 'tenant_demo',
    experimentId: 'premium_plan_pricing'
  });
}

LastPrice.showPricing('#pricing-container');
```

### Example 4: Custom Styling

```html
<style>
  .my-pricing-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 16px;
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .my-pricing-card h2 {
    font-size: 32px;
    margin-bottom: 16px;
  }
  
  .my-pricing-card .price {
    font-size: 48px;
    font-weight: bold;
    margin: 24px 0;
  }
  
  .my-pricing-card button {
    background: white;
    color: #667eea;
    border: none;
    padding: 16px 32px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
  }
</style>

<div id="pricing-container"></div>

<script>
  LastPrice.showPricing('#pricing-container', {
    customRenderer: function(pricing) {
      return `
        <div class="my-pricing-card">
          <h2>${pricing.plan}</h2>
          <div class="price">$${pricing.price}<span style="font-size: 20px;">/mo</span></div>
          <ul style="list-style: none; padding: 0; margin: 24px 0;">
            ${pricing.features.map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
          <button id="lp-convert-btn">Get Started</button>
        </div>
      `;
    }
  });
</script>
```

## Troubleshooting

### Pricing not showing

1. Check the browser console for errors
2. Verify your `apiBase`, `tenantId`, and `experimentId` are correct
3. Enable debug mode: `LastPrice.configure({ debug: true })`
4. Ensure the container element exists before calling `showPricing()`

### Conversions not tracking

1. Make sure you called `showPricing()` before `convert()`
2. Check the API endpoint is reachable
3. Verify the experiment is active in your dashboard
4. Enable debug mode to see request/response details

### Cookie not persisting

1. Check that your site is served over HTTPS (cookies with `SameSite=Lax` require secure context)
2. Verify no browser extensions are blocking cookies
3. Try a custom `cookieName` if there are conflicts

### CORS errors

If you see CORS errors in the console, ensure your API server has the correct CORS headers:

```javascript
// Express.js example
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://yoursite.com');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

## Security Considerations

1. **API Keys**: Never expose your tenant API keys in client-side code. The snippet uses tenant IDs, not API keys.
2. **HTTPS**: Always serve your site over HTTPS to protect user data
3. **CSP**: If using Content Security Policy, allow the snippet domain:
   ```html
   <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://cdn.yoursite.com">
   ```

## Performance

- **Size**: ~4KB minified (~1.5KB gzipped)
- **Dependencies**: None
- **Load Time**: <50ms on average connection
- **Caching**: Set appropriate cache headers for the script (e.g., 1 year)

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- iOS Safari 11+
- Android Chrome 60+

Requires support for:
- `fetch` API
- `async/await`
- `const/let`
- Arrow functions
- Template literals

For older browsers, use a polyfill like [polyfill.io](https://polyfill.io/).

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://docs.lastprice.example.com
- Issues: https://github.com/your-org/last-price/issues
- Email: support@lastprice.example.com

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Basic variant assignment
- Conversion tracking
- Default pricing card renderer
- Auto-load support via data attributes
