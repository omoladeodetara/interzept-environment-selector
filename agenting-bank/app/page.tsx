import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/account-card";
import { sampleAccounts, sampleDashboardStats } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const stats = sampleDashboardStats;
  const featuredAccounts = sampleAccounts.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-block mb-4 text-6xl">🏦</div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Agenting Bank
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          AI Agent Banking Platform with HTTP 402 Payment Required.
          Modern banking infrastructure for autonomous agents, inspired by Revolut, Coinbase, and crypto platforms.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/accounts">View Accounts</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Accounts</CardDescription>
            <CardTitle className="text-4xl">{stats.totalAccounts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.activeAccounts} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            <CardTitle className="text-4xl">
              {formatCurrency(stats.totalBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600">
              All accounts combined
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-4xl">{stats.totalTransactions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.pendingTransactions} pending
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Payment Required</CardDescription>
            <CardTitle className="text-4xl text-destructive">
              {stats.paymentRequiredCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Accounts need attention
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Accounts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Agent Accounts</h2>
          <Button asChild variant="ghost">
            <Link href="/accounts">View All →</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                HTTP 402 Integration
              </CardTitle>
              <CardDescription>
                Proper handling of payment authorization flows. When accounts lack 
                funds, operations return HTTP 402 status code with payment details.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Agent Banking
              </CardTitle>
              <CardDescription>
                Banking infrastructure designed for AI agents. Track usage, monitor 
                spending, and manage accounts for autonomous systems.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Real-time Transactions
              </CardTitle>
              <CardDescription>
                Instant transaction processing with detailed metadata. Track API calls, 
                agent actions, and resource usage in real-time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* HTTP 402 Example */}
      <section className="py-8">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              HTTP 402: Payment Required
            </CardTitle>
            <CardDescription>
              This platform demonstrates proper HTTP 402 status code handling for payment-gated operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground">// API Response Example</div>
              <div className="text-red-500">HTTP/1.1 402 Payment Required</div>
              <div className="mt-2">{'{'}</div>
              <div className="ml-4">
                <div className="text-blue-500">"error":</div> "Payment Required",
              </div>
              <div className="ml-4">
                <div className="text-blue-500">"code":</div> "INSUFFICIENT_FUNDS",
              </div>
              <div className="ml-4">
                <div className="text-blue-500">"requiredAmount":</div> 150.00,
              </div>
              <div className="ml-4">
                <div className="text-blue-500">"currentBalance":</div> 89.25,
              </div>
              <div className="ml-4">
                <div className="text-blue-500">"topUpUrl":</div> "/billing/topup?..."
              </div>
              <div>{'}'}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              When an agent attempts an operation requiring more funds than available, 
              the API returns HTTP 402 with details on how to resolve the issue.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Use Cases */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Use Cases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>🤝 AI Agent Marketplaces</CardTitle>
              <CardDescription>
                Agents that buy and sell services from each other, with automatic 
                payment authorization and settlement.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🔌 API Monetization</CardTitle>
              <CardDescription>
                Pay-per-use API access for agents. Track usage, enforce limits, 
                and handle payment requirements transparently.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>💸 Micro-transactions</CardTitle>
              <CardDescription>
                Small automated payments between agents for compute, storage, 
                or data access.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>📊 Resource Billing</CardTitle>
              <CardDescription>
                Usage-based billing for compute resources, storage, and API calls 
                with transparent cost tracking.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
