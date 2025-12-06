import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleDashboard, sampleExperiments } from "@/lib/sample-data";

export default function Home() {
  const dashboard = sampleDashboard;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Last Price Demo: Pricing Experiment Showcase
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          An example application demonstrating Last Price integration for A/B testing, 
          AI-powered recommendations, and flexible BYOK or Managed mode.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/experiments/new">Create Experiment</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/experiments">View All Experiments</Link>
          </Button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Experiments</CardDescription>
            <CardTitle className="text-4xl">{dashboard.activeExperiments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Experiments</CardDescription>
            <CardTitle className="text-4xl">{dashboard.completedExperiments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-4xl">
              ${dashboard.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Conversion Rate</CardDescription>
            <CardTitle className="text-4xl">{dashboard.avgConversionRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </section>

      {/* Recent Experiments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Experiments</h2>
          <Button asChild variant="ghost">
            <Link href="/experiments">View All →</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleExperiments.map((experiment) => (
            <Card key={experiment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{experiment.name}</CardTitle>
                  <Badge
                    variant={
                      experiment.status === "active"
                        ? "default"
                        : experiment.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {experiment.status}
                  </Badge>
                </div>
                <CardDescription>{experiment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {experiment.variants.length} variants
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiment.variants.map((variant) => (
                      <span
                        key={variant.id}
                        className="text-xs bg-muted px-2 py-1 rounded"
                      >
                        {variant.name}: ${variant.price}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/experiments/${experiment.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>🔬 A/B Testing</CardTitle>
              <CardDescription>
                Create and manage pricing experiments with multiple variants. 
                Consistent user assignment ensures accurate results.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Recommendations</CardTitle>
              <CardDescription>
                Get data-driven pricing recommendations based on elasticity 
                analysis and your business objectives.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🔐 Hybrid Mode</CardTitle>
              <CardDescription>
                Choose between BYOK (Bring Your Own Key) for full control 
                or Managed mode for simplicity.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
