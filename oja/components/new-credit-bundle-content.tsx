"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, ArrowLeft, Check, Info, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

export function NewCreditBundleContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [bundleName, setBundleName] = useState("")
  const [description, setDescription] = useState("")
  const [bundleCode, setBundleCode] = useState("")
  const [currency, setCurrency] = useState("EUR (€)")
  const [price, setPrice] = useState("0.00")
  const [billingFrequency, setBillingFrequency] = useState("Monthly")
  const [credits, setCredits] = useState("")
  const [creditsUnlimited, setCreditsUnlimited] = useState(false)
  const [rolloverCredits, setRolloverCredits] = useState("")
  const [rolloverUnlimited, setRolloverUnlimited] = useState(false)

  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [billingOpen, setBillingOpen] = useState(false)

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions] = useState(["Credit", "Credits", "Credited"])
  const inputRef = useRef<HTMLInputElement>(null)

  const [showActivateModal, setShowActivateModal] = useState(false)

  const currencies = ["EUR (€)", "USD ($)", "GBP (£)"]
  const frequencies = ["Monthly", "Quarterly", "Annually", "One-time"]

  useEffect(() => {
    if (bundleName) {
      const code = bundleName.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 6)
      setBundleCode(code)
    }
  }, [bundleName])

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((s) => s.toLowerCase().startsWith(bundleName.toLowerCase()))

  const handleSave = () => {
    setShowActivateModal(true)
  }

  const handleActivateNow = () => {
    setShowActivateModal(false)
    toast({
      title: "Success",
      description: "Credit bundle created and activated successfully",
    })
    router.push("/credits")
  }

  const handleSaveInactive = () => {
    setShowActivateModal(false)
    toast({
      title: "Success",
      description: "Credit bundle saved as draft",
    })
    router.push("/credits")
  }

  return (
    <TooltipProvider>
      <div className="p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-muted-foreground">Credit bundle</span>
        </div>

        {/* Form */}
        <div className="max-w-2xl space-y-8">
          {/* Credit Bundle Section */}
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <h2 className="text-lg font-semibold">Credit bundle</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2">Bundle name</label>
                <Input
                  ref={inputRef}
                  value={bundleName}
                  onChange={(e) => {
                    setBundleName(e.target.value)
                    setShowSuggestions(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowSuggestions(bundleName.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter bundle name"
                  className="w-full"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 text-white rounded-md shadow-lg z-10 overflow-hidden">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onMouseDown={() => {
                          setBundleName(suggestion)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800 flex items-center gap-2"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this credit bundle"
                  className="w-full min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  Credit bundle code
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 text-white">
                      <p>A unique identifier for this bundle used in API calls and integrations</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  value={bundleCode}
                  onChange={(e) => setBundleCode(e.target.value)}
                  placeholder="e.g. crefite-4b4d"
                  className="w-full font-mono"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Pricing</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setCurrencyOpen(!currencyOpen)}
                      className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm min-w-[120px] justify-between"
                    >
                      <span>{currency}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {currencyOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                        {currencies.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setCurrency(c)
                              setCurrencyOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Billing frequency</label>
                <div className="relative">
                  <button
                    onClick={() => setBillingOpen(!billingOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <span>{billingFrequency}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {billingOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                      {frequencies.map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setBillingFrequency(f)
                            setBillingOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Credits</label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="credits-unlimited"
                      checked={creditsUnlimited}
                      onCheckedChange={(checked) => setCreditsUnlimited(checked as boolean)}
                    />
                    <label htmlFor="credits-unlimited" className="text-sm text-muted-foreground">
                      Unlimited
                    </label>
                  </div>
                </div>
                <Input
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="e.g. 1000"
                  disabled={creditsUnlimited}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium flex items-center gap-1">
                    Rollover credits
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-white">
                        <p>Maximum credits that can roll over to the next billing period</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="rollover-unlimited"
                      checked={rolloverUnlimited}
                      onCheckedChange={(checked) => setRolloverUnlimited(checked as boolean)}
                    />
                    <label htmlFor="rollover-unlimited" className="text-sm text-muted-foreground">
                      Unlimited
                    </label>
                  </div>
                </div>
                <Input
                  value={rolloverCredits}
                  onChange={(e) => setRolloverCredits(e.target.value)}
                  placeholder="e.g. 500"
                  disabled={rolloverUnlimited}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => router.push("/credits")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave} className="bg-zinc-900 hover:bg-zinc-800 text-white">
              Save
              <Check className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <Dialog open={showActivateModal} onOpenChange={setShowActivateModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Activate credit bundle?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Choose whether to activate this bundle immediately or save it as inactive
            </p>

            <div className="space-y-3">
              <button
                onClick={handleActivateNow}
                className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-lg hover:border-foreground transition-colors text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Activate now</div>
                  <div className="text-sm text-muted-foreground">
                    Make this bundle available for purchase immediately
                  </div>
                </div>
              </button>

              <button
                onClick={handleSaveInactive}
                className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:border-foreground transition-colors text-left"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                  <Pause className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Save as inactive</div>
                  <div className="text-sm text-muted-foreground">Save configuration and activate later when ready</div>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
