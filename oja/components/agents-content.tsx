"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from '@lastprice/ui'
import { Checkbox } from '@lastprice/ui'
import { Label } from '@lastprice/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { Download, Plus, X, MoreHorizontal } from "lucide-react"

const exportColumns = [
  { id: "id", label: "ID", defaultChecked: true },
  { id: "name", label: "Name", defaultChecked: true },
  { id: "description", label: "Description", defaultChecked: true },
  { id: "status", label: "Status", defaultChecked: true },
  { id: "external_id", label: "External ID", defaultChecked: true },
  { id: "created_at", label: "Created at", defaultChecked: true },
]

const statusOptions = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
]

export function AgentsContent() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("live")
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    exportColumns.filter((c) => c.defaultChecked).map((c) => c.id),
  )

  const [agents] = useState([
    {
      id: "ai-sdk-chatbot",
      name: "ai-sdk-chatbot",
      description: "A chatbot",
      status: "Live",
      externalId: "ai-sdk-chatbot-id",
      createdAt: "Dec 5, 2025",
    },
  ])

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

  const filteredAgents = agents.filter((agent) => {
    if (statusFilter === "all") return true
    return agent.status.toLowerCase() === statusFilter.toLowerCase()
  })

  const getStatusCount = (status: string) => {
    if (status === "all") return agents.length
    return agents.filter((a) => a.status.toLowerCase() === status.toLowerCase()).length
  }

  const currentStatusLabel = statusOptions.find((s) => s.value === statusFilter)?.label || "All"
  const currentCount = getStatusCount(statusFilter)

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
          <h1 className="text-lg font-medium">Agents</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button asChild className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white">
            <Link href="/agents/new">
              <Plus className="h-4 w-4" />
              Create agent
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter - Updated to show current status label and count */}
      <div className="flex items-center gap-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <span className="flex items-center gap-2">
                {currentStatusLabel}
                <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-medium">
                  {currentCount}
                </span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold mb-2">No agents available</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add an agent to help automate workflows or trigger actions based on data.
          </p>
          <Button variant="outline" asChild>
            <Link href="/agents/new">Add agent</Link>
          </Button>
        </div>
      ) : (
        /* Table */
        <div className="border border-border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">External ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created at</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                  <td className="p-4">
                    <span className="text-sm">{agent.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{agent.description}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs border border-border rounded px-2 py-1">{agent.status}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-mono text-muted-foreground">{agent.externalId}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{agent.createdAt}</td>
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
      )}

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-start justify-between">
            <div>
              <DialogTitle>Export agents</DialogTitle>
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
    </div>
  )
}
