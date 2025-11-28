import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sampleRecommendation, sampleExperiments } from "@/lib/sample-data";

export default function RecommendationsPage() {
  const recommendation = sampleRecommendation;
  const experiments = sampleExperiments.filter(
    (e) => e.status === "completed" || e.status === "active"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered pricing suggestions based on your experiment data
        </p>
      </div>

      {/* Current Recommendation */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recommended Price Change</CardTitle>
              <CardDescription>
                Based on Homepage Pricing Test experiment
              </CardDescription>
            </div>
            <Badge variant="default">{recommendation.confidence}% Confidence</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Price Comparison */}
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-3xl font-bold">
                    ${recommendation.currentPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-2xl">→</div>
                <div>
                  <div className="text-sm text-muted-foreground">Recommended Price</div>
                  <div className="text-3xl font-bold text-primary">
                    ${recommendation.recommendedPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Expected Impact */}
              <div className="grid gap-4 grid-cols-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Revenue Impact</div>
                  <div className={`text-xl font-bold ${recommendation.expectedImpact.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recommendation.expectedImpact.revenueChange >= 0 ? '+' : ''}
                    {recommendation.expectedImpact.revenueChange.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Conversion Impact</div>
                  <div className={`text-xl font-bold ${recommendation.expectedImpact.conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recommendation.expectedImpact.conversionChange >= 0 ? '+' : ''}
                    {recommendation.expectedImpact.conversionChange.toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Elasticity</div>
                  <div className="text-xl font-bold">
                    {recommendation.expectedImpact.elasticity.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="font-medium mb-3">Why We Recommend This</h4>
              <ul className="space-y-2">
                {recommendation.reasoning.map((reason, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>
            Actions to take based on our analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {recommendation.nextSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Experiments with Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Experiments</CardTitle>
          <CardDescription>
            Select an experiment to get pricing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <div>
                  <div className="font-medium">{experiment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {experiment.variants.length} variants •{" "}
                    {experiment.variants.map((v) => `$${v.price}`).join(", ")}
                  </div>
                </div>
                <Badge
                  variant={
                    experiment.status === "active" ? "default" : "secondary"
                  }
                >
                  {experiment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
