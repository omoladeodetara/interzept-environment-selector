# Demo Template

This is a starter template for creating new Last Price demo applications.

## Quick Start

1. Copy this template:
   ```bash
   cp -r demos/_template demos/my-new-demo
   ```

2. Update `package.json`:
   - Change `name` to your demo name
   - Update the port in `dev` script if needed

3. Update this README with your demo's purpose

4. Implement your product UI in `app/`

5. Integrate Last Price:
   ```typescript
   import { usePricingExperiment } from '../_shared/hooks';

   function PricingPage() {
     const { price, loading, trackConversion } = usePricingExperiment('your-experiment-id');
     
     if (loading) return <div>Loading...</div>;
     
     return (
       <div>
         <h1>Only ${price}/month</h1>
         <button onClick={() => trackConversion(price)}>
           Subscribe
         </button>
       </div>
     );
   }
   ```

## Structure

```
_template/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── pricing/        # Pricing page (Last Price integration)
│   └── globals.css     # Styles
├── components/
│   └── ui/             # UI components
├── lib/
│   └── utils.ts        # Utilities
├── package.json
└── README.md
```
