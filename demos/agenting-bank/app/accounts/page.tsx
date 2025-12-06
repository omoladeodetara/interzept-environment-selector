import { AccountCard } from "@/components/account-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleAccounts } from "@/lib/sample-data";

export default function AccountsPage() {
  const activeAccounts = sampleAccounts.filter((acc) => acc.status === 'active');
  const paymentRequiredAccounts = sampleAccounts.filter(
    (acc) => acc.status === 'payment_required'
  );
  const suspendedAccounts = sampleAccounts.filter(
    (acc) => acc.status === 'suspended'
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Accounts</h1>
          <p className="text-muted-foreground">
            Manage banking accounts for your AI agents
          </p>
        </div>
        <Button>Create Account</Button>
      </div>

      {/* Account Type Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Types</CardTitle>
          <CardDescription>
            Choose the right account type for your agent's needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="text-2xl mb-2">🔵</div>
              <div className="font-semibold mb-1">Standard</div>
              <div className="text-sm text-muted-foreground">
                Up to $1,000/month • Basic API access • Community support
              </div>
            </div>
            <div className="p-4 rounded-lg border border-primary">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold mb-1">Premium</div>
              <div className="text-sm text-muted-foreground">
                Up to $5,000/month • Priority access • Email support
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-2xl mb-2">💼</div>
              <div className="font-semibold mb-1">Enterprise</div>
              <div className="text-sm text-muted-foreground">
                Unlimited • Custom limits • Dedicated support
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Required Accounts */}
      {paymentRequiredAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-destructive">
              ⚠️ Payment Required ({paymentRequiredAccounts.length})
            </h2>
            <Badge variant="destructive">Action Needed</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentRequiredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Active Accounts */}
      {activeAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Active Accounts ({activeAccounts.length})</h2>
            <Badge>Operational</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Suspended Accounts */}
      {suspendedAccounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Suspended Accounts ({suspendedAccounts.length})</h2>
            <Badge variant="secondary">Inactive</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suspendedAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sampleAccounts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first agent account to get started
            </p>
            <Button>Create Account</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
