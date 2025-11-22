"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react"

interface VariantData {
  views: number
  conversions: number
  revenue: string
  conversionRate: string
  arpu: string
}

interface ExperimentResults {
  experimentId: string
  control: VariantData
  experiment: VariantData
  summary: {
    totalViews: number
    totalConversions: number
    totalRevenue: string
    conversionRateDiff: string
    revenuePerUserDiff: string
  }
}

interface AnalyticsDashboardProps {
  results: ExperimentResults
}

export function AnalyticsDashboard({ results }: AnalyticsDashboardProps) {
  const controlRate = parseFloat(results.control.conversionRate)
  const experimentRate = parseFloat(results.experiment.conversionRate)
  const isExperimentWinning =
    !isNaN(controlRate) &&
    !isNaN(experimentRate) &&
    experimentRate > controlRate

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Experiment Results</h2>
        <p className="text-muted-foreground mt-2">
          Experiment ID: <code className="text-sm bg-muted px-2 py-1 rounded">{results.experimentId}</code>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.summary.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.summary.totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${results.summary.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.summary.conversionRateDiff}</div>
          </CardContent>
        </Card>
      </div>

      {/* Variant Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Control (Variant A)</CardTitle>
              <Badge variant="secondary">Standard</Badge>
            </div>
            <CardDescription>Baseline pricing variant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-2xl font-bold">{results.control.views}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{results.control.conversions}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-semibold">{results.control.conversionRate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-semibold">${results.control.revenue}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ARPU</p>
              <p className="text-xl font-semibold">${results.control.arpu}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={isExperimentWinning ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Experiment (Variant B)</CardTitle>
              <Badge variant={isExperimentWinning ? "default" : "secondary"}>
                {isExperimentWinning ? "Winner 🏆" : "Premium"}
              </Badge>
            </div>
            <CardDescription>Alternative pricing variant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-2xl font-bold">{results.experiment.views}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{results.experiment.conversions}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-semibold">{results.experiment.conversionRate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-xl font-semibold">${results.experiment.revenue}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ARPU</p>
              <p className="text-xl font-semibold">${results.experiment.arpu}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
