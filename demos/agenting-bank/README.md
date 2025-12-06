# Agenting Bank - AI Agent Banking Platform

An AI-powered banking platform demonstrating HTTP 402 (Payment Required) integration for agent-based transactions, similar to Revolut, Coinbase, and modern crypto platforms.

## Overview

Agenting Bank showcases how AI agents can interact with banking APIs that require payment authorization. It demonstrates:

- **HTTP 402 Payment Required**: Proper handling of payment authorization flows
- **Agent Accounts**: Banking accounts for AI agents (not just humans)
- **Real-time Transactions**: Track agent spending and revenue
- **Payment Gating**: Features that require payment authorization
- **Modern Banking UI**: Built with shadcn/ui components

## Features

### Core Banking Features

- **Agent Accounts**: Create and manage banking accounts for AI agents
- **Transactions**: View transaction history with real-time updates
- **Balances**: Multi-currency balance management
- **Payment Authorization**: HTTP 402 flow for payment-required operations
- **Usage Tracking**: Monitor agent API usage and costs

### HTTP 402 Integration

The platform demonstrates proper HTTP 402 (Payment Required) status code handling:

```typescript
// When an agent tries to perform an action requiring payment
if (accountBalance < transactionCost) {
  return res.status(402).json({
    error: 'Payment Required',
    message: 'Insufficient funds for this operation',
    requiredAmount: transactionCost,
    currentBalance: accountBalance,
    topUpUrl: '/api/billing/topup'
  });
}
```

### Use Cases

1. **AI Agent Marketplaces**: Agents that buy/sell services
2. **API Monetization**: Pay-per-use API access for agents
3. **Micro-transactions**: Small automated payments between agents
4. **Resource Billing**: Usage-based billing for compute/storage

## Architecture

```
agenting-bank/
├── app/                      # Next.js 16 App Router
│   ├── dashboard/            # Account overview
│   ├── accounts/             # Manage agent accounts
│   ├── transactions/         # Transaction history
│   ├── api/                  # API routes with HTTP 402
│   └── billing/              # Payment & top-up
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── account-card.tsx      # Account display
│   ├── transaction-list.tsx  # Transaction history
│   └── payment-modal.tsx     # Payment authorization
├── lib/
│   ├── api-client.ts         # API client with 402 handling
│   ├── payment-handler.ts    # HTTP 402 response handler
│   └── utils.ts              # Utilities
└── middleware/
    └── payment-required.ts   # HTTP 402 middleware
```

## Getting Started

### Prerequisites

- Node.js 18+
- The Last Price platform running at `http://localhost:3000`

### Installation

```bash
cd agenting-bank
npm install
```

### Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BANK_NAME=Agenting Bank
```

### Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The app runs at `http://localhost:3003`

## HTTP 402 Payment Required

### What is HTTP 402?

HTTP 402 is a reserved status code meant for "Payment Required". While originally intended for digital cash/micropayment systems, it's perfect for modern agent-based systems where:

- AI agents need to pay for API calls
- Services require payment authorization
- Micro-transactions are common
- Usage-based billing is essential

### Implementation

#### Server-side (API Routes)

```typescript
// app/api/transfer/route.ts
export async function POST(request: Request) {
  const { from, to, amount } = await request.json();
  
  // Check if account has sufficient funds
  const account = await getAccount(from);
  
  if (account.balance < amount) {
    return Response.json(
      {
        error: 'Payment Required',
        code: 'INSUFFICIENT_FUNDS',
        required: amount,
        available: account.balance,
        topUpUrl: '/api/billing/topup'
      },
      { status: 402 }
    );
  }
  
  // Process transaction...
  return Response.json({ success: true });
}
```

#### Client-side (React)

```typescript
// lib/api-client.ts
async function apiCall(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  
  if (response.status === 402) {
    const data = await response.json();
    // Show payment modal or redirect to billing
    handlePaymentRequired(data);
    return null;
  }
  
  return response.json();
}
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **State**: React 19

## Integration with Last Price

Agenting Bank can integrate with the Last Price platform to:

- Track pricing experiments for banking features
- A/B test transaction fees
- Optimize subscription pricing for agent accounts
- Monitor conversion rates for premium features

## Future Enhancements

- [ ] WebSocket for real-time transaction updates
- [ ] Multi-currency support (crypto + fiat)
- [ ] Agent-to-agent direct transfers
- [ ] Smart contract integration
- [ ] Compliance & KYC for agents
- [ ] Transaction analytics dashboard
- [ ] Automated payment retries
- [ ] Subscription management

## Related Projects

- **Revolut**: Digital banking for humans and businesses
- **Coinbase**: Cryptocurrency exchange and wallet
- **Stripe**: Payment infrastructure for the internet
- **Paid.ai**: AI agent billing and monetization

## License

MIT
