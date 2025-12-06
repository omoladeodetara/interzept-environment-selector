"use client"

import { useState } from "react"
import { Scale, Search } from "lucide-react"
import { Input } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lastprice/ui'

// Mock data - empty for now
const disputes: {
  id: string
  invoice: string
  customer: string
  reason: string
  status: string
  amount: number
  created: string
}[] = []

export function DisputesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")

  // Calculate stats
  const totalDisputes = disputes.length
  const pendingResolution = disputes.filter((d) => d.status === "pending").length
  const resolved = disputes.filter((d) => d.status === "resolved").length
  const openDisputeAmount = disputes.filter((d) => d.status === "pending").reduce((sum, d) => sum + d.amount, 0)

  // Filter disputes
  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter
    const matchesCustomer = customerFilter === "all" || dispute.customer === customerFilter
    return matchesSearch && matchesStatus && matchesCustomer
  })

  // Get unique customers for filter
  const customers = [...new Set(disputes.map((d) => d.customer))]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Scale className="h-5 w-5" />
        <span className="text-muted-foreground">|</span>
        <h1 className="text-lg font-medium">Disputes</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-dashed rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total Disputes</p>
          <p className="text-2xl font-semibold">{totalDisputes}</p>
        </div>
        <div className="border border-dashed rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Pending Resolution</p>
          <p className="text-2xl font-semibold">{pendingResolution}</p>
        </div>
        <div className="border border-dashed rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Resolved</p>
          <p className="text-2xl font-semibold">{resolved}</p>
        </div>
        <div className="border border-dashed rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Open Dispute Amount</p>
          <p className="text-2xl font-semibold">
            ${openDisputeAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer} value={customer}>
                {customer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">Showing {filteredDisputes.length} disputes</div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispute</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDisputes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  No results
                </TableCell>
              </TableRow>
            ) : (
              filteredDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>{dispute.id}</TableCell>
                  <TableCell>{dispute.invoice}</TableCell>
                  <TableCell>{dispute.customer}</TableCell>
                  <TableCell>{dispute.reason}</TableCell>
                  <TableCell>{dispute.status}</TableCell>
                  <TableCell>${dispute.amount.toFixed(2)}</TableCell>
                  <TableCell>{dispute.created}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
