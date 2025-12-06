"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Plus, MoreVertical, Trash2, Sparkles, Info, Loader2, Check } from "lucide-react"
import { Button } from '@lastprice/ui'
import { Switch } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@lastprice/ui'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { Textarea } from '@lastprice/ui'

interface Signal {
  id: string
  name: string
  value: string
  type: "ACTIVITY" | "OUTCOME"
}

interface EstimationResult {
  country: string
  confidence: "Low confidence" | "Medium confidence" | "High confidence"
  timeEstimate: string
  expertiseLevel: string
  hourlyWageRange: string
  costEstimate: string
  notes: string
}

const estimationSteps = [
  "Reviewing your task detail",
  "Factoring in time and difficulty",
  "Calculating costs across locations",
]

const mockEstimationResults: EstimationResult[] = [
  {
    country: "United States",
    confidence: "Low confidence",
    timeEstimate: "10 - 20 minutes",
    expertiseLevel: "Entry Level",
    hourlyWageRange: "EUR 13.00 - 18.00",
    costEstimate: "EUR 2.71 - 7.49",
    notes:
      'Interpreted taskDescription "WW" as a very simple, low-volume administrative task (e.g., quick data entry or a brief check) requiring entry-level skills. Time estimated at 10–20 minutes. Used approximate US entry-level rates converted conceptually to EUR, then added ~25% overhead for management and platform costs. Results expressed in euro cents as requested outputCurrency=EUR.',
  },
  {
    country: "Afghanistan",
    confidence: "Low confidence",
    timeEstimate: "10 - 20 minutes",
    expertiseLevel: "Entry Level",
    hourlyWageRange: "EUR 2.50 - 4.50",
    costEstimate: "EUR 0.52 - 1.87",
    notes:
      'Interpreted country code "AF" as Afghanistan and assumed South-Asia-like wage levels (approx. 0.2–0.3x US entry-level) for a simple administrative task. TaskDescription "WW" treated as a small, 10–20 minute, entry-level task. Applied ~25% overhead for management/platform costs. All amounts shown in euro cents per your outputCurrency=EUR. Estimates are highly approximate due to vague task description and country code ambiguity.',
  },
]

export function AgentSignalsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const agentName = searchParams.get("name") || "QQ"
  const agentCode = searchParams.get("code") || "RRER"
  const agentDescription = searchParams.get("description") || "QWE"

  const [isLive, setIsLive] = useState(false)
  const [signals, setSignals] = useState<Signal[]>([])

  const [isEstimationOpen, setIsEstimationOpen] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [estimationResults, setEstimationResults] = useState<EstimationResult[]>([])

  const [taskDescription, setTaskDescription] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "UK"])
  const [currency, setCurrency] = useState("EUR")
  const [hourlyWage, setHourlyWage] = useState("0,00")
  const [complexity, setComplexity] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("0")

  useEffect(() => {
    const signalsParam = searchParams.get("signals")
    if (signalsParam) {
      try {
        const parsedSignals = JSON.parse(signalsParam)
        const mappedSignals: Signal[] = parsedSignals.map(
          (s: { id: string; title: string; category: string; hve: number }) => ({
            id: s.id,
            name: s.title,
            value: `€${s.hve.toFixed(2)}`,
            type: s.category.toUpperCase() as "ACTIVITY" | "OUTCOME",
          }),
        )
        setSignals(mappedSignals)
      } catch (e) {
        console.error("Failed to parse signals:", e)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (isEstimating && currentStep < estimationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isEstimating && currentStep === estimationSteps.length - 1) {
      const timer = setTimeout(() => {
        setIsEstimating(false)
        setCurrentStep(0)
        setEstimationResults(mockEstimationResults)
        setShowResults(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isEstimating, currentStep])

  const handleAddSignal = () => {
    setSignals([
      ...signals,
      {
        id: crypto.randomUUID(),
        name: "",
        value: "€0.00",
        type: "ACTIVITY",
      },
    ])
  }

  const handleUpdateSignal = (id: string, field: keyof Signal, value: string) => {
    setSignals(signals.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleDeleteSignal = (id: string) => {
    setSignals(signals.filter((s) => s.id !== id))
  }

  const handleOpenEstimation = (signalId: string) => {
    setSelectedSignalId(signalId)
    setShowResults(false)
    setIsEstimationOpen(true)
  }

  const handleSubmitEstimation = () => {
    setIsEstimating(true)
    setCurrentStep(0)
  }

  const handleAcceptEstimation = (result: EstimationResult) => {
    if (selectedSignalId) {
      const costParts = result.costEstimate.replace("EUR ", "").split(" - ")
      const avgCost = (Number.parseFloat(costParts[0]) + Number.parseFloat(costParts[1])) / 2
      handleUpdateSignal(selectedSignalId, "value", `€${avgCost.toFixed(2)}`)
    }
    setIsEstimationOpen(false)
    setShowResults(false)
  }

  const handleBack = () => {
    router.push("/agents/new/manual")
  }

  const handleNext = () => {
    const params = new URLSearchParams({
      name: agentName,
      code: agentCode,
      description: agentDescription,
      signals: JSON.stringify(signals),
    })
    router.push(`/agents/new/manual/pricing?${params.toString()}`)
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-80 border-r border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-semibold">{agentName}</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">CODE:</span>
            <span className="text-sm font-medium text-amber-600">{agentCode}</span>
          </div>

          <p className="text-sm text-muted-foreground">{agentDescription}</p>

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

      <div className="flex-1 p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-2">Signals</h2>
          <p className="text-muted-foreground mb-8">
            Signals are how your agent creates value. You can edit signals later, adding costs and additional details.
          </p>

          {signals.length === 0 ? (
            <div className="border border-border rounded-lg p-12 mb-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-base font-medium mb-2">No signals yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Signals are how your agent creates value.
                  <br />
                  You can edit signals later, adding costs and additional details.
                </p>
                <Button variant="outline" className="gap-2 bg-transparent" onClick={handleAddSignal}>
                  <Plus className="h-4 w-4" />
                  ADD SIGNALS
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 px-1">
                <div className="w-64">
                  <span className="text-sm text-muted-foreground">Signal</span>
                </div>
                <div className="w-32 flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Human value</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The equivalent monetary value for humans</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Type</span>
                </div>
              </div>

              <div className="space-y-3">
                {signals.map((signal) => (
                  <div key={signal.id} className="flex items-center gap-4">
                    <Input
                      placeholder="Enter signal name"
                      value={signal.name}
                      onChange={(e) => handleUpdateSignal(signal.id, "name", e.target.value)}
                      className="w-64 bg-muted/50 border-0"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        value={signal.value}
                        onChange={(e) => handleUpdateSignal(signal.id, "value", e.target.value)}
                        className="w-24 bg-muted/50 border-0 text-center"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEstimation(signal.id)}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-md">
                      <Button
                        variant={signal.type === "ACTIVITY" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 px-3 text-xs font-medium rounded-r-none"
                        onClick={() => handleUpdateSignal(signal.id, "type", "ACTIVITY")}
                      >
                        ACTIVITY
                      </Button>
                      <Button
                        variant={signal.type === "OUTCOME" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 px-3 text-xs font-medium rounded-l-none"
                        onClick={() => handleUpdateSignal(signal.id, "type", "OUTCOME")}
                      >
                        OUTCOME
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteSignal(signal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="gap-2 bg-transparent mt-4" onClick={handleAddSignal}>
                <Plus className="h-4 w-4" />
                ADD
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              <span>BACK :</span>
              <span className="font-semibold">AGENT</span>
            </Button>

            <Button onClick={handleNext} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
              <span>NEXT :</span>
              <span className="font-semibold">PRICING</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={isEstimationOpen} onOpenChange={setIsEstimationOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] p-0 overflow-y-auto">
          {isEstimating ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <h3 className="text-xl font-semibold mb-2">Working on your estimate...</h3>
              <p className="text-sm text-muted-foreground text-center mb-8">
                We&apos;re using your inputs to calculate task cost based on time, location, and complexity.
              </p>
              <div className="space-y-4 w-full max-w-xs">
                {estimationSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    {index < currentStep ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : index === currentStep ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className={`text-sm ${index <= currentStep ? "text-amber-600" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : showResults ? (
            <div className="p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-semibold">Task estimation</SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                {estimationResults.map((result, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">{result.country}</h4>
                      <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                        {result.confidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Time estimate</p>
                        <p className="text-sm font-medium">{result.timeEstimate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Expertise level</p>
                        <p className="text-sm font-medium">{result.expertiseLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Hourly wage range</p>
                        <p className="text-sm font-medium">{result.hourlyWageRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cost estimate</p>
                        <p className="text-sm font-medium">{result.costEstimate}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.notes}</p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleAcceptEstimation(result)}
                        className="bg-foreground text-background hover:bg-foreground/90"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-semibold">Task estimation</SheetTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill out the form to estimate task costs across different countries.
                </p>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task-description">Task description</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Describe the task..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="min-h-[80px] bg-muted/30 border-border"
                  />
                  <p className="text-xs text-muted-foreground">A brief description of the task to be estimated.</p>
                </div>

                <div className="space-y-2">
                  <Label>Countries</Label>
                  <Select defaultValue="2">
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder="Select countries">
                        {selectedCountries.length} countries selected
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 countries selected</SelectItem>
                      <SelectItem value="5">5 countries selected</SelectItem>
                      <SelectItem value="10">10 countries selected</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    List of countries for cost estimation. Defaults to a predefined set if not provided.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Hourly wage</Label>
                  <p className="text-xs text-muted-foreground mb-2">Optional estimated hourly wage details.</p>
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-muted/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input
                        value={`€ ${hourlyWage}`}
                        onChange={(e) => setHourlyWage(e.target.value.replace("€ ", ""))}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Task complexity</Label>
                  <Select value={complexity} onValueChange={setComplexity}>
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder="Select complexity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Optional complexity level of the task.</p>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Time (minutes)</Label>
                  <Input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional estimated time to complete the task in minutes.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleSubmitEstimation}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
