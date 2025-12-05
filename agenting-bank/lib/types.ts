// Account Types
export interface AgentAccount {
  id: string;
  agentId: string;
  agentName: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'payment_required';
  accountType: 'standard' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  monthlyLimit?: number;
  usageThisMonth: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'payment_required';
  description: string;
  category: string;
  metadata?: {
    apiEndpoint?: string;
    requestId?: string;
    agentAction?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

// HTTP 402 Response
export interface PaymentRequiredResponse {
  error: 'Payment Required';
  code: 'INSUFFICIENT_FUNDS' | 'ACCOUNT_SUSPENDED' | 'LIMIT_EXCEEDED';
  message: string;
  requiredAmount?: number;
  currentBalance?: number;
  topUpUrl: string;
  accountId: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  totalTransactions: number;
  pendingTransactions: number;
  paymentRequiredCount: number;
  revenueThisMonth: number;
}

// API Request/Response Types
export interface CreateAccountRequest {
  agentId: string;
  agentName: string;
  accountType: 'standard' | 'premium' | 'enterprise';
  initialBalance?: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}

export interface TopUpRequest {
  accountId: string;
  amount: number;
  paymentMethod: string;
}
