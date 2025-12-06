"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronRight, ChevronLeft, Calendar, Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: 1, name: "Customer" },
  { id: 2, name: "Invoice details" },
  { id: 3, name: "Lines" },
  { id: 4, name: "Preview" },
]

interface InvoiceLine {
  id: number
  description: string
  quantity: number
  unitPrice: number
}

export function CreateInvoiceContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [productType] = useState("One-off charge")

  const [issueDate, setIssueDate] = useState(new Date(2025, 11, 6)) // December 6th, 2025
  const [dueDate, setDueDate] = useState(new Date(2026, 0, 5)) // January 5th, 2026
  const [showIssueCalendar, setShowIssueCalendar] = useState(false)
  const [showDueCalendar, setShowDueCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date(2025, 11, 1))

  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([])
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null)
  const [showAddLineForm, setShowAddLineForm] = useState(false)
  const [newLine, setNewLine] = useState({ description: "", quantity: 1, unitPrice: 0 })

  const canProceed = selectedCustomer !== ""

  const formatDate = (date: Date) => {
    return date
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      .replace(/(\d+)/, (match) => {
        const num = Number.parseInt(match)
        const suffix =
          num === 1 || num === 21 || num === 31
            ? "st"
            : num === 2 || num === 22
              ? "nd"
              : num === 3 || num === 23
                ? "rd"
                : "th"
        return `${num}${suffix}`
      })
  }

  const formatShortDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days: { day: number; currentMonth: boolean; date: Date }[] = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i),
      })
    }

    // Next month days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i),
      })
    }

    return days
  }

  const handleAddLine = () => {
    if (newLine.description && newLine.unitPrice > 0) {
      setInvoiceLines([...invoiceLines, { ...newLine, id: Date.now() }])
      setNewLine({ description: "", quantity: 1, unitPrice: 0 })
      setShowAddLineForm(false)
    }
  }

  const handleDeleteLine = (id: number) => {
    setInvoiceLines(invoiceLines.filter((line) => line.id !== id))
  }

  const calculateTotal = () => {
    return invoiceLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  }

  const CalendarPopover = ({
    selectedDate,
    onSelect,
    open,
    onOpenChange,
  }: {
    selectedDate: Date
    onSelect: (date: Date) => void
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center gap-2 border border-border rounded-md px-3 py-2 text-sm bg-background text-left">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(selectedDate)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            className="p-1 hover:bg-muted rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            className="p-1 hover:bg-muted rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="p-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(calendarMonth).map((dayInfo, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(dayInfo.date)
                onOpenChange(false)
              }}
              className={`p-2 text-sm rounded hover:bg-muted ${
                !dayInfo.currentMonth ? "text-muted-foreground/50" : ""
              } ${
                selectedDate.toDateString() === dayInfo.date.toDateString()
                  ? "bg-foreground text-background hover:bg-foreground"
                  : ""
              }`}
            >
              {dayInfo.day}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )

  const handleCreateInvoice = () => {
    toast({
      title: "Success",
      description: "Invoice created successfully",
    })
    router.push("/invoices/INV-0001")
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="text-muted-foreground">|</span>
        <Link href="/invoices" className="text-muted-foreground hover:text-foreground">
          Invoices
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">Create invoice</span>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                  step.id < currentStep
                    ? "bg-foreground text-background border-foreground"
                    : step.id === currentStep
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
              </div>
              <span
                className={`text-sm ${
                  step.id <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && <div className="w-16 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Select Customer */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Select customer</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose the customer for this invoice</p>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Select a customer...</option>
                <option value="onboarding-test">Onboarding Test Customer</option>
              </select>
            </div>

            {/* Product */}
            <div>
              <h2 className="text-lg font-semibold mb-1">Product</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manual invoices can only be created for one-off charges
              </p>
              <select
                value={productType}
                disabled
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground cursor-not-allowed"
              >
                <option>One-off charge</option>
              </select>
            </div>

            {/* Next Button */}
            <Button className="w-full" disabled={!canProceed} onClick={() => setCurrentStep(2)}>
              Next: invoice details
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-1">Invoice details</h2>
              <p className="text-sm text-muted-foreground mb-4">Set the invoice dates</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Issue date</label>
                  <CalendarPopover
                    selectedDate={issueDate}
                    onSelect={setIssueDate}
                    open={showIssueCalendar}
                    onOpenChange={setShowIssueCalendar}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due date</label>
                  <CalendarPopover
                    selectedDate={dueDate}
                    onSelect={setDueDate}
                    open={showDueCalendar}
                    onOpenChange={setShowDueCalendar}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setCurrentStep(3)}>
                Next: lines
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Invoice lines</h2>
                <p className="text-sm text-muted-foreground">Add line items to the invoice</p>
              </div>
              <Button size="sm" onClick={() => setShowAddLineForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add line
              </Button>
            </div>

            {invoiceLines.length === 0 && !showAddLineForm ? (
              // Empty state
              <div className="border border-border rounded-lg p-12 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">No invoice lines added yet</p>
                <Button variant="outline" onClick={() => setShowAddLineForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add first line
                </Button>
              </div>
            ) : (
              // Table with lines
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-center">Quantity</th>
                      <th className="px-4 py-3 font-medium text-right">Unit price</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceLines.map((line) => (
                      <tr key={line.id} className="border-t border-border">
                        <td className="px-4 py-3 text-sm">{line.description}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="text-orange-500">{line.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">€{line.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right">€{(line.quantity * line.unitPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 hover:bg-muted rounded">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-1 hover:bg-muted rounded" onClick={() => handleDeleteLine(line.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {showAddLineForm && (
                      <tr className="border-t border-border bg-muted/20">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder="Description"
                            value={newLine.description}
                            onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                            className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={newLine.quantity}
                            onChange={(e) => setNewLine({ ...newLine, quantity: Number.parseInt(e.target.value) || 1 })}
                            className="w-20 border border-border rounded px-2 py-1 text-sm bg-background text-center mx-auto block"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newLine.unitPrice || ""}
                            onChange={(e) =>
                              setNewLine({ ...newLine, unitPrice: Number.parseFloat(e.target.value) || 0 })
                            }
                            placeholder="0.00"
                            className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-right ml-auto block"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-muted-foreground">
                          €{(newLine.quantity * newLine.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setShowAddLineForm(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleAddLine}>
                              Add
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {invoiceLines.length > 0 && (
                      <tr className="border-t border-border">
                        <td colSpan={3} className="px-4 py-3 text-sm text-right font-medium">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">€{calculateTotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setCurrentStep(4)}>
                Next: preview
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Preview invoice</h2>
              <p className="text-sm text-muted-foreground">Review the invoice before creating it</p>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center justify-between bg-muted/30 rounded-lg px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total amount</p>
                <p className="text-xl font-semibold">€{calculateTotal().toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Issue date</p>
                <p className="text-sm font-medium">{formatShortDate(issueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Due date</p>
                <p className="text-sm font-medium">{formatShortDate(dueDate)}</p>
              </div>
            </div>

            {/* Invoice Document Preview */}
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              {/* Invoice Header */}
              <div className="p-8 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold tracking-tight">INVOICE</h3>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">Draft</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Invoice number: INV-undefined</p>
                  <p>Invoice date: {formatShortDate(issueDate)}</p>
                  <p>Due date: {formatShortDate(dueDate)}</p>
                </div>
              </div>

              {/* Invoice Lines Table */}
              <div className="p-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="pb-2 font-medium">Quantity</th>
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium">Start date</th>
                      <th className="pb-2 font-medium">End date</th>
                      <th className="pb-2 font-medium">Tax</th>
                      <th className="pb-2 font-medium text-right">Unit price</th>
                      <th className="pb-2 font-medium text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceLines.map((line) => (
                      <tr key={line.id} className="border-b border-border/50">
                        <td className="py-2 text-orange-500">{line.quantity}</td>
                        <td className="py-2">{line.description}</td>
                        <td className="py-2 text-muted-foreground">{formatShortDate(issueDate).replace(/\//g, "-")}</td>
                        <td className="py-2 text-muted-foreground">{formatShortDate(dueDate).replace(/\//g, "-")}</td>
                        <td className="py-2 text-muted-foreground">€0.00</td>
                        <td className="py-2 text-right">€{line.unitPrice.toFixed(2)}</td>
                        <td className="py-2 text-right">€{(line.quantity * line.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                    {invoiceLines.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          No line items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Footer */}
              <div className="bg-zinc-800 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-orange-400 mb-2">Bill to</p>
                    <p className="text-sm font-medium">Onboarding Test Customer</p>
                    <p className="text-xs text-zinc-400">123 Business Ave</p>
                    <p className="text-xs text-zinc-400">San Francisco, CA, 94105</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-orange-400 mb-1">Total due</p>
                    <div className="text-xs text-zinc-400 mb-1">
                      <span>Tax (0.00%)</span>
                      <span className="ml-4">€0.00</span>
                    </div>
                    <p className="text-2xl font-bold">€{calculateTotal().toFixed(2)}</p>
                    <p className="text-xs text-zinc-400 mt-1">Total payment due in 30 days.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button onClick={handleCreateInvoice}>Create invoice</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
