"use client"

import { useState, useEffect } from "react"
import { Scale, Search, Loader2 } from "lucide-react"
import { Input } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lastprice/ui'
import { useMockData, useDataSource } from '@/lib/data-source'

// Dispute type matching DB schema
interface Dispute {
  id: string
  tenant_id: string
  payment_id: string | null
  customer_id: string | null
  external_id: string | null
  status: string
  amount: string
  currency: string
  reason: string | null
  evidence: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined fields (optional)
  customer_name?: string
  invoice_number?: string
}

// Mock data for development without database
const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'mock-dispute-1',
    tenant_id: 'mock-tenant',
    payment_id: 'mock-payment-1',
    customer_id: 'mock-customer-1',
    external_id: 'disp_mock_001',
    status: 'open',
    amount: '150.00',
    currency: 'USD',
    reason: 'product_not_received',
    evidence: { summary: 'Customer claims product was never delivered' },
    metadata: { priority: 'high' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-dispute-2',
    tenant_id: 'mock-tenant',
    payment_id: 'mock-payment-2',
    customer_id: 'mock-customer-2',
    external_id: 'disp_mock_002',
    status: 'won',
    amount: '75.00',
    currency: 'USD',
    reason: 'fraud',
    evidence: { summary: 'Verified transaction was legitimate' },
    metadata: { priority: 'medium' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  }
]

// Default tenant for demo (from seed)
const DEMO_TENANT_ID = "bb62d990-23c8-486e-b7ac-736611c2427b"

export function DisputesContent() {
  const isMockMode = useMockData()
  const { getApiBaseUrl } = useDataSource()
  const [disputes, setDisputes] = useState<Dispute[]>(isMockMode ? MOCK_DISPUTES : [])
  const [loading, setLoading] = useState(!isMockMode)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")

  // Fetch disputes from API (only if not in mock mode)
  useEffect(() => {
    if (isMockMode) {
      setDisputes(MOCK_DISPUTES)
      setLoading(false)
      return
    }

    async function fetchDisputes() {
      try {
        setLoading(true)
        const baseUrl = getApiBaseUrl()
        const url = baseUrl ? `${baseUrl}/api/disputes?tenantId=${DEMO_TENANT_ID}` : `/api/disputes?tenantId=${DEMO_TENANT_ID}`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Failed to fetch disputes: ${res.status}`)
        }
        const json = await res.json()
        setDisputes(json.data || [])
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchDisputes()
  }, [isMockMode, getApiBaseUrl])

  // Calculate stats
  const totalDisputes = disputes.length
  const pendingResolution = disputes.filter((d) => d.status === "open" || d.status === "under_review").length
  const resolved = disputes.filter((d) => d.status === "won" || d.status === "lost" || d.status === "closed").length
  const openDisputeAmount = disputes
    .filter((d) => d.status === "open" || d.status === "under_review")
    .reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0)

  // Filter disputes
  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dispute.external_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dispute.reason || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter
    const matchesCustomer = customerFilter === "all" || dispute.customer_id === customerFilter
    return matchesSearch && matchesStatus && matchesCustomer
  })

  // Get unique customers for filter
  const customers = [...new Set(disputes.map((d) => d.customer_id).filter(Boolean))] as string[]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="border border-destructive rounded-lg p-4 text-destructive">
          Error loading disputes: {error}
        </div>
      </div>
    )
  }

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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
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
              <TableHead>Dispute ID</TableHead>
              <TableHead>External ID</TableHead>
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
                  <TableCell className="font-mono text-xs">{dispute.id.slice(0, 8)}...</TableCell>
                  <TableCell>{dispute.external_id || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{dispute.customer_id ? `${dispute.customer_id.slice(0, 8)}...` : "-"}</TableCell>
                  <TableCell>{dispute.reason || "-"}</TableCell>
                  <TableCell>
                    <span className={`text-xs border rounded px-2 py-1 ${
                      dispute.status === "open" ? "border-yellow-500 text-yellow-600" :
                      dispute.status === "won" ? "border-green-500 text-green-600" :
                      dispute.status === "lost" ? "border-red-500 text-red-600" :
                      "border-border"
                    }`}>
                      {dispute.status}
                    </span>
                  </TableCell>
                  <TableCell>${parseFloat(dispute.amount).toFixed(2)} {dispute.currency}</TableCell>
                  <TableCell>{new Date(dispute.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
