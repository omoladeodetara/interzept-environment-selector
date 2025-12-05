import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCard } from "@/components/account-card";
import { TransactionList } from "@/components/transaction-list";
import { sampleAccounts, sampleTransactions, sampleDashboardStats } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const stats = sampleDashboardStats;
  const recentTransactions = sampleTransactions.slice(0, 5);
  const alertAccounts = sampleAccounts.filter(
    (acc) => acc.status === 'payment_required' || acc.status === 'suspended'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your agent banking operations
        </p>
      </div>

      {/* Alert Banner */}
      {alertAccounts.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Attention Required</CardTitle>
            <CardDescription>
              {alertAccounts.length} account(s) need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                >
                  <div>
                    <div className="font-medium">{account.agentName}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {account.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(account.balance)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current balance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Accounts</CardDescription>
            <CardTitle className="text-3xl">{stats.totalAccounts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600">
              {stats.activeAccounts} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(stats.totalBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Across all accounts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month Revenue</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(stats.revenueThisMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600">
              From agent operations
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
            <CardTitle className="text-3xl">{stats.totalTransactions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.pendingTransactions} pending
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Agent Accounts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <TransactionList transactions={recentTransactions} />
      </div>
    </div>
  );
}
