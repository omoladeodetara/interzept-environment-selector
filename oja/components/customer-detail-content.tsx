"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MoreVertical, Pencil, Plus, Search, Trash2, X, ArrowUpDown } from "lucide-react"

export function CustomerDetailContent() {
  const params = useParams()
  const customerId = params.id as string
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("overview")
  const [showMetadataModal, setShowMetadataModal] = useState(false)
  const [metadataFields, setMetadataFields] = useState<{ key: string; value: string }[]>([])
  const [tempMetadataFields, setTempMetadataFields] = useState<{ key: string; value: string }[]>([])

  const customer = {
    name: "Onboarding Test Customer",
    externalId: "onboarding-test-customer",
    website: "https://paid.ai",
    phone: "+1-555-0123",
    address: {
      street: "123 Business Ave",
      suite: "Suite 100",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
    },
  }

  const metrics = [
    { label: "REVENUE", value: "€0.0" },
    { label: "COST", value: "€0" },
    { label: "MARGIN", value: "100.00%" },
    { label: "HVE", value: "€0" },
  ]

  const tabs = ["Overview", "Orders", "Invoices", "Payments", "Usages", "Contacts", "Credit balances", "Costs", "Intel"]

  const [orders] = useState([
    {
      id: "order-1",
      name: "test name",
      customer: "Onboarding Test Customer",
      status: "Active",
      total: "0,00 €",
      startDate: "Dec 6, 2025",
      endDate: "Forever",
    },
  ])

  const [invoices] = useState([
    {
      id: "INV-1",
      number: "INV-1",
      customer: "Onboarding Test Customer",
      status: "Posted",
      paymentStatus: "PartiallyPaid",
      invoiceId: "5dseGpv9pvs",
      createdAt: "Dec 6, 2025",
      dueDate: "Jan 5, 2026",
      total: "0,02 €",
    },
  ])

  const [usages] = useState([
    {
      id: "usage-1",
      usage: "using_chat_prompt",
      status: "Configured",
      startDate: "-",
      endDate: "-",
      quantity: "-",
      revenue: "-",
    },
  ])

  const [orderSearch, setOrderSearch] = useState("")
  const [orderStatusFilter, setOrderStatusFilter] = useState("all")
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all")
  const [invoicePaymentFilter, setInvoicePaymentFilter] = useState("all")

  const handleOpenMetadataModal = () => {
    setTempMetadataFields(metadataFields.length > 0 ? [...metadataFields] : [{ key: "", value: "" }])
    setShowMetadataModal(true)
  }

  const handleAddMetadataField = () => {
    setTempMetadataFields([...tempMetadataFields, { key: "", value: "" }])
  }

  const handleRemoveMetadataField = (index: number) => {
    setTempMetadataFields(tempMetadataFields.filter((_, i) => i !== index))
  }

  const handleMetadataChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...tempMetadataFields]
    updated[index][field] = value
    setTempMetadataFields(updated)
  }

  const handleSaveMetadata = () => {
    const validFields = tempMetadataFields.filter((f) => f.key.trim() !== "")
    setMetadataFields(validFields)
    setShowMetadataModal(false)
    toast({
      title: "Metadata updated",
      description: "Customer metadata has been saved.",
    })
  }

  return (
    <div className="flex flex-1">
      {/* Main Content */}
      <div className="flex-1 p-6">
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
            <Link href="/customers" className="text-muted-foreground hover:text-foreground">
              Customers
            </Link>
            <span className="text-muted-foreground">{">"}</span>
            <span className="font-medium">{customer.name}</span>
          </div>
          <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase().replace(" ", "-")
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Orders</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">Showing {orders.length} order</span>
          </div>

          <div className="border border-border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Status <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Start date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">End date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="p-4 text-sm">{order.name}</td>
                    <td className="p-4 text-sm">{order.customer}</td>
                    <td className="p-4">
                      <span className="text-xs border border-border rounded px-2 py-1">{order.status}</span>
                    </td>
                    <td className="p-4 text-sm">{order.total}</td>
                    <td className="p-4 text-sm font-mono">{order.startDate}</td>
                    <td className="p-4 text-sm">{order.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Invoices</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={invoicePaymentFilter} onValueChange={setInvoicePaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All payment statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payment statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partiallypaid">Partially Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">Showing {invoices.length} invoice</span>
          </div>

          <div className="border border-border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Number</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invoice ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created at</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="p-4">
                      <Link href={`/invoices/${invoice.id}`} className="text-sm text-orange-500 hover:underline">
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-orange-500">{invoice.customer}</td>
                    <td className="p-4">
                      <span className="text-xs border border-border rounded px-2 py-1">{invoice.status}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs border border-border rounded px-2 py-1">{invoice.paymentStatus}</span>
                    </td>
                    <td className="p-4 text-sm font-mono text-muted-foreground">{invoice.invoiceId}</td>
                    <td className="p-4 text-sm font-mono">{invoice.createdAt}</td>
                    <td className="p-4 text-sm font-mono">{invoice.dueDate}</td>
                    <td className="p-4 text-sm">{invoice.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usages Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Usages</h2>
          <div className="border border-border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Usage</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Start date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">End date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Revenue <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {usages.map((usage) => (
                  <tr key={usage.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="p-4">
                      <span className="text-sm">{usage.usage}</span>
                      <span className="ml-2 text-xs border border-border rounded px-2 py-0.5 text-muted-foreground">
                        {usage.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{usage.startDate}</td>
                    <td className="p-4 text-sm text-muted-foreground">{usage.endDate}</td>
                    <td className="p-4 text-sm text-muted-foreground">{usage.quantity}</td>
                    <td className="p-4 text-sm text-muted-foreground">{usage.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="w-80 border-l border-border p-6 bg-muted/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Details</h3>
          <button className="p-1 hover:bg-muted rounded">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Customer</p>
            <span className="text-sm text-orange-500">{customer.name}</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">External ID</p>
            <span className="text-sm text-orange-500">{customer.externalId}</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Website</p>
            <a
              href={customer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-500 hover:underline"
            >
              {customer.website}
            </a>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Phone</p>
            <span className="text-sm">{customer.phone}</span>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <div className="text-sm">
              <p>{customer.address.street}</p>
              <p>{customer.address.suite}</p>
              <p>
                {customer.address.city}, {customer.address.state} {customer.address.zip}
              </p>
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

      {/* Metadata Modal */}
      <Dialog open={showMetadataModal} onOpenChange={setShowMetadataModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle>Edit metadata</DialogTitle>
            <button
              onClick={() => setShowMetadataModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {tempMetadataFields.map((field, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Key</Label>
                  <Input
                    value={field.key}
                    onChange={(e) => handleMetadataChange(index, "key", e.target.value)}
                    placeholder="Enter key"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={field.value}
                    onChange={(e) => handleMetadataChange(index, "value", e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                <button
                  onClick={() => handleRemoveMetadataField(index)}
                  className="mt-8 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddMetadataField} className="w-full gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add field
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowMetadataModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handleSaveMetadata}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
