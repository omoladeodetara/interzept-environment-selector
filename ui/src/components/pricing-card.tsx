"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingCardProps {
  plan: string
  price: number
  features: string[]
  variant: "control" | "experiment"
  onConvert: () => void
  isConverting?: boolean
}

export function PricingCard({ 
  plan, 
  price, 
  features, 
  variant, 
  onConvert, 
  isConverting = false 
}: PricingCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{plan}</CardTitle>
          <Badge variant={variant === "experiment" ? "default" : "secondary"}>
            {variant === "experiment" ? "Variant B" : "Variant A"}
          </Badge>
        </div>
        <CardDescription>
          Perfect for {variant === "experiment" ? "power users" : "getting started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-4xl font-bold">
          ${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
          <span className="text-muted-foreground text-lg font-normal">/month</span>
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={onConvert}
          disabled={isConverting}
        >
          {isConverting ? "Processing..." : "Subscribe Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
