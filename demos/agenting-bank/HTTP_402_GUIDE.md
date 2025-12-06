# HTTP 402 Payment Required - Implementation Guide

This document explains how the Agenting Bank module implements HTTP 402 (Payment Required) status code handling.

## What is HTTP 402?

HTTP 402 "Payment Required" is a reserved status code originally intended for digital cash or micropayment systems. While not fully standardized, it's perfect for modern agent-based systems where:

- AI agents need to pay for API calls
- Services require payment authorization
- Micro-transactions are common
- Usage-based billing is essential

## Implementation in Agenting Bank

### Server-Side Implementation

#### 1. Payment Handler (`lib/payment-handler.ts`)

```typescript
export function createPaymentRequiredResponse(
  accountId: string,
  requiredAmount: number,
  currentBalance: number,
  code: 'INSUFFICIENT_FUNDS' | 'ACCOUNT_SUSPENDED' | 'LIMIT_EXCEEDED'
): PaymentRequiredResponse {
  return {
    error: 'Payment Required',
    code,
    message: getPaymentRequiredMessage(code, requiredAmount, currentBalance),
    requiredAmount,
    currentBalance,
    topUpUrl: `/billing/topup?account=${accountId}&amount=${requiredAmount - currentBalance}`,
    accountId,
  };
}
```

#### 2. API Route Example (`app/api/transfer/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  const { fromAccountId, amount } = await request.json();
  
  const sourceAccount = await getAccount(fromAccountId);
  
  // Validate transaction
  const validation = validateTransaction(
    sourceAccount.balance,
    amount,
    sourceAccount.monthlyLimit,
    sourceAccount.usageThisMonth
  );
  
  if (!validation.valid) {
    // Return HTTP 402 Payment Required
    return NextResponse.json(
      createPaymentRequiredResponse(
        sourceAccount.id,
        amount,
        sourceAccount.balance,
        validation.error!
      ),
      { status: 402 }
    );
  }
  
  // Process transaction...
}
```

### Client-Side Implementation

#### 1. API Client (`lib/api-client.ts`)

```typescript
class ApiClient {
  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const response = await fetch(url, options);
    
    // Handle HTTP 402 Payment Required
    if (response.status === 402) {
      const paymentData: PaymentRequiredResponse = await response.json();
      
      if (options.onPaymentRequired) {
        options.onPaymentRequired(paymentData);
      }
      
      throw new PaymentRequiredError(paymentData);
    }
    
    return response.json();
  }
}
```

#### 2. Custom Error Class

```typescript
export class PaymentRequiredError extends Error {
  public readonly response: PaymentRequiredResponse;
  public readonly statusCode = 402;
  
  constructor(response: PaymentRequiredResponse) {
    super(response.message);
    this.name = 'PaymentRequiredError';
    this.response = response;
  }
}
```

## Response Format

### Standard 402 Response Structure

```json
{
  "error": "Payment Required",
  "code": "INSUFFICIENT_FUNDS",
  "message": "Insufficient funds. Required: $150.00, Available: $89.25",
  "requiredAmount": 150.00,
  "currentBalance": 89.25,
  "topUpUrl": "/billing/topup?account=acc_002&amount=60.75",
  "accountId": "acc_002"
}
```

### Error Codes

1. **INSUFFICIENT_FUNDS**: Account balance is less than required amount
2. **ACCOUNT_SUSPENDED**: Account is suspended and requires reactivation
3. **LIMIT_EXCEEDED**: Monthly spending limit has been reached

## Use Cases

### 1. API Call with Insufficient Funds

```typescript
// Agent tries to call premium API
const result = await apiClient.post('/api/transfer', {
  fromAccountId: 'acc_002',
  toAccountId: 'acc_service',
  amount: 150.00
}, {
  onPaymentRequired: (response) => {
    // Redirect to top-up page
    window.location.href = response.topUpUrl;
  }
});
```

### 2. Proactive Balance Check

```typescript
// Check before making expensive operation
const validation = validateTransaction(
  account.balance,
  operationCost,
  account.monthlyLimit,
  account.usageThisMonth
);

if (!validation.valid) {
  // Show top-up modal or redirect
  showPaymentModal(account.id, operationCost);
}
```

### 3. Automatic Top-up Trigger

```typescript
// Configure automatic top-up when balance is low
if (account.balance < AUTO_TOPUP_THRESHOLD) {
  await topUpAccount(account.id, AUTO_TOPUP_AMOUNT);
}
```

## Frontend Handling

### Payment Modal Component

```tsx
function PaymentRequiredModal({ error }: { error: PaymentRequiredResponse }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>{error.message}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Required Amount:</span>
            <span className="font-bold">{formatCurrency(error.requiredAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Balance:</span>
            <span>{formatCurrency(error.currentBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Need to Add:</span>
            <span className="font-bold text-green-600">
              {formatCurrency(error.requiredAmount - error.currentBalance)}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button asChild>
            <Link href={error.topUpUrl}>Top Up Account</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Best Practices

### 1. Clear Error Messages

Always provide actionable information in 402 responses:
- How much is required
- Current balance
- Direct link to resolve the issue

### 2. Consistent Response Format

Use the same structure for all 402 responses across your API.

### 3. Client-Side Handling

Implement global 402 handlers in your API client to provide consistent UX.

### 4. Graceful Degradation

Show appropriate UI when operations can't complete due to insufficient funds.

### 5. Transaction Validation

Validate transactions before attempting to process them to avoid partial failures.

## Testing

### Test Cases

1. **Insufficient Funds**: Account balance < transaction amount
2. **Monthly Limit**: Usage this month + transaction > monthly limit
3. **Suspended Account**: Account status is 'suspended'
4. **Edge Cases**: Zero balance, exact balance match, negative amounts

### Example Test

```typescript
describe('HTTP 402 Payment Required', () => {
  it('should return 402 when insufficient funds', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({
        fromAccountId: 'acc_002',
        toAccountId: 'acc_001',
        amount: 150.00
      });
    
    expect(response.status).toBe(402);
    expect(response.body.error).toBe('Payment Required');
    expect(response.body.code).toBe('INSUFFICIENT_FUNDS');
    expect(response.body.topUpUrl).toBeDefined();
  });
});
```

## Security Considerations

1. **Validate Input**: Always validate transaction amounts and account IDs
2. **Rate Limiting**: Prevent abuse of payment check endpoints
3. **Authentication**: Ensure only authorized users can check balances
4. **Audit Trail**: Log all 402 responses for monitoring and debugging

## Future Enhancements

- [ ] Retry mechanism for failed transactions
- [ ] Automatic top-up based on balance thresholds
- [ ] Multiple payment methods (card, crypto, bank transfer)
- [ ] Transaction batching for multiple operations
- [ ] Real-time balance updates via WebSocket

## References

- [HTTP 402 Payment Required - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)
- [RFC 7231 - HTTP/1.1 Semantics](https://tools.ietf.org/html/rfc7231#section-6.5.2)
- [Agenting Bank Implementation](./README.md)
