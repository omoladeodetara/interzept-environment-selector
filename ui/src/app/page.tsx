"use client"

import { useState, useEffect } from "react"
import { PricingCard } from "@/components/pricing-card"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data - In production, this would come from the API
const mockExperimentResults = {
  experimentId: "pricing_test_001",
  control: {
    views: 45,
    conversions: 12,
    revenue: "359.88",
    conversionRate: "26.67%",
    arpu: "29.99"
  },
  experiment: {
    views: 48,
    conversions: 15,
    revenue: "599.85",
    conversionRate: "31.25%",
    arpu: "39.99"
  },
  summary: {
    totalViews: 93,
    totalConversions: 27,
    totalRevenue: "959.73",
    conversionRateDiff: "4.58%",
    revenuePerUserDiff: "10.00"
  }
}

export default function Home() {
  const [userId, setUserId] = useState<string>("")
  const [pricingData, setPricingData] = useState<{
    userId: string
    experimentId: string
    variant: "control" | "experiment"
    pricing: {
      plan: string
      price: number
      features: string[]
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [hasConverted, setHasConverted] = useState(false)
  const [view, setView] = useState<"pricing" | "analytics">("pricing")

  // Generate a user ID on mount
  useEffect(() => {
    const id = `user_${Date.now()}`
    setUserId(id)
  }, [])

  const fetchPricing = async () => {
    setIsLoading(true)
    try {
      // In production, this would call: http://localhost:3000/api/pricing
      // For now, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const variant = Math.random() > 0.5 ? "experiment" : "control"
      setPricingData({
        userId,
        experimentId: "pricing_test_001",
        variant,
        pricing: variant === "control" 
          ? {
              plan: "Standard",
              price: 29.99,
              features: [
                "Up to 10,000 API calls/month",
                "Basic analytics dashboard",
                "Email support",
                "99.9% uptime SLA"
              ]
            }
          : {
              plan: "Premium",
              price: 39.99,
              features: [
                "Up to 50,000 API calls/month",
                "Advanced analytics & insights",
                "Priority support (24/7)",
                "99.99% uptime SLA",
                "Custom integrations"
              ]
            }
      })
    } catch (error) {
      console.error("Error fetching pricing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvert = async () => {
    setIsConverting(true)
    try {
      // In production, this would call: http://localhost:3000/api/convert
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasConverted(true)
    } catch (error) {
      console.error("Error converting:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleReset = () => {
    setPricingData(null)
    setHasConverted(false)
    const id = `user_${Date.now()}`
    setUserId(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Last Price A/B Testing
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover your optimal pricing through data-driven experimentation
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "pricing" ? "default" : "outline"}
                onClick={() => setView("pricing")}
              >
                Pricing Test
              </Button>
              <Button
                variant={view === "analytics" ? "default" : "outline"}
                onClick={() => setView("analytics")}
              >
                Analytics
              </Button>
            </div>
          </div>
          
          {userId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">User ID:</span>
              <Badge variant="outline">{userId}</Badge>
            </div>
          )}
        </div>

        {/* Main Content */}
        {view === "pricing" ? (
          <div className="space-y-8">
            {!pricingData && !hasConverted && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome to the A/B Testing Demo</CardTitle>
                  <CardDescription>
                    Click below to see a pricing variant and participate in the experiment
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={fetchPricing}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Show Me Pricing"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {pricingData && !hasConverted && (
              <div className="flex justify-center">
                <PricingCard
                  plan={pricingData.pricing.plan}
                  price={pricingData.pricing.price}
                  features={pricingData.pricing.features}
                  variant={pricingData.variant}
                  onConvert={handleConvert}
                  isConverting={isConverting}
                />
              </div>
            )}

            {hasConverted && pricingData && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">🎉 Thank You for Subscribing!</CardTitle>
                  <CardDescription className="mt-2">
                    Your conversion has been recorded for variant{" "}
                    <Badge variant={pricingData.variant === "experiment" ? "default" : "secondary"}>
                      {pricingData.variant === "experiment" ? "B" : "A"}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Plan:</span> {pricingData.pricing.plan}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Price:</span> ${pricingData.pricing.price}/month
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleReset}>
                      Try Again with New User
                    </Button>
                    <Button variant="outline" onClick={() => setView("analytics")}>
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <AnalyticsDashboard results={mockExperimentResults} />
        )}

        {/* Info Section */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            This demo showcases a production-ready UI component library built with{" "}
            <strong>shadcn/ui</strong> and <strong>Tailwind CSS</strong>
          </p>
          <p className="mt-2">
            Components are fully typed with TypeScript and follow modern React patterns
          </p>
        </div>
      </div>
    </div>
  )
}
