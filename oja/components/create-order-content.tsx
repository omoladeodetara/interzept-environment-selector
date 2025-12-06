"use client"

import { useState } from "react"
import { Button } from '@lastprice/ui'
import { Switch } from '@lastprice/ui'
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronRight,
  Plus,
  ClipboardList,
  Search,
  Check,
  Info,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from '@lastprice/ui'
import { Calendar as CalendarComponent } from '@lastprice/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@lastprice/ui'
import { RadioGroup, RadioGroupItem } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import Link from "next/link"
import { format } from "date-fns"

interface OrderLine {
  id: string
  name: string
  type: string
  description: string
  useParentDates: boolean
  startDate: Date
  endDate: Date | null
  pricing: Array<{
    name: string
    type: string
    frequency: string
    price: string
  }>
}

interface PricingType {
  id: string
  name: string
  enabled: boolean
  expanded: boolean
  badges: string[]
  events: Array<{
    id: string
    name: string
    enabled: boolean
    hve: string
    billingType: string
    price: string
    frequency: string
    minCommitment: string
    includedUsage: string
  }>
}

const steps = [
  { id: 1, name: "Customer" },
  { id: 2, name: "Order details" },
  { id: 3, name: "Lines" },
]

export function CreateOrderContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [orderName, setOrderName] = useState("")
  const [orderDescription, setOrderDescription] = useState("")

  // Step 2: Order details
  const [billingDay, setBillingDay] = useState("6")
  const [orderStartDate, setOrderStartDate] = useState<Date>(new Date())
  const [noEndDate, setNoEndDate] = useState(true)
  const [showStartCalendar, setShowStartCalendar] = useState(false)

  const [showAddLineDropdown, setShowAddLineDropdown] = useState(false)
  const [lineSearchQuery, setLineSearchQuery] = useState("")
  const [showAddCreditBundleModal, setShowAddCreditBundleModal] = useState(false)
  const [bundleName, setBundleName] = useState("")
  const [bundleDescription, setBundleDescription] = useState("")
  const [bundleCode, setBundleCode] = useState("")
  const [orderLines, setOrderLines] = useState<OrderLine[]>([])
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set())

  const [showPricingModal, setShowPricingModal] = useState(false)
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [pricingTypes, setPricingTypes] = useState<PricingType[]>([
    {
      id: "setup-fee",
      name: "Setup fee",
      enabled: false,
      expanded: false,
      badges: ["FIXED", "ONE-TIME"],
      events: [],
    },
    {
      id: "platform-fee",
      name: "Platform fee",
      enabled: false,
      expanded: false,
      badges: ["FIXED", "RECURRING"],
      events: [],
    },
    {
      id: "commitment",
      name: "Commitment",
      enabled: false,
      expanded: false,
      badges: ["FIXED", "RECURRING"],
      events: [],
    },
    {
      id: "seat-based",
      name: "Seat-based",
      enabled: false,
      expanded: false,
      badges: ["VARIABLE", "RECURRING"],
      events: [],
    },
    {
      id: "activity-based",
      name: "Activity-based",
      enabled: true,
      expanded: true,
      badges: ["USAGE", "VARIABLE", "RECURRING"],
      events: [
        {
          id: "using_chat_prompt",
          name: "using_chat_prompt",
          enabled: true,
          hve: "10,00 €",
          billingType: "PerUnit",
          price: "€0.00",
          frequency: "Monthly",
          minCommitment: "0",
          includedUsage: "0",
        },
      ],
    },
    {
      id: "outcome-based",
      name: "Outcome-based",
      enabled: false,
      expanded: false,
      badges: ["USAGE", "VARIABLE", "RECURRING"],
      events: [],
    },
  ])

  // Generated order ID
  const orderId = `e6d98641-e854-4aa8-9026-623fcdc4ef54`

  const canProceedStep1 = selectedCustomer !== ""

  const products = [
    {
      id: "1",
      name: "ai-sdk-chatbot",
      code: "ai-assistant-v1",
      pricing: [{ name: "using_chat_prompt", type: "Activity", frequency: "Monthly", price: "0,00 €" }],
    },
  ]

  const handleCreateOrder = () => {
    toast({
      title: "Order created",
      description: "The order has been created successfully.",
    })
    router.push("/orders")
  }

  const handleAddCreditBundle = () => {
    if (bundleName) {
      const newLine: OrderLine = {
        id: crypto.randomUUID(),
        name: bundleName,
        type: "credit-bundle",
        description: "",
        useParentDates: true,
        startDate: orderStartDate,
        endDate: null,
        pricing: [],
      }
      setOrderLines([...orderLines, newLine])
      setExpandedLines(new Set([...expandedLines, newLine.id]))
      toast({
        title: "Credit bundle added",
        description: "The credit bundle has been added to the order.",
      })
    }
    setShowAddCreditBundleModal(false)
    setShowAddLineDropdown(false)
    setBundleName("")
    setBundleDescription("")
    setBundleCode("")
  }

  const handleAddProduct = (product: (typeof products)[0]) => {
    const newLine: OrderLine = {
      id: crypto.randomUUID(),
      name: product.name,
      type: "product",
      description: "",
      useParentDates: true,
      startDate: orderStartDate,
      endDate: null,
      pricing: product.pricing,
    }
    setOrderLines([...orderLines, newLine])
    setExpandedLines(new Set([...expandedLines, newLine.id]))
    setShowAddLineDropdown(false)
    setLineSearchQuery("")
  }

  const toggleLineExpanded = (lineId: string) => {
    const newExpanded = new Set(expandedLines)
    if (newExpanded.has(lineId)) {
      newExpanded.delete(lineId)
    } else {
      newExpanded.add(lineId)
    }
    setExpandedLines(newExpanded)
  }

  const removeLine = (lineId: string) => {
    setOrderLines(orderLines.filter((l) => l.id !== lineId))
    const newExpanded = new Set(expandedLines)
    newExpanded.delete(lineId)
    setExpandedLines(newExpanded)
  }

  const updateLine = (lineId: string, updates: Partial<OrderLine>) => {
    setOrderLines(orderLines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)))
  }

  const openPricingModal = (lineId: string) => {
    setEditingLineId(lineId)
    setShowPricingModal(true)
  }

  const togglePricingType = (id: string) => {
    setPricingTypes(
      pricingTypes.map((pt) =>
        pt.id === id ? { ...pt, enabled: !pt.enabled, expanded: !pt.enabled ? true : pt.expanded } : pt,
      ),
    )
  }

  const togglePricingTypeExpanded = (id: string) => {
    setPricingTypes(pricingTypes.map((pt) => (pt.id === id ? { ...pt, expanded: !pt.expanded } : pt)))
  }

  const updatePricingEvent = (typeId: string, eventId: string, updates: Partial<PricingType["events"][0]>) => {
    setPricingTypes(
      pricingTypes.map((pt) =>
        pt.id === typeId
          ? {
              ...pt,
              events: pt.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
            }
          : pt,
      ),
    )
  }

  const handleSavePricing = () => {
    if (editingLineId) {
      // Build pricing from enabled types
      const newPricing: OrderLine["pricing"] = []
      pricingTypes.forEach((pt) => {
        if (pt.enabled) {
          pt.events.forEach((e) => {
            if (e.enabled) {
              newPricing.push({
                name: e.name,
                type: pt.name.replace("-based", ""),
                frequency: e.frequency,
                price: e.price,
              })
            }
          })
        }
      })
      updateLine(editingLineId, { pricing: newPricing })
    }
    setShowPricingModal(false)
    setEditingLineId(null)
  }

  return (
    <div className="flex-1 flex min-h-screen">
      {/* Left Sidebar - Only show on step 2+ */}
      {currentStep >= 2 && (
        <div className="w-[400px] border-r border-border p-8">
          <p className="text-sm text-muted-foreground mb-1">New order for</p>
          <h2 className="text-2xl font-semibold mb-4">
            {selectedCustomer === "onboarding-test" ? "Onboarding Test Customer" : selectedCustomer}
          </h2>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-mono mb-1">ORDER ID:</p>
            <p className="text-sm font-mono text-muted-foreground">{orderId}</p>
          </div>

          {orderName && <p className="text-base font-medium mb-6">{orderName}</p>}

          {currentStep === 3 && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order start</span>
                <span>{format(orderStartDate, "M/d/yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order end</span>
                <span>{noEndDate ? "Forever" : "Set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billed to</span>
                <span>-</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Cancel button - top right */}
        {currentStep >= 2 && (
          <div className="flex justify-end mb-8">
            <Button variant="ghost" onClick={() => router.push("/orders")}>
              Cancel
            </Button>
          </div>
        )}

        {/* Form Content */}
        <div className={`${currentStep === 1 ? "max-w-md mx-auto pt-24" : "max-w-2xl"}`}>
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Select a customer...</option>
                  <option value="onboarding-test">Onboarding Test Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Order name</label>
                <input
                  type="text"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  placeholder="Add a name"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Order description</label>
                <textarea
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  placeholder="Optional"
                  rows={3}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
                />
              </div>

              <Button className="w-full" disabled={!canProceedStep1} onClick={() => setCurrentStep(2)}>
                NEXT: ORDER DETAILS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Order Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Order details</h2>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Billing day</label>
                <div className="flex items-center border border-border rounded-md px-3 py-2.5 cursor-pointer hover:bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                  <span className="text-sm flex-1">Day {billingDay}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Order start date</label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center border border-border rounded-md px-3 py-2.5 cursor-pointer hover:bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                      <span className="text-sm flex-1 text-left">{format(orderStartDate, "MMMM do, yyyy")}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={orderStartDate}
                      onSelect={(date) => {
                        if (date) setOrderStartDate(date)
                        setShowStartCalendar(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={noEndDate} onCheckedChange={setNoEndDate} />
                <span className="text-sm">Order has no end date</span>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Billing address</label>
                <div className="border border-border rounded-md p-4">
                  <div className="flex gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p>123 Business Ave</p>
                      <p>Suite 100</p>
                      <p>San Francisco, CA 94105</p>
                      <p>USA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="bg-transparent" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  BACK
                </Button>
                <Button className="flex-1 ml-auto" onClick={() => setCurrentStep(3)}>
                  NEXT: LINES
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Lines */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Lines</h2>

              {/* Empty state for lines */}
              {orderLines.length === 0 ? (
                <div className="border border-border rounded-lg p-12 flex flex-col items-center justify-center bg-muted/30">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                    <ClipboardList className="h-5 w-5 text-violet-600" />
                  </div>
                  <p className="font-medium mb-1">There are no line items associated with this order</p>
                  <button
                    className="text-sm text-amber-700 hover:underline"
                    onClick={() => setShowAddLineDropdown(true)}
                  >
                    Add the first line item
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderLines.map((line) => {
                    const isExpanded = expandedLines.has(line.id)
                    return (
                      <div key={line.id} className="border border-border rounded-lg overflow-hidden">
                        {/* Line Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <button
                            className="text-sm font-medium underline hover:no-underline"
                            onClick={() => toggleLineExpanded(line.id)}
                          >
                            {line.name}
                          </button>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-muted rounded" onClick={() => removeLine(line.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-1 hover:bg-muted rounded" onClick={() => toggleLineExpanded(line.id)}>
                              <ChevronUp
                                className={`h-4 w-4 text-muted-foreground transition-transform ${!isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-4 space-y-6">
                            {/* Line description */}
                            <div>
                              <label className="block text-sm text-muted-foreground mb-2">Line description</label>
                              <input
                                type="text"
                                value={line.description}
                                onChange={(e) => updateLine(line.id, { description: e.target.value })}
                                placeholder="A chatbot"
                                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                              />
                            </div>

                            {/* Use parent dates toggle */}
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={line.useParentDates}
                                onCheckedChange={(checked) => updateLine(line.id, { useParentDates: checked })}
                              />
                              <span className="text-sm">Use parent order start and end dates</span>
                            </div>

                            {/* Start and End Date */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-muted-foreground mb-2">Start date</label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      className="w-full flex items-center border border-border rounded-md px-3 py-2.5 cursor-pointer hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={line.useParentDates}
                                    >
                                      <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                                      <span className="text-sm flex-1 text-left text-muted-foreground">
                                        {format(line.startDate, "MMMM do, yyyy")}
                                      </span>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={line.startDate}
                                      onSelect={(date) => {
                                        if (date) updateLine(line.id, { startDate: date })
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div>
                                <label className="block text-sm text-muted-foreground mb-2">End date</label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      className="w-full flex items-center border border-border rounded-md px-3 py-2.5 cursor-pointer hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={line.useParentDates}
                                    >
                                      <Calendar className="h-4 w-4 text-muted-foreground mr-3" />
                                      <span className="text-sm flex-1 text-left text-muted-foreground">
                                        {line.endDate ? format(line.endDate, "MMMM do, yyyy") : "Pick a date"}
                                      </span>
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={line.endDate || undefined}
                                      onSelect={(date) => {
                                        if (date) updateLine(line.id, { endDate: date })
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            {/* Pricing Section */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-sm text-muted-foreground">Pricing</label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs bg-transparent"
                                  onClick={() => openPricingModal(line.id)}
                                >
                                  Edit
                                </Button>
                              </div>
                              {line.pricing.length > 0 ? (
                                <div className="border border-border rounded-md">
                                  {line.pricing.map((price, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 border-b border-border last:border-b-0"
                                    >
                                      <div>
                                        <p className="text-sm font-medium">{price.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {price.type} • {price.frequency}
                                        </p>
                                      </div>
                                      <span className="text-sm">{price.price}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="border border-border rounded-md p-4 text-center text-sm text-muted-foreground">
                                  No pricing configured
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add Line Button with Dropdown */}
              <div className="relative">
                <Popover open={showAddLineDropdown} onOpenChange={setShowAddLineDropdown}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      ADD LINE
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="start">
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search products or plans..."
                          value={lineSearchQuery}
                          onChange={(e) => setLineSearchQuery(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-2 py-1">Credit bundles</p>
                      <button
                        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-muted rounded-md text-sm"
                        onClick={() => {
                          setShowAddCreditBundleModal(true)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add credit bundle
                      </button>
                    </div>
                    <div className="p-2 border-t border-border">
                      <p className="text-xs text-muted-foreground px-2 py-1">Products</p>
                      {products.map((product) => (
                        <button
                          key={product.id}
                          className="w-full flex items-center gap-2 px-2 py-2 hover:bg-muted rounded-md text-sm"
                          onClick={() => handleAddProduct(product)}
                        >
                          <span className="font-medium">{product.name}</span>
                          <span className="text-muted-foreground">{product.code}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-between pt-4 border-t border-border mt-8">
                <Button variant="outline" className="bg-transparent" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  BACK
                </Button>
                <Button onClick={handleCreateOrder}>
                  Done
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Credit Bundle Modal - existing code */}
      <Dialog open={showAddCreditBundleModal} onOpenChange={setShowAddCreditBundleModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Add credit bundle
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Bundle name</label>
                <input
                  type="text"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  placeholder="Enter bundle name"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description</label>
                <textarea
                  value={bundleDescription}
                  onChange={(e) => setBundleDescription(e.target.value)}
                  placeholder="Describe this credit bundle"
                  rows={4}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background resize-none"
                />
              </div>

              <div>
                <TooltipProvider>
                  <label className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    Credit bundle code
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>A unique identifier for this bundle used in API calls and integrations</p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                </TooltipProvider>
                <input
                  type="text"
                  value={bundleCode}
                  onChange={(e) => setBundleCode(e.target.value)}
                  placeholder="Enter bundle code"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
            </div>

            {/* Warning box */}
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-amber-700 font-medium mb-1">No credit currencies found</p>
                <p className="text-sm text-amber-600 mb-3">
                  You need to create at least one credit currency before creating credit bundles.
                </p>
                <Link href="/credits" className="text-sm text-amber-700 hover:underline">
                  Go to credits currencies →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddCreditBundleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCreditBundle}>
              Add credit bundle
              <Check className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order line item pricing</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Experiment with different pricing configurations for this order line item to land on the best price for
              your customer.
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {pricingTypes.map((pricingType) => (
              <div key={pricingType.id} className="border-b border-border pb-4 last:border-b-0">
                {/* Pricing Type Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={pricingType.enabled} onCheckedChange={() => togglePricingType(pricingType.id)} />
                    <span className="text-sm font-medium">{pricingType.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {pricingType.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 text-xs font-medium bg-muted rounded border border-border"
                      >
                        {badge}
                      </span>
                    ))}
                    <button
                      className="p-1 hover:bg-muted rounded"
                      onClick={() => togglePricingTypeExpanded(pricingType.id)}
                    >
                      {pricingType.expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {pricingType.enabled && pricingType.expanded && pricingType.events.length > 0 && (
                  <div className="mt-4 ml-10 space-y-4">
                    {pricingType.events.map((event) => (
                      <div key={event.id} className="space-y-4">
                        {/* Event row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md">
                            <span className="text-muted-foreground text-sm">↗</span>
                            <span className="text-sm">{event.name}</span>
                          </div>
                          <Switch
                            checked={event.enabled}
                            onCheckedChange={(checked) =>
                              updatePricingEvent(pricingType.id, event.id, { enabled: checked })
                            }
                          />
                        </div>

                        {event.enabled && (
                          <>
                            {/* HVE */}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">HVE</label>
                              <input
                                type="text"
                                value={event.hve}
                                onChange={(e) => updatePricingEvent(pricingType.id, event.id, { hve: e.target.value })}
                                className="w-32 border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                              />
                            </div>

                            {/* Billing type */}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-2">Billing type</label>
                              <RadioGroup
                                value={event.billingType}
                                onValueChange={(value) =>
                                  updatePricingEvent(pricingType.id, event.id, { billingType: value })
                                }
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="PerUnit" id={`${event.id}-perunit`} />
                                  <Label htmlFor={`${event.id}-perunit`} className="text-sm">
                                    PerUnit
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Volume" id={`${event.id}-volume`} />
                                  <Label htmlFor={`${event.id}-volume`} className="text-sm">
                                    Volume
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Graduated" id={`${event.id}-graduated`} />
                                  <Label htmlFor={`${event.id}-graduated`} className="text-sm">
                                    Graduated
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Credits" id={`${event.id}-credits`} />
                                  <Label htmlFor={`${event.id}-credits`} className="text-sm">
                                    Credits
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Price</label>
                              <input
                                type="text"
                                value={event.price}
                                onChange={(e) =>
                                  updatePricingEvent(pricingType.id, event.id, { price: e.target.value })
                                }
                                className="w-40 border border-border rounded-md px-3 py-1.5 text-sm bg-muted"
                              />
                            </div>

                            {/* Billing frequency */}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Billing frequency</label>
                              <select
                                value={event.frequency}
                                onChange={(e) =>
                                  updatePricingEvent(pricingType.id, event.id, { frequency: e.target.value })
                                }
                                className="w-40 border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                              >
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Yearly">Yearly</option>
                              </select>
                            </div>

                            {/* Minimum commitment and Included usage */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">
                                  Minimum commitment (units)
                                </label>
                                <input
                                  type="text"
                                  value={event.minCommitment}
                                  onChange={(e) =>
                                    updatePricingEvent(pricingType.id, event.id, { minCommitment: e.target.value })
                                  }
                                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">
                                  Included usage (units)
                                </label>
                                <input
                                  type="text"
                                  value={event.includedUsage}
                                  onChange={(e) =>
                                    updatePricingEvent(pricingType.id, event.id, { includedUsage: e.target.value })
                                  }
                                  className="w-full border border-border rounded-md px-3 py-1.5 text-sm bg-background"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-start mt-6">
            <Button onClick={handleSavePricing}>
              SAVE
              <Check className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
