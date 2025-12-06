"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Variant {
  name: string;
  price: string;
  weight: string;
}

export default function NewExperimentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { name: "control", price: "29.99", weight: "50" },
    { name: "experiment", price: "39.99", weight: "50" },
  ]);

  const addVariant = () => {
    const newWeight = Math.floor(100 / (variants.length + 1));
    setVariants([
      ...variants.map((v) => ({ ...v, weight: newWeight.toString() })),
      { name: `variant-${variants.length + 1}`, price: "", weight: newWeight.toString() },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return;
    const newVariants = variants.filter((_, i) => i !== index);
    const newWeight = Math.floor(100 / newVariants.length);
    setVariants(newVariants.map((v) => ({ ...v, weight: newWeight.toString() })));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the API
    console.log("Creating experiment:", { name, description, variants });
    router.push("/experiments");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Experiment</h1>
        <p className="text-muted-foreground">
          Set up a new pricing experiment with multiple variants
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Experiment Details</CardTitle>
            <CardDescription>
              Give your experiment a name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Experiment Name</Label>
              <Input
                id="name"
                placeholder="e.g., Homepage Pricing Test"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Testing premium pricing on homepage"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pricing Variants</CardTitle>
                <CardDescription>
                  Add at least 2 variants to compare different price points
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="flex items-end gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Label>Variant Name</Label>
                  <Input
                    placeholder="e.g., control"
                    value={variant.name}
                    onChange={(e) => updateVariant(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.99"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Weight (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={variant.weight}
                    onChange={(e) => updateVariant(index, "weight", e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length <= 2}
                >
                  Remove
                </Button>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Total weight: {variants.reduce((sum, v) => sum + (parseInt(v.weight) || 0), 0)}%
              {variants.reduce((sum, v) => sum + (parseInt(v.weight) || 0), 0) !== 100 && (
                <span className="text-destructive ml-2">(should be 100%)</span>
              )}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Create Experiment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
