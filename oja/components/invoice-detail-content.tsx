"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from '@lastprice/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lastprice/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lastprice/ui'
import { FileText, Pencil, Link2, Mail, XCircle, Send, Eye, Info, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { Textarea } from '@lastprice/ui'
import { Checkbox } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { useToast } from "@/hooks/use-toast"

const tabs = ["Invoice lines", "Payments", "Usages", "Credit notes"]

interface InvoiceDetailContentProps {
  invoiceId: string
}

export function InvoiceDetailContent({ invoiceId }: InvoiceDetailContentProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invoice-lines")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false)
  const [creditNoteReason, setCreditNoteReason] = useState("billing_error")
  const [creditNoteDescription, setCreditNoteDescription] = useState("")
  const [selectedLines, setSelectedLines] = useState<string[]>([])
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({})
  const [metadataFields, setMetadataFields] = useState<Array<{ key: string; value: string }>>([])
  const [invoiceStatus, setInvoiceStatus] = useState("Draft")

  const invoiceLines = [
    {
      id: "INV-LINE-1",
      originalAmount: 0.02,
      maxCreditable: 0.02,
    },
  ]

  const handleToggleLine = (lineId: string) => {
    setSelectedLines((prev) => (prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]))
  }

  const handleCreditAmountChange = (lineId: string, amount: string) => {
    setCreditAmounts((prev) => ({ ...prev, [lineId]: amount }))
  }

  const handleCreateCreditNote = () => {
    toast({
      title: "Success",
      description: "Credit note created successfully",
    })
    setShowCreditNoteModal(false)
    setCreditNoteReason("billing_error")
    setCreditNoteDescription("")
    setSelectedLines([])
    setCreditAmounts({})
  }

  const handleOpenMetadataModal = () => {
    setMetadataFields(metadataFields.length > 0 ? [...metadataFields] : [])
    setShowMetadataModal(true)
  }

  const handleAddField = () => {
    setMetadataFields([...metadataFields, { key: "", value: "" }])
  }

  const handleRemoveField = (index: number) => {
    setMetadataFields(metadataFields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...metadataFields]
    updated[index][field] = value
    setMetadataFields(updated)
  }

  const handleSaveMetadata = () => {
    const validMetadataFields = metadataFields.filter((m) => m.key.trim() !== "")
    setMetadataFields(validMetadataFields)
    setShowMetadataModal(false)
    toast({
      title: "Success",
      description: "Metadata updated successfully",
    })
  }

  const handlePostInvoice = () => {
    setInvoiceStatus("Posted")
    toast({
      title: "Success",
      description: "Invoice posted successfully",
    })
  }

  return (
    <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span className="text-muted-foreground">Invoices</span>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium">{invoiceId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setShowCreditNoteModal(true)}>
              <FileText className="h-4 w-4 mr-1" />
              Create credit note
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent" asChild>
              <Link href={`/invoices/${invoiceId}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit invoice
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Link2 className="h-4 w-4 mr-1" />
              Copy share URL
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Mail className="h-4 w-4 mr-1" />
              Email invoice
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <XCircle className="h-4 w-4 mr-1" />
              Void invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={handlePostInvoice}
              disabled={invoiceStatus === "Posted"}
            >
              <Send className="h-4 w-4 mr-1" />
              Post invoice
            </Button>
            <Button size="sm" onClick={() => setShowPreviewModal(true)}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500 text-white rounded-lg px-4 py-3 flex items-center gap-2 mb-6">
          <Info className="h-4 w-4" />
          <span className="text-sm">This invoice was created manually.</span>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex items-center gap-6 border-b border-border mb-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replace(" ", "-")}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="invoice-lines">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Invoice line number</th>
                    <th className="px-4 py-3 font-medium">Order line</th>
                    <th className="px-4 py-3 font-medium">Start date</th>
                    <th className="px-4 py-3 font-medium">End date</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Credited</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Payment status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceLines.map((line, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 text-sm text-orange-500 font-mono">{line.id}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground"></td>
                      <td className="px-4 py-3 text-sm font-mono">Dec 6, 2025</td>
                      <td className="px-4 py-3 text-sm font-mono">Jan 6, 2026</td>
                      <td className="px-4 py-3 text-sm">1</td>
                      <td className="px-4 py-3 text-sm">{line.originalAmount.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-sm">{0} €</td>
                      <td className="px-4 py-3 text-sm">{line.maxCreditable.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-muted rounded text-xs font-medium">Pending</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="payments">
            <div className="border border-border rounded-lg p-12 flex flex-col items-center justify-center">
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          </TabsContent>
          <TabsContent value="usages">
            <div className="border border-border rounded-lg p-12 flex flex-col items-center justify-center">
              <p className="text-muted-foreground">No usage data available</p>
            </div>
          </TabsContent>
          <TabsContent value="credit-notes">
            <div className="border border-border rounded-lg p-12 flex flex-col items-center justify-center">
              <p className="text-muted-foreground">No credit notes issued</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Sidebar */}
      <div className="w-80 border-l border-border p-6 bg-muted/20">
        <h3 className="font-semibold mb-6">Details</h3>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Invoice ID</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">inv_5dseGpv9pvs</span>
              <button className="p-1 hover:bg-muted rounded">
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Invoice number</p>
            <span className="text-sm font-semibold">{invoiceId}</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Customer</p>
            <Link href="/customers" className="text-sm text-orange-500 hover:underline">
              Onboarding Test Customer
            </Link>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-sm font-medium">{invoiceStatus}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Payment status</p>
            <span className="text-sm font-semibold">Pending</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Total amount</p>
            <span className="text-sm">0,02 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Amount paid</p>
            <span className="text-sm">0,00 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Amount due</p>
            <span className="text-sm">0,02 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Credited amount</p>
            <span className="text-sm">0,00 €</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Invoice date</p>
            <span className="text-sm">Dec 6, 2025</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Due date</p>
            <span className="text-sm">Jan 5, 2026</span>
          </div>

          {/* Dispute link section */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Dispute link</p>
            <div className="flex items-center gap-2">
              <Link href="#" className="text-sm text-orange-500 hover:underline truncate">
                https://app.paid...
              </Link>
              <button className="p-1 hover:bg-muted rounded">
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* METADATA section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">METADATA</span>
              <button
                onClick={handleOpenMetadataModal}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
            {metadataFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No metadata</p>
            ) : (
              <div className="space-y-1">
                {metadataFields.map((item, index) => (
                  <div key={index}>
                    <span className="text-sm font-medium">{item.key}</span>
                    {item.value && <p className="text-sm text-muted-foreground">{item.value}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Metadata Modal */}
      {showMetadataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 pb-2">
              <div>
                <h2 className="text-lg font-semibold">Edit metadata</h2>
                <p className="text-sm text-muted-foreground">
                  Add custom key-value pairs to store additional information.
                </p>
              </div>
              <button onClick={() => setShowMetadataModal(false)} className="p-1 hover:bg-muted rounded">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 pt-4 space-y-4">
              {metadataFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No metadata fields yet. Click "Add field" to create one.
                </p>
              ) : (
                <div className="space-y-3">
                  {metadataFields.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        {index === 0 && <label className="text-sm font-medium mb-1 block">Key</label>}
                        <Input
                          placeholder="e.g., department"
                          value={item.key}
                          onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        {index === 0 && <label className="text-sm font-medium mb-1 block">Value</label>}
                        <Input
                          placeholder="e.g., Engineering"
                          value={item.value}
                          onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveField(index)}
                        className={`p-2 hover:bg-muted rounded text-red-500 ${index === 0 ? "mt-6" : ""}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" onClick={handleAddField} className="mt-4 bg-transparent">
                <XCircle className="h-4 w-4 mr-1" />
                Add field
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowMetadataModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMetadata}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-end gap-2 p-4 border-b border-border">
              <button className="p-2 hover:bg-muted rounded">
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Invoice Document */}
            <div className="p-8">
              {/* Invoice Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">INVOICE</h1>
                  <span className="text-sm text-muted-foreground">{invoiceStatus}</span>
                </div>
                <p className="text-sm text-muted-foreground">Invoice number: {invoiceId}</p>
                <p className="text-sm text-muted-foreground">Invoice date: 12/6/2025</p>
                <p className="text-sm text-muted-foreground">Due date: 1/5/2026</p>
              </div>

              {/* Invoice Line Number */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Invoice line number</p>
                <p className="text-sm font-mono text-orange-500">INV-LINE-1</p>
              </div>

              {/* Line Items Table */}
              <div className="border border-border rounded mb-8">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Quantity</th>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium">Start date</th>
                      <th className="px-4 py-2 font-medium">End date</th>
                      <th className="px-4 py-2 font-medium">Tax</th>
                      <th className="px-4 py-2 font-medium">Unit price</th>
                      <th className="px-4 py-2 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceLines.map((line, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2 text-orange-500">{1}</td>
                        <td className="px-4 py-2">ass</td>
                        <td className="px-4 py-2">2025-12-06</td>
                        <td className="px-4 py-2">2026-01-06</td>
                        <td className="px-4 py-2">€0.00</td>
                        <td className="px-4 py-2">€0.02</td>
                        <td className="px-4 py-2">€0.02</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer - Bill To Section */}
              <div className="bg-zinc-800 text-white rounded-lg p-6">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-medium">Bill to</span>
                  <span className="text-sm font-medium">Total due</span>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">
                    <p className="font-medium">Onboarding Test Customer</p>
                    <p className="text-zinc-400">123 Business Ave</p>
                    <p className="text-zinc-400">San Francisco, CA, 94105</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-4 text-sm text-zinc-400 mb-2">
                      <span>Tax (0.00%)</span>
                      <span>€0.00</span>
                    </div>
                    <p className="text-3xl font-bold">€0.02</p>
                    <p className="text-xs text-zinc-400 mt-1">Total payment due in 30 days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Credit Note Modal */}
      {showCreditNoteModal && (
        <Dialog open={showCreditNoteModal} onOpenChange={setShowCreditNoteModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create credit note</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select value={creditNoteReason} onValueChange={setCreditNoteReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing_error">Billing error</SelectItem>
                      <SelectItem value="product_return">Product return</SelectItem>
                      <SelectItem value="customer_request">Customer request</SelectItem>
                      <SelectItem value="duplicate_charge">Duplicate charge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Optional description"
                    value={creditNoteDescription}
                    onChange={(e) => setCreditNoteDescription(e.target.value)}
                    className="resize-none h-[38px]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select invoice lines to credit and specify amount BEFORE tax. Tax will be added automatically.
                </p>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Line</TableHead>
                      <TableHead>Original (before tax)</TableHead>
                      <TableHead>Max creditable (before tax)</TableHead>
                      <TableHead>Amount to credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLines.includes(line.id)}
                            onCheckedChange={() => handleToggleLine(line.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{line.id}</TableCell>
                        <TableCell>{line.originalAmount.toFixed(2)}</TableCell>
                        <TableCell>{line.maxCreditable.toFixed(2)}</TableCell>
                        <TableCell>
                          {selectedLines.includes(line.id) ? (
                            <Input
                              type="number"
                              step="0.01"
                              max={line.maxCreditable}
                              value={creditAmounts[line.id] || ""}
                              onChange={(e) => handleCreditAmountChange(line.id, e.target.value)}
                              className="w-24 h-8"
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreditNoteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCreditNote}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
