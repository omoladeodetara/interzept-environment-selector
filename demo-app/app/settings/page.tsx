"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [mode, setMode] = useState<"managed" | "byok">("managed");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.paid.ai/v1");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your integration and billing settings
        </p>
      </div>

      {/* Integration Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Mode</CardTitle>
          <CardDescription>
            Choose how you want to connect to the billing provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                mode === "managed"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground"
              }`}
              onClick={() => setMode("managed")}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Managed Mode</h4>
                {mode === "managed" && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                We handle the billing integration. Simple setup with no API key required.
              </p>
              <ul className="mt-3 text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> No setup required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Usage-based billing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Automatic updates
                </li>
              </ul>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                mode === "byok"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground"
              }`}
              onClick={() => setMode("byok")}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">BYOK Mode</h4>
                {mode === "byok" && <Badge variant="default">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Bring Your Own Key. Use your own Paid.ai account for full control.
              </p>
              <ul className="mt-3 text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Full data control
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Direct billing relationship
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Custom configuration
                </li>
              </ul>
            </div>
          </div>

          {mode === "byok" && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">API Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="apiKey">Paid.ai API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk_live_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUrl">API Base URL (optional)</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://api.paid.ai/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Validate Key</Button>
                <Button>Save Configuration</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription and usage information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-2xl font-bold">Starter Plan</div>
                <Badge variant="secondary">$29/month</Badge>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• 10,000 signals/month</li>
                <li>• 5 active experiments</li>
                <li>• Advanced analytics</li>
                <li>• Email support</li>
              </ul>
              <Button className="mt-4" variant="outline">
                Upgrade Plan
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-4">Current Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Signals</span>
                    <span>3,245 / 10,000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "32.45%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>1,567 / 50,000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "3.13%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Active Experiments</span>
                    <span>2 / 5</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Your billing period and charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span>Billing Period</span>
              <span className="font-medium">Nov 1 - Nov 30, 2024</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Base Subscription</span>
              <span className="font-medium">$29.00</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span>Overage Charges</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-2 text-lg">
              <span className="font-medium">Total Due</span>
              <span className="font-bold">$29.00</span>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            View Billing History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
