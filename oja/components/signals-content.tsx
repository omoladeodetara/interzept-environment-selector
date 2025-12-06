"use client"

import { useState } from "react"
import { BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function SignalsContent() {
  const [rawSignalsView, setRawSignalsView] = useState(false)
  const [timeRange, setTimeRange] = useState("last-24h")
  const [agent, setAgent] = useState("all")
  const [customer, setCustomer] = useState("all")
  const [eventFilter, setEventFilter] = useState("all-events")

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold">Signals</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={rawSignalsView} onCheckedChange={setRawSignalsView} />
            <span className="text-sm font-medium">Raw signals</span>
          </div>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {rawSignalsView ? (
        // Raw Signals Table View
        <RawSignalsView />
      ) : (
        // Dashboard View
        <DashboardView
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          agent={agent}
          setAgent={setAgent}
          customer={customer}
          setCustomer={setCustomer}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
        />
      )}
    </div>
  )
}

function DashboardView({
  timeRange,
  setTimeRange,
  agent,
  setAgent,
  customer,
  setCustomer,
  eventFilter,
  setEventFilter,
}: {
  timeRange: string
  setTimeRange: (value: string) => void
  agent: string
  setAgent: (value: string) => void
  customer: string
  setCustomer: (value: string) => void
  eventFilter: string
  setEventFilter: (value: string) => void
}) {
  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-24h">Last 24h</SelectItem>
            <SelectItem value="last-7d">Last 7 days</SelectItem>
            <SelectItem value="last-30d">Last 30 days</SelectItem>
            <SelectItem value="last-90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            <SelectItem value="agent-1">Agent 1</SelectItem>
            <SelectItem value="agent-2">Agent 2</SelectItem>
          </SelectContent>
        </Select>

        <Select value={customer} onValueChange={setCustomer}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All customers</SelectItem>
            <SelectItem value="customer-1">Customer 1</SelectItem>
            <SelectItem value="customer-2">Customer 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">TOTAL EVENTS</p>
          <p className="text-2xl font-semibold font-mono">0</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">EVENT TYPES</p>
          <p className="text-2xl font-semibold font-mono">0</p>
        </div>
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">PERIOD</p>
            <p className="text-2xl font-semibold font-mono">Last 24h</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
          >
            Go live
          </Button>
        </div>
      </div>

      {/* Events Overview Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Events overview</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Event</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right">Expand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-32">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground">No event data available.</p>
                    <p className="text-sm text-muted-foreground">Expand a row to preview parameter insights.</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Event Distribution */}
        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="font-semibold">Event distribution</h3>
            <p className="text-xs text-muted-foreground">Last 24h · All agents · All customers</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>

        {/* Top 5 Customers */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Top 5 customers by volume</h3>
              <p className="text-xs text-muted-foreground">Last 24h · All agents · All customers</p>
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-events">All events</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Event Volume - Last 24 hours */}
        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="font-semibold">Event volume - Last 24 hours</h3>
            <p className="text-xs text-muted-foreground">All agents · All customers</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>

        {/* Event Volume - Last 30 days */}
        <div className="border rounded-lg p-4">
          <div className="mb-4">
            <h3 className="font-semibold">Event volume - Last 30 days</h3>
            <p className="text-xs text-muted-foreground">All agents · All customers</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>
    </>
  )
}

function RawSignalsView() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ATTRIBUTED</TableHead>
            <TableHead>TIMESTAMP</TableHead>
            <TableHead>AGENT ID</TableHead>
            <TableHead>EVENT NAME</TableHead>
            <TableHead>CUSTOMER ID</TableHead>
            <TableHead>COSTS</TableHead>
            <TableHead>PROPERTIES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="h-64">
              <div className="flex flex-col items-center justify-center text-center">
                {/* Signal Icon */}
                <div className="mb-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-amber-500">
                    <path d="M4 20L4 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 20L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 20L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 20L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-medium">No signals available</p>
                <p className="text-sm text-muted-foreground">Signals will appear here once you record them.</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
