"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@lastprice/ui";
import { sampleExperiments } from "@/lib/sample-data";
import { apiClient, Experiment } from "@/lib/api-client";

// Use environment variable for tenant ID, fallback to demo value for local development
const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || "989a5aea-aaa8-47cc-8429-d6c5f4174070"; // Demo Company

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<any[]>(sampleExperiments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExperiments() {
      try {
        setLoading(true);
        const data = await apiClient.listExperiments(DEFAULT_TENANT_ID);
        // Map the API response to match the sample data format
        const mapped = data.map((exp: Experiment) => ({
          id: exp.id,
          tenantId: exp.tenant_id,
          key: exp.key,
          name: exp.name,
          description: exp.description,
          status: exp.status,
          variants: exp.variants.map((v, idx) => ({
            id: `v${idx + 1}`,
            name: v.name,
            price: v.price,
            weight: v.weight,
          })),
          startDate: exp.start_date,
          endDate: exp.end_date,
          createdAt: exp.created_at,
        }));
        setExperiments(mapped.length > 0 ? mapped : sampleExperiments);
      } catch (err) {
        console.error("Failed to fetch experiments:", err);
        setError("Failed to load experiments. Showing sample data.");
        setExperiments(sampleExperiments);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiments();
  }, []);

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

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading experiments...
        </div>
      )}

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
                    {experiment.variants.map((variant: { id: string; name: string; price: number; weight: number }) => (
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
