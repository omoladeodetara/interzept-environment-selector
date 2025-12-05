import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AgentAccount } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface AccountCardProps {
  account: AgentAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  const getStatusColor = (status: AgentAccount['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'payment_required':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAccountTypeIcon = (type: AgentAccount['accountType']) => {
    switch (type) {
      case 'standard':
        return '🔵';
      case 'premium':
        return '⭐';
      case 'enterprise':
        return '💼';
      default:
        return '📊';
    }
  };

  const usagePercentage = account.monthlyLimit
    ? (account.usageThisMonth / account.monthlyLimit) * 100
    : 0;

  return (
    <Link href={`/accounts/${account.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getAccountTypeIcon(account.accountType)}</span>
              <div>
                <CardTitle className="text-lg">{account.agentName}</CardTitle>
                <CardDescription className="text-xs">
                  ID: {account.agentId}
                </CardDescription>
              </div>
            </div>
            <Badge variant={getStatusColor(account.status)}>
              {account.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                Current Balance
              </div>
            </div>

            {account.monthlyLimit && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Usage This Month</span>
                  <span>{usagePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercentage > 80
                        ? 'bg-destructive'
                        : usagePercentage > 60
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(account.usageThisMonth)}</span>
                  <span>{formatCurrency(account.monthlyLimit)}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground capitalize">
                {account.accountType} Account
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
