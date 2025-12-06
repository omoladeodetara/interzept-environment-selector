# Last Price UI Component Library

A production-ready UI component library built with **shadcn/ui patterns** and **Tailwind CSS** for the Last Price A/B Testing platform.

## Overview

This Next.js application provides a modern, accessible, and responsive user interface for pricing experiments and analytics visualization. It demonstrates best practices in component design, TypeScript integration, and modern CSS architecture.

## Features

- ✨ **Modern UI Components**: Built using shadcn/ui patterns
- 🎨 **Tailwind CSS v4**: Latest Tailwind CSS with custom design tokens
- 🌓 **Dark Mode Support**: Automatic dark mode based on system preferences
- 📱 **Fully Responsive**: Mobile-first design approach
- 🔒 **Type-Safe**: Full TypeScript coverage
- ♿ **Accessible**: ARIA-compliant components
- 🎯 **Production-Ready**: Optimized build with Next.js 16

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) patterns
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: class-variance-authority, clsx, tailwind-merge

## Project Structure

```
ui/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main page (pricing + analytics)
│   │   └── globals.css         # Global styles with design tokens
│   ├── components/
│   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── card.tsx        # Card components
│   │   │   └── badge.tsx       # Badge component
│   │   ├── pricing-card.tsx    # Domain-specific pricing card
│   │   └── analytics-dashboard.tsx  # Analytics visualization
│   └── lib/
│       └── utils.ts            # Utility functions (cn helper)
├── public/                     # Static assets
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the UI directory:**
   ```bash
   cd ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Component Library

### Base UI Components

#### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost" size="sm">Ghost</Button>
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Sizes**: `default`, `sm`, `lg`, `icon`

#### Card
Flexible card components for grouping content.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>
```

#### Badge
Small status indicators and labels.

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
```

### Domain Components

#### PricingCard
Displays pricing information for A/B test variants.

```tsx
import { PricingCard } from "@/components/pricing-card"

<PricingCard
  plan="Premium"
  price={39.99}
  features={["Feature 1", "Feature 2"]}
  variant="experiment"
  onConvert={() => console.log("Convert")}
  isConverting={false}
/>
```

#### AnalyticsDashboard
Visualizes experiment results and metrics.

```tsx
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

<AnalyticsDashboard results={experimentResults} />
```

## Design System

### Color Tokens

The design system uses HSL color tokens for easy theming:

- `--background` / `--foreground` - Base colors
- `--card` / `--card-foreground` - Card colors
- `--primary` / `--primary-foreground` - Primary actions
- `--secondary` / `--secondary-foreground` - Secondary actions
- `--muted` / `--muted-foreground` - Muted/disabled states
- `--accent` / `--accent-foreground` - Accent colors
- `--destructive` / `--destructive-foreground` - Error states
- `--border` - Border colors
- `--input` - Input field borders
- `--ring` - Focus ring colors

### Typography

System fonts are used for optimal performance:
- **Sans-serif**: System UI font stack
- **Monospace**: UI monospace font stack

### Dark Mode

Dark mode is automatically enabled based on system preferences using CSS `prefers-color-scheme` media query. All color tokens have dark mode variants defined in `globals.css`.

## Integration with Backend API

The UI is designed to integrate with the Express backend API located in `/ab-testing-server`. 

### API Endpoints Used

- `GET /api/pricing` - Fetch pricing variant for a user
- `POST /api/convert` - Record a conversion
- `GET /api/experiments/:id/results` - Fetch experiment results

### Example Integration

```tsx
// Fetch pricing from backend
const fetchPricing = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3000/api/pricing?userId=${userId}`
  )
  return response.json()
}

// Record conversion
const handleConvert = async (userId: string, experimentId: string) => {
  const response = await fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, experimentId })
  })
  return response.json()
}
```

## Customization

### Adding New Components

1. Create component file in `src/components/ui/`
2. Follow shadcn/ui patterns and naming conventions
3. Use the `cn()` utility for className merging
4. Export component with proper TypeScript types

### Modifying Design Tokens

Edit `src/app/globals.css` to customize colors:

```css
:root {
  --primary: 220 90% 60%;  /* HSL values */
  --secondary: 210 40% 96%;
  /* ... other tokens */
}
```

### Adding Custom Variants

Use `class-variance-authority` (cva) for component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        custom: "custom-classes"
      }
    }
  }
)
```

## Best Practices

1. **Use the `cn()` utility** for className merging
2. **Follow React Server Components** patterns where possible
3. **Keep components small and focused** on single responsibility
4. **Use TypeScript strictly** - avoid `any` types
5. **Test components** in both light and dark modes
6. **Ensure accessibility** - use semantic HTML and ARIA attributes
7. **Optimize performance** - use dynamic imports for large components

## Production Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new components:

1. Follow the existing component structure
2. Include TypeScript types
3. Add proper documentation
4. Ensure responsive design
5. Test in both light and dark modes

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## License

MIT
