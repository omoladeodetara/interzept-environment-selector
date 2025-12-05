import { PaymentRequiredResponse } from './types';

/**
 * HTTP 402 Payment Required Handler
 * 
 * This module handles HTTP 402 responses from the API,
 * which indicate that payment authorization is required.
 */

export class PaymentRequiredError extends Error {
  public readonly response: PaymentRequiredResponse;
  public readonly statusCode = 402;

  constructor(response: PaymentRequiredResponse) {
    super(response.message);
    this.name = 'PaymentRequiredError';
    this.response = response;
  }
}

/**
 * Check if an account has sufficient funds
 */
export function hasSufficientFunds(
  balance: number,
  amount: number
): boolean {
  return balance >= amount;
}

/**
 * Create a Payment Required response
 */
export function createPaymentRequiredResponse(
  accountId: string,
  requiredAmount: number,
  currentBalance: number,
  code: PaymentRequiredResponse['code'] = 'INSUFFICIENT_FUNDS'
): PaymentRequiredResponse {
  let message: string;
  switch (code) {
    case 'INSUFFICIENT_FUNDS':
      message = `Insufficient funds. Required: $${requiredAmount.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`;
      break;
    case 'ACCOUNT_SUSPENDED':
      message = 'Account is suspended. Please contact support or top up your account.';
      break;
    case 'LIMIT_EXCEEDED':
      message = `Monthly limit exceeded. Required: $${requiredAmount.toFixed(2)}, Remaining: $${currentBalance.toFixed(2)}`;
      break;
    default:
      message = 'Payment required to complete this operation.';
  }

  return {
    error: 'Payment Required',
    code,
    message,
    requiredAmount,
    currentBalance,
    topUpUrl: `/billing/topup?account=${encodeURIComponent(accountId)}&amount=${Math.max(0, requiredAmount - currentBalance)}`,
    accountId,
  };
}

/**
 * Handle payment required response in the UI
 */
export function handlePaymentRequired(
  response: PaymentRequiredResponse,
  onTopUp?: (url: string) => void
): void {
  console.warn('Payment Required:', response);
  
  if (onTopUp) {
    onTopUp(response.topUpUrl);
  } else {
    // Default behavior: navigate to top-up page
    if (typeof window !== 'undefined') {
      window.location.href = response.topUpUrl;
    }
  }
}

/**
 * Validate transaction before processing
 */
export function validateTransaction(
  accountBalance: number,
  transactionAmount: number,
  monthlyLimit?: number,
  usageThisMonth?: number
): { valid: boolean; error?: PaymentRequiredResponse['code'] } {
  if (transactionAmount <= 0) {
    return { valid: false };
  }

  if (accountBalance < transactionAmount) {
    return { valid: false, error: 'INSUFFICIENT_FUNDS' };
  }

  if (monthlyLimit && monthlyLimit > 0 && usageThisMonth !== undefined) {
    const projectedUsage = usageThisMonth + transactionAmount;
    if (projectedUsage > monthlyLimit) {
      return { valid: false, error: 'LIMIT_EXCEEDED' };
    }
  }

  return { valid: true };
}
