import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Top-up</h1>
        <p className="text-muted-foreground">
          Manage account balances and payment methods
        </p>
      </div>

      {/* Top-up Form */}
      <Card>
        <CardHeader>
          <CardTitle>Top-up Account</CardTitle>
          <CardDescription>
            Add funds to your agent account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="account">Select Account</Label>
            <select
              id="account"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
            >
              <option>GPT-4 Research Agent (acc_001)</option>
              <option>Claude Trading Bot (acc_002)</option>
              <option>Data Pipeline Agent (acc_003)</option>
              <option>Crypto Monitor Agent (acc_004)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100.00"
              min="10"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <select
              id="payment-method"
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
            >
              <option>Credit Card (****1234)</option>
              <option>Bank Transfer</option>
              <option>Crypto Wallet</option>
            </select>
          </div>
          <Button className="w-full">Add Funds</Button>
        </CardContent>
      </Card>

      {/* Quick Top-up Amounts */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Top-up</CardTitle>
          <CardDescription>
            Common top-up amounts for fast funding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <Button variant="outline" className="h-20 flex flex-col gap-1">
              <div className="text-2xl font-bold">$50</div>
              <div className="text-xs text-muted-foreground">Standard</div>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-1">
              <div className="text-2xl font-bold">$100</div>
              <div className="text-xs text-muted-foreground">Popular</div>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-1">
              <div className="text-2xl font-bold">$250</div>
              <div className="text-xs text-muted-foreground">Business</div>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-1">
              <div className="text-2xl font-bold">$500</div>
              <div className="text-xs text-muted-foreground">Premium</div>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-1">
              <div className="text-2xl font-bold">$1000</div>
              <div className="text-xs text-muted-foreground">Enterprise</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HTTP 402 Demo */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>HTTP 402 Payment Flow Demo</CardTitle>
          <CardDescription>
            Test the payment required flow when accounts lack sufficient funds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When an agent attempts an operation without sufficient funds, the API 
            returns HTTP 402 with payment details. This demo shows how it works:
          </p>
          <div className="p-4 rounded-lg bg-background space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Simulate Failed Transaction</div>
                <div className="text-sm text-muted-foreground">
                  Try to execute a $150 operation with only $89.25 in account
                </div>
              </div>
              <Button variant="destructive">Execute</Button>
            </div>
            <div className="border-t pt-3">
              <div className="text-xs font-mono text-muted-foreground mb-2">
                Expected Response:
              </div>
              <div className="bg-background p-3 rounded font-mono text-xs">
                <div className="text-red-500">HTTP/1.1 402 Payment Required</div>
                <div className="mt-2">{'{'}</div>
                <div className="ml-2">"error": "Payment Required",</div>
                <div className="ml-2">"code": "INSUFFICIENT_FUNDS",</div>
                <div className="ml-2">"message": "Insufficient funds...",</div>
                <div className="ml-2">"requiredAmount": 150.00,</div>
                <div className="ml-2">"currentBalance": 89.25,</div>
                <div className="ml-2">"topUpUrl": "/billing/topup?..."</div>
                <div>{'}'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent top-ups and charges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Account Top-up</div>
                <div className="text-sm text-muted-foreground">
                  Dec 4, 2024 at 2:20 PM
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+$500.00</div>
                <Badge>Completed</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Account Top-up</div>
                <div className="text-sm text-muted-foreground">
                  Dec 3, 2024 at 4:30 PM
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+$100.00</div>
                <Badge>Completed</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-medium">Auto Top-up</div>
                <div className="text-sm text-muted-foreground">
                  Dec 1, 2024 at 9:00 AM
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">+$250.00</div>
                <Badge>Completed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Top-up Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto Top-up</CardTitle>
          <CardDescription>
            Automatically add funds when balance falls below threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Auto Top-up</div>
              <div className="text-sm text-muted-foreground">
                Automatically fund accounts when they run low
              </div>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trigger threshold:</span>
              <span className="font-medium">$50.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Top-up amount:</span>
              <span className="font-medium">$200.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">Disabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
