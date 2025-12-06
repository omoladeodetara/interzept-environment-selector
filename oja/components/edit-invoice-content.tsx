"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { FileText, ChevronRight, Plus, Pencil, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface InvoiceLine {
  id: number
  description: string
  quantity: number
  unitPrice: number
}

export function EditInvoiceContent() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)

  // Pre-populated with existing invoice data
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    { id: 1, description: "ass", quantity: 1, unitPrice: 0.02 },
  ])
  const [showAddLineForm, setShowAddLineForm] = useState(false)
  const [newLine, setNewLine] = useState({ description: "", quantity: 1, unitPrice: 0 })
  const [editingLineId, setEditingLineId] = useState<number | null>(null)
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null)

  const steps = [
    { id: 1, name: "Lines" },
    { id: 2, name: "Preview" },
  ]

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

  const handleStartEdit = (line: InvoiceLine) => {
    setEditingLineId(line.id)
    setEditingLine({ ...line })
  }

  const handleSaveEdit = () => {
    if (editingLine) {
      setInvoiceLines(invoiceLines.map((line) => (line.id === editingLine.id ? editingLine : line)))
      setEditingLineId(null)
      setEditingLine(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingLineId(null)
    setEditingLine(null)
  }

  const calculateTotal = () => {
    return invoiceLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  }

  const handleSaveInvoice = () => {
    toast({
      title: "Success",
      description: "Invoice updated successfully",
    })
    router.push(`/invoices/${invoiceId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Link href="/invoices" className="text-muted-foreground hover:text-foreground">
            Invoices
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href={`/invoices/${invoiceId}`} className="text-muted-foreground hover:text-foreground">
            {invoiceId}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Edit</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center py-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep > step.id
                    ? "bg-zinc-900 text-white"
                    : currentStep === step.id
                      ? "bg-zinc-900 text-white"
                      : "border border-border text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
              </div>
              <span className={`text-sm ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && <div className="w-16 h-px bg-border mx-4" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Invoice lines</h2>
                <p className="text-sm text-muted-foreground">Edit line items on the invoice</p>
              </div>
              <Button size="sm" onClick={() => setShowAddLineForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add line
              </Button>
            </div>

            {/* Table with lines */}
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
                  {invoiceLines.map((line) =>
                    editingLineId === line.id && editingLine ? (
                      <tr key={line.id} className="border-t border-border bg-muted/20">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editingLine.description}
                            onChange={(e) => setEditingLine({ ...editingLine, description: e.target.value })}
                            className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editingLine.quantity}
                            onChange={(e) =>
                              setEditingLine({ ...editingLine, quantity: Number.parseInt(e.target.value) || 1 })
                            }
                            className="w-20 border border-border rounded px-2 py-1 text-sm bg-background text-center mx-auto block"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editingLine.unitPrice}
                            onChange={(e) =>
                              setEditingLine({ ...editingLine, unitPrice: Number.parseFloat(e.target.value) || 0 })
                            }
                            className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-right ml-auto block"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-muted-foreground">
                          €{(editingLine.quantity * editingLine.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={line.id} className="border-t border-border">
                        <td className="px-4 py-3 text-sm">{line.description}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="text-orange-500">{line.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">€{line.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right">€{(line.quantity * line.unitPrice).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1 hover:bg-muted rounded" onClick={() => handleStartEdit(line)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-1 hover:bg-muted rounded" onClick={() => handleDeleteLine(line.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
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

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => router.push(`/invoices/${invoiceId}`)}
              >
                Cancel
              </Button>
              <Button onClick={() => setCurrentStep(2)}>Next: preview</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Preview changes</h2>
              <p className="text-sm text-muted-foreground">Review the updated invoice before saving</p>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center justify-between bg-muted/30 rounded-lg px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total amount</p>
                <p className="text-xl font-semibold">€{calculateTotal().toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Invoice number</p>
                <p className="text-sm font-medium">{invoiceId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Line items</p>
                <p className="text-sm font-medium">{invoiceLines.length}</p>
              </div>
            </div>

            {/* Invoice Lines Preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-center">Quantity</th>
                    <th className="px-4 py-3 font-medium text-right">Unit price</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
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
                    </tr>
                  ))}
                  <tr className="border-t border-border">
                    <td colSpan={3} className="px-4 py-3 text-sm text-right font-medium">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">€{calculateTotal().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={handleSaveInvoice}>Save changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
