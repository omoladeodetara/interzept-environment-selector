"use client"

import { useState } from "react"
import { Button } from '@lastprice/ui'
import { Download, Plus, X } from "lucide-react"
import Link from "next/link"

const tabs = ["Invoices", "Credit notes", "Value receipts"]

export function InvoicesContent() {
  const [activeTab, setActiveTab] = useState("Invoices")
  const [showExportModal, setShowExportModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["ID", "Number", "Customer ID", "Invoice total"])

  const exportColumns = [
    "ID",
    "Number",
    "Display number",
    "Customer ID",
    "Status",
    "Payment status",
    "Source",
    "Issue date",
    "Due date",
    "Currency",
    "Tax amount",
    "Invoice total excluding tax",
    "Invoice total",
    "Amount due",
    "Amount paid",
    "Amount remaining",
    "Credit notes total",
    "Invoice lines (JSON)",
  ]

  const handleExport = () => {
    setShowExportModal(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const toggleSelectAll = () => {
    if (selectedColumns.length === exportColumns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns([...exportColumns])
    }
  }

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "Invoices":
        return {
          title: "No invoices yet",
          subtitle: "Invoices will appear here once you've started billing your customers.",
        }
      case "Credit notes":
        return {
          title: "No credit notes yet",
          subtitle: "Credit notes will appear here once you've issued any.",
        }
      case "Value receipts":
        return {
          title: "No value receipts yet",
          subtitle: "Value receipts will appear here once generated.",
        }
      default:
        return { title: "No data", subtitle: "" }
    }
  }

  const emptyState = getEmptyStateMessage()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
          <h1 className="text-lg font-semibold">Invoices</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
        <h3 className="font-semibold text-lg mb-2">{emptyState.title}</h3>
        <p className="text-muted-foreground text-sm">{emptyState.subtitle}</p>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Export invoices</h2>
              <button onClick={() => setShowExportModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select the columns you want to include in the CSV export
            </p>

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColumns.length === exportColumns.length}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
                <span className="text-sm">Select all</span>
              </label>
              <span className="text-sm text-muted-foreground">
                {selectedColumns.length} of {exportColumns.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
              {exportColumns.map((column) => (
                <label key={column} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => toggleColumn(column)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{column}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>Export</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg px-4 py-3 shadow-lg z-50">
          <p className="text-sm font-medium">Invoices exported successfully</p>
        </div>
      )}
    </div>
  )
}
