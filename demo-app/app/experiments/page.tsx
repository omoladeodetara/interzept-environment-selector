import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleExperiments } from "@/lib/sample-data";

export default function ExperimentsPage() {
  const experiments = sampleExperiments;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="text-muted-foreground">
            Manage your pricing experiments and A/B tests
          </p>
        </div>
        <Button asChild>
          <Link href="/experiments/new">Create Experiment</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          All
        </Button>
        <Button variant="ghost" size="sm">
          Active
        </Button>
        <Button variant="ghost" size="sm">
          Draft
        </Button>
        <Button variant="ghost" size="sm">
          Completed
        </Button>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{experiment.name}</CardTitle>
                  <CardDescription>{experiment.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
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
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/experiments/${experiment.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Variants */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    {experiment.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="text-sm bg-muted px-3 py-1 rounded-full"
                      >
                        <span className="font-medium">{variant.name}</span>: $
                        {variant.price.toFixed(2)}
                        <span className="text-muted-foreground ml-1">
                          ({variant.weight}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Timeline</h4>
                  <div className="text-sm text-muted-foreground">
                    {experiment.startDate ? (
                      <>
                        Started:{" "}
                        {new Date(experiment.startDate).toLocaleDateString()}
                      </>
                    ) : (
                      "Not started"
                    )}
                    {experiment.endDate && (
                      <>
                        <br />
                        Ended:{" "}
                        {new Date(experiment.endDate).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-end justify-end gap-2">
                  {experiment.status === "draft" && (
                    <Button size="sm">Activate</Button>
                  )}
                  {experiment.status === "active" && (
                    <>
                      <Button size="sm" variant="outline">
                        Pause
                      </Button>
                      <Button size="sm" variant="destructive">
                        Stop
                      </Button>
                    </>
                  )}
                  {experiment.status === "completed" && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/recommendations?experimentId=${experiment.id}`}>
                        Get Recommendations
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
