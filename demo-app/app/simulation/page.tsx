"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";

// Coffee shop agent simulation
// This demonstrates an agent-run business that uses dynamic pricing

const DEFAULT_TENANT_ID = "989a5aea-aaa8-47cc-8429-d6c5f4174070";
const EXPERIMENT_KEY = "premium_pricing_test";

interface SimulationState {
  orderCount: number;
  conversionCount: number;
  totalRevenue: number;
  currentPrice: number;
  currentVariant: string;
  isSimulating: boolean;
}

export default function SimulationPage() {
  const [state, setState] = useState<SimulationState>({
    orderCount: 0,
    conversionCount: 0,
    totalRevenue: 0,
    currentPrice: 0,
    currentVariant: "",
    isSimulating: false,
  });
  
  const [log, setLog] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Generate a random user ID for this session
    setUserId(`agent_${Math.random().toString(36).substring(2, 15)}`);
  }, []);

  const addLog = (message: string) => {
    setLog((prev) => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const fetchPricing = async () => {
    try {
      addLog("☕ Agent requesting coffee price from Elo...");
      const response = await apiClient.getPricing(EXPERIMENT_KEY, userId, DEFAULT_TENANT_ID);
      
      setState((prev) => ({
        ...prev,
        currentPrice: response.pricing.price,
        currentVariant: response.variant,
      }));
      
      addLog(`💰 Received pricing: $${response.pricing.price} (variant: ${response.variant})`);
      return response;
    } catch (error) {
      addLog(`❌ Error fetching pricing: ${error}`);
      throw error;
    }
  };

  const simulateOrder = async () => {
    try {
      // Fetch pricing
      const pricing = await fetchPricing();
      
      setState((prev) => ({ ...prev, orderCount: prev.orderCount + 1 }));
      
      // Simulate customer decision (price sensitivity)
      // Lower price = higher conversion probability
      const conversionProbability = pricing.pricing.price < 35 ? 0.7 : 0.5;
      const converted = Math.random() < conversionProbability;
      
      if (converted) {
        addLog(`✅ Customer purchased coffee for $${pricing.pricing.price}`);
        
        // Record conversion
        await apiClient.recordConversion(EXPERIMENT_KEY, {
          userId,
          tenantId: DEFAULT_TENANT_ID,
          revenue: pricing.pricing.price,
        });
        
        setState((prev) => ({
          ...prev,
          conversionCount: prev.conversionCount + 1,
          totalRevenue: prev.totalRevenue + pricing.pricing.price,
        }));
        
        addLog(`📊 Conversion recorded with Elo`);
      } else {
        addLog(`❌ Customer declined (price too high: $${pricing.pricing.price})`);
      }
    } catch (error) {
      addLog(`❌ Simulation error: ${error}`);
    }
  };

  const startAutoSimulation = () => {
    setState((prev) => ({ ...prev, isSimulating: true }));
    addLog("🚀 Starting automatic simulation...");
    
    const interval = setInterval(async () => {
      await simulateOrder();
    }, 3000); // Order every 3 seconds

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setState((prev) => ({ ...prev, isSimulating: false }));
      addLog("⏹️ Automatic simulation stopped");
    }, 30000);
  };

  const conversionRate = state.orderCount > 0 
    ? ((state.conversionCount / state.orderCount) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Business Simulation</h1>
        <p className="text-muted-foreground">
          Simulate an AI agent-run coffee shop using dynamic pricing from Elo
        </p>
      </div>

      {/* Simulation Description */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>☕ AI Coffee Shop Agent</CardTitle>
          <CardDescription>
            This simulates an autonomous AI agent running a coffee business. The agent:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Requests pricing from Elo (A/B Testing Server) for each customer</li>
            <li>Simulates customer purchasing decisions based on price sensitivity</li>
            <li>Records conversions back to Elo for experiment tracking</li>
            <li>Demonstrates both BYOK and Managed mode integration</li>
          </ul>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-4xl">{state.orderCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversions</CardDescription>
            <CardTitle className="text-4xl">{state.conversionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-4xl">{conversionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-4xl">
              ${state.totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Current Pricing */}
      {state.currentPrice > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">${state.currentPrice}</div>
              <Badge>{state.currentVariant}</Badge>
              <span className="text-sm text-muted-foreground">
                for premium coffee
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Controls</CardTitle>
          <CardDescription>
            Run the agent simulation manually or automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={simulateOrder} 
              disabled={state.isSimulating}
              size="lg"
            >
              Simulate Single Order
            </Button>
            <Button 
              onClick={startAutoSimulation} 
              disabled={state.isSimulating}
              variant="outline"
              size="lg"
            >
              {state.isSimulating ? "Simulation Running..." : "Start Auto Simulation (30s)"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            User ID: <code className="bg-muted px-2 py-1 rounded">{userId}</code>
          </p>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Real-time simulation events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-64 overflow-y-auto">
            {log.length === 0 ? (
              <div className="text-muted-foreground">No activity yet. Start a simulation to see events...</div>
            ) : (
              log.map((entry, idx) => (
                <div key={idx}>{entry}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              <span>Agent requests pricing → <strong>GET /api/experiments/:id/pricing</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              <span>Elo assigns variant deterministically and records view</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              <span>Elo emits view signal to Paid.ai (using tenant API key if BYOK)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              <span>Agent displays price to customer</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">5</Badge>
              <span>If customer converts → <strong>POST /api/experiments/:id/convert</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">6</Badge>
              <span>Elo records conversion and emits signal to Paid.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">7</Badge>
              <span>Owner calls <strong>POST /api/jale/optimize</strong> for recommendations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
