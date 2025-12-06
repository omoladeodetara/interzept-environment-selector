"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Plus, Search, X, MoreHorizontal } from "lucide-react"

const exportColumns = [
  { id: "id", label: "ID", defaultChecked: true },
  { id: "name", label: "Name", defaultChecked: true },
  { id: "external_id", label: "External ID", defaultChecked: true },
  { id: "status", label: "Status", defaultChecked: true },
  { id: "website", label: "Website", defaultChecked: false },
  { id: "phone", label: "Phone", defaultChecked: false },
  { id: "address", label: "Address", defaultChecked: false },
  { id: "created_at", label: "Created at", defaultChecked: false },
]

export function CustomersContent() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    exportColumns.filter((c) => c.defaultChecked).map((c) => c.id),
  )

  const [customers] = useState([
    {
      id: "onboarding-test-customer",
      name: "Onboarding Test Customer",
      status: "Active",
      website: "https://paid.ai",
      phone: "+1-555-0123",
      customerId: "onboarding-test-customer",
    },
  ])

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    externalId: "",
    website: "",
    phone: "",
  })

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

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-lg font-medium">Customers</h1>
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

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[250px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Website</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer ID</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                <td className="p-4">
                  <Link href={`/customers/${customer.id}`} className="text-sm hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="text-xs border border-border rounded px-2 py-1">{customer.status}</span>
                </td>
                <td className="p-4">
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-500 hover:underline"
                  >
                    {customer.website}
                  </a>
                </td>
                <td className="p-4 text-sm">{customer.phone}</td>
                <td className="p-4 text-sm text-muted-foreground">{customer.customerId}</td>
                <td className="p-4">
                  <button className="p-1 hover:bg-muted rounded">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle>Export customers</DialogTitle>
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

      {/* Create Customer Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <DialogTitle>Create customer</DialogTitle>
            <button
              onClick={() => setShowCreateModal(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label>External ID</Label>
              <Input
                value={newCustomer.externalId}
                onChange={(e) => setNewCustomer({ ...newCustomer, externalId: e.target.value })}
                placeholder="Enter external ID"
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={newCustomer.website}
                onChange={(e) => setNewCustomer({ ...newCustomer, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
