import { Card, CardContent, CardHeader, CardTitle, Badge } from "@lastprice/ui";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  accountId?: string;
}

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'payment_required':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getTypeIcon = (type: Transaction['type']) => {
  return type === 'credit' ? '↗️' : '↙️';
};

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'api_usage':
      return '🔌';
    case 'deposit':
      return '💰';
    case 'data_transfer':
      return '📦';
    case 'monitoring':
      return '👁️';
    default:
      return '💳';
  }
};

export function TransactionList({ transactions, accountId }: TransactionListProps) {
  const filteredTransactions = accountId
    ? transactions.filter((t) => t.accountId === accountId)
    : transactions;

  if (filteredTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No transactions found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xl">{getCategoryEmoji(transaction.category)}</span>
                  <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                    {transaction.metadata?.apiEndpoint && (
                      <span className="ml-2">• {transaction.metadata.apiEndpoint}</span>
                    )}
                  </div>
                  {transaction.metadata?.agentAction && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Action: {transaction.metadata.agentAction}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-foreground'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <Badge variant={getStatusColor(transaction.status)} className="text-xs">
                    {transaction.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
