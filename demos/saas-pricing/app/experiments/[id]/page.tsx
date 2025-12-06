import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@lastprice/ui";
import { sampleExperiments, sampleExperimentResults } from "@/lib/sample-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExperimentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const experiment = sampleExperiments.find((e) => e.id === id);
  const results = sampleExperimentResults[id];

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Experiment not found</h1>
        <Button asChild className="mt-4">
          <Link href="/experiments">Back to Experiments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{experiment.name}</h1>
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
          <p className="text-muted-foreground">{experiment.description}</p>
        </div>
        <div className="flex gap-2">
          {experiment.status === "draft" && (
            <Button>Activate</Button>
          )}
          {experiment.status === "active" && (
            <>
              <Button variant="outline">Pause</Button>
              <Button variant="destructive">Stop</Button>
            </>
          )}
          {(experiment.status === "completed" || experiment.status === "active") && (
            <Button asChild variant="outline">
              <Link href={`/recommendations?experimentId=${id}`}>
                Get Recommendations
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Pricing variants being tested in this experiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {experiment.variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{variant.name}</span>
                  <Badge variant="outline">{variant.weight}%</Badge>
                </div>
                <div className="text-2xl font-bold">
                  ${variant.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results (if available) */}
      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Results Summary</CardTitle>
              <CardDescription>
                Overall performance across all variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                  <div className="text-2xl font-bold">
                    {results.summary.totalViews.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Conversions</div>
                  <div className="text-2xl font-bold">
                    {results.summary.totalConversions.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold">
                    ${results.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statistical Significance</div>
                  <div className="text-2xl font-bold">
                    {results.statisticalSignificance 
                      ? `${(results.statisticalSignificance * 100).toFixed(0)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variant Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each variant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Variant</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">Views</th>
                      <th className="text-right py-3 px-4">Conversions</th>
                      <th className="text-right py-3 px-4">Conv. Rate</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Rev/View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(results.variants).map((variant) => (
                      <tr key={variant.variantId} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {variant.variantName}
                            {variant.variantId === results.summary.winningVariant && (
                              <Badge variant="default">Winner</Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          ${variant.price.toFixed(2)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {variant.views.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {variant.conversions.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {(variant.conversionRate * 100).toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          ${variant.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-right py-3 px-4">
                          ${variant.revenuePerView.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {new Date(experiment.createdAt).toLocaleString()}
            </div>
            {experiment.startDate && (
              <div>
                <span className="text-muted-foreground">Started:</span>{" "}
                {new Date(experiment.startDate).toLocaleString()}
              </div>
            )}
            {experiment.endDate && (
              <div>
                <span className="text-muted-foreground">Ended:</span>{" "}
                {new Date(experiment.endDate).toLocaleString()}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Last Updated:</span>{" "}
              {new Date(experiment.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
