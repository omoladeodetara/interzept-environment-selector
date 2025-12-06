import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@lastprice/ui";
import { TransactionList } from "@/components/transaction-list";
import { sampleTransactions } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function TransactionsPage() {
  const completedTransactions = sampleTransactions.filter((t) => t.status === 'completed');
  const pendingTransactions = sampleTransactions.filter((t) => t.status === 'pending');
  const failedTransactions = sampleTransactions.filter(
    (t) => t.status === 'failed' || t.status === 'payment_required'
  );

  const totalVolume = sampleTransactions.reduce((sum, t) => sum + t.amount, 0);
  const creditVolume = sampleTransactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const debitVolume = sampleTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all agent transactions
        </p>
      </div>

      {/* Transaction Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Volume</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(totalVolume)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Credits</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(creditVolume)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Money in
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Debits</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(debitVolume)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Money out
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">{sampleTransactions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge>{completedTransactions.length} done</Badge>
              {pendingTransactions.length > 0 && (
                <Badge variant="secondary">{pendingTransactions.length} pending</Badge>
              )}
              {failedTransactions.length > 0 && (
                <Badge variant="destructive">{failedTransactions.length} failed</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failed/Payment Required Transactions */}
      {failedTransactions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-destructive">
            ⚠️ Failed Transactions ({failedTransactions.length})
          </h2>
          <TransactionList transactions={failedTransactions} />
        </div>
      )}

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            🕐 Pending Transactions ({pendingTransactions.length})
          </h2>
          <TransactionList transactions={pendingTransactions} />
        </div>
      )}

      {/* All Transactions */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Transactions</h2>
        <TransactionList transactions={sampleTransactions} />
      </div>

      {/* Transaction Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Categories</CardTitle>
          <CardDescription>
            Understanding transaction types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2 p-3 rounded-lg border">
              <span className="text-xl">🔌</span>
              <div>
                <div className="font-medium text-sm">API Usage</div>
                <div className="text-xs text-muted-foreground">
                  Charges for API calls and compute resources
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border">
              <span className="text-xl">💰</span>
              <div>
                <div className="font-medium text-sm">Deposit</div>
                <div className="text-xs text-muted-foreground">
                  Account top-ups and credits
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border">
              <span className="text-xl">📦</span>
              <div>
                <div className="font-medium text-sm">Data Transfer</div>
                <div className="text-xs text-muted-foreground">
                  Charges for bulk data operations
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border">
              <span className="text-xl">👁️</span>
              <div>
                <div className="font-medium text-sm">Monitoring</div>
                <div className="text-xs text-muted-foreground">
                  Real-time monitoring and alerts
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
