# Last Price Deployment Guide

## Deployment Strategy: Two Vercel Projects

This repository deploys to **exactly 2 Vercel projects**:

1. **last-price-oja** → Admin dashboard
2. **last-price-demos** → All customer demo apps

---

## 🏗️ Project Structure

```
GitHub Repo: last-price
    │
    ├── Vercel Project 1: "last-price-oja"
    │   └── Deploys: /oja
    │   └── Domain: oja.lastprice.io
    │
    └── Vercel Project 2: "last-price-demos"
        └── Deploys: /demos/*
        └── Routes:
            ├── /saas-pricing → demos/saas-pricing
            ├── /agenting-bank → demos/agenting-bank
            ├── /ai-api → demos/ai-api-platform
            ├── /ecommerce → demos/ecommerce-store
            ├── /marketplace → demos/marketplace
            └── /digital-products → demos/digital-products
```

---

## 🚀 Deployment Setup

### Project 1: Oja (Admin Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repo
3. **Project Name**: `last-price-oja`
4. **Root Directory**: `oja`
5. Framework: Next.js (auto-detected)
6. Deploy

**Result**: `last-price-oja.vercel.app` → Oja admin dashboard

---

### Project 2: All Demos

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import **same GitHub repo** again
3. **Project Name**: `last-price-demos`
4. **Root Directory**: `demos`
5. Framework: Other (uses custom build)
6. Deploy

**Result**: `last-price-demos.vercel.app` with all demos accessible via:
- `last-price-demos.vercel.app/saas-pricing`
- `last-price-demos.vercel.app/agenting-bank`
- `last-price-demos.vercel.app/ai-api`
- `last-price-demos.vercel.app/ecommerce`
- `last-price-demos.vercel.app/marketplace`
- `last-price-demos.vercel.app/digital-products`

---

## 🌐 Custom Domains

### Oja Project
```
oja.lastprice.io → Vercel Project: last-price-oja
```

### Demos Project
```
demos.lastprice.io → Vercel Project: last-price-demos
```

Then access demos via:
- `demos.lastprice.io/saas-pricing`
- `demos.lastprice.io/agenting-bank`
- etc.

**Or use subdomain routing:**
- `saas.demos.lastprice.io` → `/saas-pricing`
- `bank.demos.lastprice.io` → `/agenting-bank`

---

## 🔐 Environment Variables

### Oja Project

```env
NEXT_PUBLIC_LASTPRICE_API_URL=https://api.lastprice.io
```

### Demos Project

```env
# Shared across all demos
NEXT_PUBLIC_LASTPRICE_API_URL=https://api.lastprice.io

# Demo-specific (if needed)
NEXT_PUBLIC_TENANT_SAAS=tenant_saas_demo
NEXT_PUBLIC_TENANT_BANK=tenant_bank_demo
```

---

## 📦 How It Works

### Demos Project Build Process

The `demos/vercel.json` configures Turborepo to build all demos:

```json
{
  "buildCommand": "turbo run build --filter='./demos/*'"
}
```

This builds:
- ✅ demos/saas-pricing
- ✅ demos/agenting-bank  
- ✅ demos/ai-api-platform
- ✅ demos/ecommerce-store
- ✅ demos/marketplace
- ✅ demos/digital-products

All demos are served from a single deployment with URL routing.

---

## 🔄 Deployment Triggers

| Project | Triggers On | Deploys |
|---------|-------------|---------|
| last-price-oja | Changes in `/oja/**` | Oja dashboard |
| last-price-demos | Changes in `/demos/**` | All demos |

---

## 🛠️ Local Development

```bash
# Install all dependencies
pnpm install

# Run Oja
cd oja && pnpm dev
# → http://localhost:3000

# Run a demo
cd demos/saas-pricing && pnpm dev
# → http://localhost:3001

# Run all demos in parallel
turbo dev --filter='./demos/*'
```

---

## 📊 Project Comparison

| Aspect | 2 Projects (Current) | 6+ Projects (Alternative) |
|--------|---------------------|---------------------------|
| Vercel projects | 2 | 7+ |
| Management | Simple | Complex |
| URLs | Shared domain + path | Individual domains |
| Deployment | Two clicks | Many clicks |
| Environment vars | 2 sets | 7+ sets |

---

## 🎯 Benefits of 2-Project Setup

✅ **Simple management**: Only 2 projects to configure  
✅ **Shared hosting**: All demos under one domain  
✅ **Atomic deploys**: All demos update together  
✅ **Cost effective**: Single deployment for all demos  
✅ **Easy routing**: Path-based navigation  

---

#### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repo
3. Click **"Advanced Options"**
4. Set **Root Directory** to the demo folder:
   - `demos/saas-pricing`
   - `demos/agenting-bank`
   - etc.
5. Add environment variables (see below)
6. Deploy

#### Via CLI:

```bash
# Deploy SaaS Pricing Demo
cd demos/saas-pricing
vercel --prod
# Follow prompts, create new project

# Deploy Agenting Bank Demo
cd ../agenting-bank
vercel --prod
# Follow prompts, create new project

# Repeat for other demos...
```

---

## 🌐 Resulting Domains

| App | Vercel Project | Domain |
|-----|----------------|--------|
| Oja (Admin) | `last-price` | `last-price.vercel.app` |
| SaaS Demo | `last-price-saas` | `last-price-saas.vercel.app` |
| AgentBank | `last-price-agentbank` | `last-price-agentbank.vercel.app` |
| AI API | `last-price-api` | `last-price-api.vercel.app` |
| E-commerce | `last-price-ecommerce` | `last-price-ecommerce.vercel.app` |
| Marketplace | `last-price-marketplace` | `last-price-marketplace.vercel.app` |
| Digital Products | `last-price-digital` | `last-price-digital.vercel.app` |

---

## 🔐 Environment Variables

### Shared Variables (All Apps)

Add these to each Vercel project:

```env
NEXT_PUBLIC_LASTPRICE_API_URL=https://api.lastprice.io
```

### Demo-Specific Variables

#### saas-pricing
```env
NEXT_PUBLIC_LASTPRICE_TENANT_ID=tenant_saas_demo
NEXT_PUBLIC_EXPERIMENT_PRICING=exp_saas_pricing_001
```

#### agenting-bank
```env
NEXT_PUBLIC_LASTPRICE_TENANT_ID=tenant_agentbank_demo
NEXT_PUBLIC_EXPERIMENT_TOPUP=exp_agentbank_topup_001
```

#### ai-api-platform
```env
NEXT_PUBLIC_LASTPRICE_TENANT_ID=tenant_api_demo
NEXT_PUBLIC_EXPERIMENT_PRICING_MODEL=exp_api_model_001
```

*(Add similar configs for other demos)*

---

## 🔄 CI/CD Workflow

### Automatic Deployments

Vercel will automatically deploy:
- **Main app (Oja)**: On any push to `main` branch
- **Demo apps**: Only when files in their respective folders change

### Manual Deployments

```bash
# Deploy specific demo
cd demos/saas-pricing
vercel --prod

# Deploy Oja
cd ../../oja
vercel --prod
```

---

## 📦 Monorepo Benefits

With this setup you get:

✅ **Independent deployments**: Each demo deploys separately  
✅ **Shared dependencies**: Single `pnpm install` for development  
✅ **Turborepo caching**: Fast local builds  
✅ **Isolated domains**: Each demo has its own URL  
✅ **Single repo**: Easy code sharing via `_shared/`

---

## 🛠️ Local Development

```bash
# Install dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Run specific app
cd demos/saas-pricing
pnpm dev

# Or use Turbo
turbo dev --filter=saas-pricing
```

---

## 📊 Vercel Project Configuration

### Root Project (Oja)

```json
{
  "framework": "nextjs",
  "buildCommand": "cd oja && pnpm build",
  "outputDirectory": "oja/.next",
  "installCommand": "pnpm install"
}
```

### Demo Projects

Each demo project uses default Next.js detection:

```json
{
  "framework": "nextjs",
  "rootDirectory": "demos/saas-pricing"
}
```

Vercel automatically detects `package.json` and runs the appropriate build.

---

## 🎯 Custom Domains

You can add custom domains to each project:

| App | Custom Domain Suggestion |
|-----|-------------------------|
| Oja | `oja.lastprice.io` |
| SaaS Demo | `cloudnote-demo.lastprice.io` |
| AgentBank | `agentbank-demo.lastprice.io` |
| AI API | `cloudai-demo.lastprice.io` |

Configure in Vercel Dashboard → Project → Settings → Domains

---

## 🚢 Quick Deploy Commands

### Via Vercel CLI

```bash
# Deploy Oja
cd oja
vercel --prod

# Deploy all demos
cd ../demos
vercel --prod
```

### First-Time Setup

```bash
# 1. Link Oja project
cd oja
vercel link
# Select: Create new project → "last-price-oja"

# 2. Link Demos project  
cd ../demos
vercel link
# Select: Create new project → "last-price-demos"
```

---

## 🔍 Troubleshooting

### "Build command not found"

Ensure Turborepo is installed:
```bash
pnpm add -D turbo
```

### Demos not routing correctly

Check `demos/vercel.json` routes configuration.

### Individual demo not building

Check that:
1. Demo has `package.json` with build script
2. Demo is in pnpm workspace (`pnpm-workspace.yaml`)
3. Turborepo includes it in build filter

---

## 📝 Summary

| What | Where | URL |
|------|-------|-----|
| Admin UI | `/oja` | `oja.lastprice.io` |
| All Demos | `/demos` | `demos.lastprice.io/*` |
| **Total Projects** | **2** | — |

Simple, clean, and scalable! 🎉
