# interzept-environment-selector

Multi-environment data source selector with feature flags and production safety.  Perfect for testing and debugging across multiple environments simultaneously.

---

## Environment Selector vs Data Source Selector

**Environment Selector**: Lets you choose which app environment to use (e.g., development, staging, production). Useful for testing how your app behaves in different deployment contexts.

**Data Source Selector**: Lets you choose where your app gets its data (e.g., mock data, local database, remote API). Useful for switching between test data and real data sources.

**This package combines both!**
- Select environments (dev, UAT, prod) and data sources (mock, local, API) in one UI.
- Multi-select and merge data from several sources/environments for advanced testing and debugging.

This flexibility makes it a powerful tool for development, QA, and debugging.

---

## Features

✨ **Multi-Select** - Select and merge data from multiple environments simultaneously  
🔒 **Production Safe** - Automatically hidden in production deployments  
🎯 **Feature Flag** - Company-only internal tool with "Internal" badge  
💾 **Persistent** - Selection saved to localStorage  
🚀 **Zero Config** - Works out of the box in development  
⚡ **Parallel Fetching** - Fetch from multiple sources in parallel  

## Installation

```bash
npm install interzept-environment-selector
# or
pnpm add interzept-environment-selector
# or
yarn add interzept-environment-selector
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
// app/layout.tsx
import { DataSourceProvider } from 'interzept-environment-selector'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DataSourceProvider>
          {children}
        </DataSourceProvider>
      </body>
    </html>
  )
}
```

  ## Using Wrappers for Customization

  You can create thin wrapper files in your app or in this package to customize, feature-flag, or style the exports from `interzept-environment-selector`. Wrappers help keep your import paths stable and allow you to add app-specific logic.

  **Example: Custom Wrapper for DataSourceToggle**

  ```tsx
  // src/data-source-toggle-wrapper.tsx
  // Add feature flags, custom props, or styling here if needed
  export { DataSourceToggle } from 'interzept-environment-selector'
  ```

  **Why use wrappers?**
  - Add feature flags or environment checks
  - Apply custom styling or theming
  - Set default props or behaviors
  - Add logging, analytics, or permission checks
  - Keep your app's import paths stable

  Other developers can import from your wrapper instead of the package directly if they need custom logic. For most use cases, importing directly from the package is fine.

### 2. Add the toggle to your sidebar

Choose the version that fits your project:

**Option A: With Tailwind CSS**
```tsx
// components/sidebar.tsx
import { DataSourceToggle } from 'interzept-environment-selector'

export function Sidebar() {
  return (
    <nav>
      <DataSourceToggle />
    </nav>
  )
}
```

Then configure Tailwind to scan the package:
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/interzept-environment-selector/dist/**/*.{js,mjs}'
  ],
}
```

**Option B: Without Tailwind (Plain CSS)**
```tsx
// components/sidebar.tsx
import { DataSourceToggleUnstyled } from 'interzept-environment-selector/unstyled'
import 'interzept-environment-selector/styles.css'

export function Sidebar() {
  return (
    <nav>
      <DataSourceToggleUnstyled />
    </nav>
  )
}
```

No configuration needed! Works in any React project.

### 3. Use in your components

```tsx
// components/my-component.tsx
import { useDataSource, useMockData } from 'interzept-environment-selector'

export function MyComponent() {
  const isMockMode = useMockData()
  const { getApiBaseUrls } = useDataSource()
  
  useEffect(() => {
    if (isMockMode) {
      setData(MOCK_DATA)
      return
    }
    
    // Fetch from all selected sources in parallel
    const urls = getApiBaseUrls()
    const results = await Promise.allSettled(
      urls.map(url => fetch(`${url}/api/endpoint?tenantId=${tenantId}`))
    )
    
    // Merge all successful results
    const allData = []
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allData.push(...result.value.data)
      }
    })
    
    setData(allData)
  }, [isMockMode, getApiBaseUrls])
  
  return <div>{/* Your UI */}</div>
}
```

## Environment Configuration

Create a `.env.local` file:

```env
# Data source configuration
NEXT_PUBLIC_DATA_SOURCE=local

# Feature flag (optional - enabled by default in dev)
# NEXT_PUBLIC_ENABLE_DATA_SOURCE_TOGGLE=false

# Production safety (optional - recommended)
NEXT_PUBLIC_PRODUCTION_READ_ONLY=true

# Environment-specific API URLs
NEXT_PUBLIC_DEV_API_URL=https://dev-api.yourapp.com
NEXT_PUBLIC_UAT_API_URL=https://uat-api.yourapp.com
NEXT_PUBLIC_PROD_API_URL=https://api.yourapp.com
```

## Data Sources

| Source | Description | Icon | Use Case |
|--------|-------------|------|----------|
| **Mock** | Static test data | 🧪 | UI development without backend |
| **Local** | Local Supabase/DB | 💾 | Feature development |
| **Dev** | Preview environment | 🖥️ | Testing commits/PRs |
| **UAT** | Main branch | 🏢 | Pre-production testing |
| **Production** | Release branch | 🌐 | Live data (read-only by default) |

## API Reference

### `DataSourceProvider`

Wraps your app to provide data source context.

```tsx
<DataSourceProvider>
  {children}
</DataSourceProvider>
```

### `useDataSource()`

Access data source state and methods.

```tsx
const {
  selectedSources,      // DataSourceMode[] - Currently selected sources
  toggleSource,         // (mode: DataSourceMode) => void - Toggle a source
  setSelectedSources,   // (modes: DataSourceMode[]) => void - Set sources
  useMockData,          // () => boolean - Is mock mode active?
  getApiBaseUrls,       // () => string[] - Get all selected API URLs
  primarySource,        // DataSourceMode - First selected source
  isProductionReadOnly, // boolean - Is production read-only?
  canShowToggle,        // boolean - Should toggle be visible?
} = useDataSource()
```

### `useMockData()`

Shorthand to check if mock mode is active.

```tsx
const isMockMode = useMockData()
```

### `useApiData()`

Check if any real API source is selected.

```tsx
const hasApiData = useApiData()
```

### `DataSourceToggle` / `DataSourceToggleUnstyled`

UI component for source selection. Choose based on your styling preference:

```tsx
// Tailwind version (requires Tailwind CSS setup)
import { DataSourceToggle } from 'interzept-environment-selector'
<DataSourceToggle />

// Plain CSS version (works everywhere)
import { DataSourceToggleUnstyled } from 'interzept-environment-selector/unstyled'
import 'interzept-environment-selector/styles.css'
<DataSourceToggleUnstyled />
```

## Styling & Customization

### Tailwind Version

Uses Tailwind utility classes. Requires:
1. Tailwind CSS configured in your project
2. Package path added to Tailwind content config
3. `lucide-react` installed

### Plain CSS Version

Uses standalone CSS with class prefix `dst-*`. To customize:

```css
/* Override in your own CSS file */
.dst-container {
  margin-bottom: 2rem !important;
}

.dst-header {
  color: #your-color !important;
}

.dst-item-button:hover {
  background-color: #your-hover-color !important;
}
```

**Available CSS Classes:**
- `.dst-container` - Main wrapper
- `.dst-header` - Collapsible header button
- `.dst-badge` - "Internal" badge
- `.dst-item-button` - Each data source button
- `.dst-icon-purple`, `.dst-icon-blue`, `.dst-icon-green`, `.dst-icon-amber`, `.dst-icon-red` - Icon colors
- `.dst-footer` - Footer with selection count

### Comparison

| Feature | Tailwind (`DataSourceToggle`) | Plain CSS (`DataSourceToggleUnstyled`) |
|---------|-------------------------------|----------------------------------------|
| Setup | Requires Tailwind config | Import CSS once |
| Customization | Tailwind classes or wrapper | CSS overrides with `!important` |
| Bundle Size | Smaller (utility classes) | Includes compiled CSS (~3KB) |
| Best For | Tailwind projects | Any React project |

## Production Deployment

The toggle **automatically hides** in production when:
- `NODE_ENV === 'production'` AND
- `NEXT_PUBLIC_VERCEL_ENV === 'production'`

### Deployment Visibility Matrix

| Environment | Toggle Visible? | Production Selectable? |
|-------------|-----------------|------------------------|
| Local dev | ✅ Always | 🔒 No (if read-only enabled) |
| Vercel Preview | ✅ Always | 🔒 No (if read-only enabled) |
| Vercel Production | ❌ Never | ❌ Never |

## Advanced Usage

### Custom Environment URLs

```tsx
const API_URLS = {
  local: process.env.NEXT_PUBLIC_LOCAL_URL || 'http://localhost:55321',
  dev: process.env.NEXT_PUBLIC_DEV_API_URL || 'https://dev.api.com',
  // ...
}
```

### Fetching from Multiple Sources

```tsx
async function fetchMultiSource(endpoint: string) {
  const { getApiBaseUrls } = useDataSource()
  const urls = getApiBaseUrls()
  
  const results = await Promise.allSettled(
    urls.map(baseUrl => 
      fetch(`${baseUrl}${endpoint}`)
        .then(res => res.json())
    )
  )
  
  // Handle results
  const allData = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.data)
  
  return allData
}
```

### Conditional Rendering

```tsx
const { canShowToggle } = useDataSource()

return (
  <nav>
    {canShowToggle && <DataSourceToggle />}
  </nav>
)
```

## TypeScript

Full TypeScript support included:

```typescript
import type { DataSourceMode } from 'interzept-environment-selector'

type DataSourceMode = 'mock' | 'local' | 'dev' | 'uat' | 'production'
```

## Contributing

Contributions welcome!

## License

MIT

## Credits

Built with ❤️ for developers who need to test across multiple environments simultaneously.

**Check out other Interzept projects:**
- [Interzept Browser Extension](https://github.com/interzept/interzept-browser-extension) - Browser extension for enhanced development workflows

---

**Need help?** Open an issue on [GitHub](https://github.com/interzept/interzept-environment-selector/issues)
