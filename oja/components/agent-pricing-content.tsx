"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, MoreVertical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PricingOption {
  id: string
  name: string
  enabled: boolean
  types: string[]
  frequency: string
  frequencyOptions: string[]
}

const defaultPricingOptions: PricingOption[] = [
  {
    id: "setup-fee",
    name: "Setup fee",
    enabled: false,
    types: ["FIXED"],
    frequency: "ONE-TIME",
    frequencyOptions: ["ONE-TIME"],
  },
  {
    id: "platform-fee",
    name: "Platform fee",
    enabled: false,
    types: ["FIXED"],
    frequency: "RECURRING",
    frequencyOptions: ["RECURRING", "ONE-TIME"],
  },
  {
    id: "commitment",
    name: "Commitment",
    enabled: false,
    types: ["FIXED"],
    frequency: "RECURRING",
    frequencyOptions: ["RECURRING", "ONE-TIME"],
  },
  {
    id: "seat-based",
    name: "Seat-based",
    enabled: false,
    types: ["VARIABLE"],
    frequency: "RECURRING",
    frequencyOptions: ["RECURRING", "ONE-TIME"],
  },
  {
    id: "activity-based",
    name: "Activity-based",
    enabled: false,
    types: ["USAGE", "VARIABLE"],
    frequency: "RECURRING",
    frequencyOptions: ["RECURRING", "ONE-TIME"],
  },
  {
    id: "outcome-based",
    name: "Outcome-based",
    enabled: false,
    types: ["USAGE", "VARIABLE"],
    frequency: "RECURRING",
    frequencyOptions: ["RECURRING", "ONE-TIME"],
  },
]

export function AgentPricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const agentName = searchParams.get("name") || "SS"
  const agentCode = searchParams.get("code") || ""
  const agentDescription = searchParams.get("description") || ""

  const [isLive, setIsLive] = useState(false)
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(defaultPricingOptions)

  const handleToggle = (id: string) => {
    setPricingOptions(pricingOptions.map((opt) => (opt.id === id ? { ...opt, enabled: !opt.enabled } : opt)))
  }

  const handleFrequencyChange = (id: string, frequency: string) => {
    setPricingOptions(pricingOptions.map((opt) => (opt.id === id ? { ...opt, frequency } : opt)))
  }

  const handleBack = () => {
    const params = new URLSearchParams({
      name: agentName,
      code: agentCode,
      description: agentDescription,
    })
    router.push(`/agents/new/manual/signals?${params.toString()}`)
  }

  const handleSave = () => {
    // Save agent and redirect to agents list
    router.push("/agents")
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - Agent Info */}
      <div className="w-80 border-r border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold">{agentName}</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {agentCode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">CODE:</span>
              <span className="text-sm font-medium text-amber-600">{agentCode}</span>
            </div>
          )}

          {agentDescription && <p className="text-sm text-muted-foreground">{agentDescription}</p>}

          <div className="flex items-center gap-2 pt-2">
            <Switch checked={isLive} onCheckedChange={setIsLive} className="data-[state=checked]:bg-amber-500" />
            <span className="text-sm text-amber-600 font-medium">LIVE</span>
          </div>

          <div className="pt-4">
            <Link href="#" className="text-sm text-foreground hover:underline">
              Signals
            </Link>
          </div>
        </div>
      </div>

      {/* Right Content - Pricing */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-8">Pricing</h2>

          {/* Pricing Options */}
          <div className="space-y-4 mb-8">
            {pricingOptions.map((option) => (
              <div key={option.id} className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={option.enabled}
                    onCheckedChange={() => handleToggle(option.id)}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <span className="font-medium">{option.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {option.types.map((type) => (
                    <span key={type} className="px-3 py-1 text-xs font-medium bg-muted rounded-md">
                      {type}
                    </span>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 h-8 bg-transparent">
                        <span className="text-xs font-medium">{option.frequency}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {option.frequencyOptions.map((freq) => (
                        <DropdownMenuItem key={freq} onClick={() => handleFrequencyChange(option.id, freq)}>
                          {freq}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              <span>BACK :</span>
              <span className="font-semibold">SIGNALS</span>
            </Button>

            <Button onClick={handleSave} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              <span>SAVE</span>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
