# @lastprice/data-source-toggle

Multi-environment data source selector with feature flags and production safety. Perfect for testing and debugging across multiple environments simultaneously.

![Data Source Toggle Demo](https://via.placeholder.com/800x400?text=Data+Source+Toggle)

## Features

✨ **Multi-Select** - Select and merge data from multiple environments simultaneously  
🔒 **Production Safe** - Automatically hidden in production deployments  
🎯 **Feature Flag** - Company-only internal tool with "Internal" badge  
💾 **Persistent** - Selection saved to localStorage  
🚀 **Zero Config** - Works out of the box in development  
⚡ **Parallel Fetching** - Fetch from multiple sources in parallel  

## Installation

```bash
npm install @lastprice/data-source-toggle
# or
pnpm add @lastprice/data-source-toggle
# or
yarn add @lastprice/data-source-toggle
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
// app/layout.tsx
import { DataSourceProvider } from '@lastprice/data-source-toggle'

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

### 2. Add the toggle to your sidebar

```tsx
// components/sidebar.tsx
import { DataSourceToggle } from '@lastprice/data-source-toggle'

export function Sidebar() {
  return (
    <nav>
      {/* Your navigation items */}
      
      <DataSourceToggle />
    </nav>
  )
}
```

### 3. Use in your components

```tsx
// components/my-component.tsx
import { useDataSource, useMockData } from '@lastprice/data-source-toggle'

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

### `DataSourceToggle`

UI component for source selection.

```tsx
<DataSourceToggle />
```

## Styling

The component uses Tailwind CSS classes. Make sure you have:

1. Tailwind CSS configured
2. `lucide-react` installed for icons
3. A utility function `cn()` for className merging (optional)

If you need to customize styling, create a wrapper:

```tsx
import { DataSourceToggle } from '@lastprice/data-source-toggle'

export function CustomDataSourceToggle() {
  return (
    <div className="your-custom-wrapper">
      <DataSourceToggle />
    </div>
  )
}
```

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
import type { DataSourceMode } from '@lastprice/data-source-toggle'

type DataSourceMode = 'mock' | 'local' | 'dev' | 'uat' | 'production'
```

## Contributing

Contributions welcome! This package is part of the [Last Price](https://github.com/omoladeodetara/last-price) monorepo.

## License

MIT © Last Price

## Credits

Built with ❤️ for developers who need to test across multiple environments simultaneously.

---

**Need help?** Open an issue on [GitHub](https://github.com/omoladeodetara/last-price/issues)
