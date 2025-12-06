"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from '@lastprice/ui'
import { Checkbox } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { useToast } from "@/hooks/use-toast"
import { Download, Plus, X } from "lucide-react"

const exportColumns = [
  { id: "id", label: "ID", defaultChecked: true },
  { id: "customer_id", label: "Customer ID", defaultChecked: true },
  { id: "order_id", label: "Order ID", defaultChecked: false },
  { id: "currency", label: "Currency", defaultChecked: false },
  { id: "payment_type", label: "Payment type", defaultChecked: false },
  { id: "external_payment_id", label: "External payment ID", defaultChecked: false },
  { id: "balance", label: "Balance", defaultChecked: false },
  { id: "number", label: "Number", defaultChecked: true },
  { id: "invoice_id", label: "Invoice ID", defaultChecked: false },
  { id: "amount", label: "Amount", defaultChecked: true },
  { id: "payment_date", label: "Payment date", defaultChecked: false },
  { id: "payment_status", label: "Payment status", defaultChecked: false },
  { id: "allocations", label: "Allocations", defaultChecked: false },
  { id: "created_at", label: "Created at", defaultChecked: false },
]

export function PaymentsContent() {
  const { toast } = useToast()
  const [showExportModal, setShowExportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    exportColumns.filter((c) => c.defaultChecked).map((c) => c.id),
  )

  const [payments, setPayments] = useState([
    {
      id: "PAY-0001",
      customer: "Onboarding Test Customer",
      amount: "12,00 €",
      type: "Bank transfer",
      status: "Draft",
      date: "Dec 6, 2025",
    },
  ])

  const [customer, setCustomer] = useState("Onboarding Test Customer")
  const [amount, setAmount] = useState("12,00")
  const [currency, setCurrency] = useState("€")
  const [paymentDate, setPaymentDate] = useState("Dec 6, 2025")
  const [paymentType, setPaymentType] = useState("Bank transfer")

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(exportColumns.map((c) => c.id))
    } else {
      setSelectedColumns([])
    }
  }

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns([...selectedColumns, columnId])
    } else {
      setSelectedColumns(selectedColumns.filter((id) => id !== columnId))
    }
  }

  const isAllSelected = selectedColumns.length === exportColumns.length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-lg font-medium">Payments</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {payments.length > 0 ? (
        <div className="border border-border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Number</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                  <td className="p-4">
                    <Link href={`/payments/${payment.id}`} className="text-sm text-orange-500 hover:underline">
                      {payment.id}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{payment.customer}</td>
                  <td className="p-4 text-sm">{payment.amount}</td>
                  <td className="p-4 text-sm">{payment.type}</td>
                  <td className="p-4">
                    <span className="text-xs border border-border rounded px-2 py-1">{payment.status}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-border rounded-lg min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">No payments recorded</h3>
            <p className="text-muted-foreground">
              You'll see payment activity here once customers begin
              <br />
              transacting.
            </p>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle>Export payments</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select the columns you want to include in the CSV export
              </p>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={handleSelectAll} />
                <Label htmlFor="select-all" className="font-medium">
                  Select all
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedColumns.length} of {exportColumns.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {exportColumns.map((column) => (
                <div key={column.id} className="flex items-center gap-2">
                  <Checkbox
                    id={column.id}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={(checked) => handleColumnToggle(column.id, checked as boolean)}
                  />
                  <Label htmlFor={column.id} className="font-normal">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">Export</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Payment Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle>Payment</DialogTitle>
            <button
              onClick={() => setShowCreateModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding-test">Onboarding Test Customer</SelectItem>
                  <SelectItem value="demo-customer">Demo Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency}</span>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-7" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment date</Label>
              <Input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="Select date" />
            </div>

            <div className="space-y-2">
              <Label>Payment type</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                  <SelectItem value="credit_card">Credit card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
