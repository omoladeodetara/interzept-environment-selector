"use client"

import { useState } from "react"
import {
  Search,
  Calendar,
  Layers,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
  Check,
} from "lucide-react"
import { Button } from '@lastprice/ui'
import { Input } from '@lastprice/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lastprice/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@lastprice/ui'

export function CostsContent() {
  const [timeRange, setTimeRange] = useState("last-month")
  const [searchQuery, setSearchQuery] = useState("")

  const [dateTab, setDateTab] = useState<"preset" | "custom">("preset")
  const [startDate, setStartDate] = useState("2025-11-06")
  const [endDate, setEndDate] = useState("2025-12-06")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)

  const [columnsOpen, setColumnsOpen] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["Model"])

  const columnOptions = [
    { name: "Model", hasSubmenu: false },
    { name: "Vendor", hasSubmenu: false },
    { name: "Agent", hasSubmenu: false },
    { name: "Customer", hasSubmenu: false },
    { name: "Metadata", hasSubmenu: true },
  ]

  const filterCategories = [
    { name: "Agent", values: ["ai-sdk-chatbot", "support-agent", "sales-agent"] },
    { name: "Customer", values: ["customer-1", "customer-2", "customer-3"] },
    { name: "Metadata", values: ["production", "staging", "development"] },
  ]

  const presetOptions = [
    { label: "Last 1 day", days: 1 },
    { label: "Last 3 days", days: 3 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 14 days", days: 14 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ]

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatDateInput = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`
  }

  const handlePresetSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
    setDatePickerOpen(false)
  }

  const handleFilterToggle = (value: string) => {
    setSelectedFilters((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]))
  }

  const handleUnselectAll = () => {
    setSelectedFilters([])
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const handleUnselectAllColumns = () => {
    setSelectedColumns([])
  }

  const stats = [
    {
      label: "REVENUE",
      value: "€0",
      subtitle: "LAST MONTH",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "COST",
      value: "€0",
      subtitle: "LAST MONTH",
      badge: { value: "↗ 0", color: "text-emerald-600 bg-emerald-50" },
    },
    {
      label: "MARGIN",
      value: "0.00%",
      subtitle: "LAST MONTH",
      badge: { value: "↗ 0.00%", color: "text-amber-600 bg-amber-50" },
    },
    {
      label: "HVE",
      value: "€0",
      subtitle: "LAST MONTH",
      badge: { value: "↗ 0", color: "text-emerald-600 bg-emerald-50" },
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <svg
          className="h-5 w-5 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="text-muted-foreground">|</span>
        <h1 className="text-lg font-medium">Costs breakdown</h1>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-week">Last week</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
            <SelectItem value="last-quarter">Last quarter</SelectItem>
            <SelectItem value="last-year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              {stat.icon && stat.icon}
              {stat.badge && (
                <span className={`text-xs px-2 py-0.5 rounded ${stat.badge.color}`}>{stat.badge.value}</span>
              )}
            </div>
            <div className="text-2xl font-semibold mb-2">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Breakdown Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Breakdown</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[180px]"
              />
            </div>

            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  {formatDateDisplay(startDate)} - {formatDateDisplay(endDate)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0" align="end">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${dateTab === "preset" ? "border-b-2 border-foreground" : "text-muted-foreground"}`}
                    onClick={() => setDateTab("preset")}
                  >
                    Preset
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${dateTab === "custom" ? "border-b-2 border-foreground" : "text-muted-foreground"}`}
                    onClick={() => setDateTab("custom")}
                  >
                    Custom
                  </button>
                </div>

                {dateTab === "preset" ? (
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {presetOptions.map((option) => (
                      <button
                        key={option.days}
                        className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted/50 text-left"
                        onClick={() => handlePresetSelect(option.days)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Start date</label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={formatDateInput(startDate)}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pr-10"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">End date</label>
                        <div className="relative">
                          <Input
                            type="text"
                            value={formatDateInput(endDate)}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pr-10"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDatePickerOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setDatePickerOpen(false)}>Apply</Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Layers className="h-4 w-4" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-0" align="end">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b border-border"
                  onClick={handleUnselectAllColumns}
                >
                  Unselect all
                </button>
                {columnOptions.map((column) => (
                  <button
                    key={column.name}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => handleColumnToggle(column.name)}
                  >
                    <span>{column.name}</span>
                    <div className="flex items-center gap-1">
                      {selectedColumns.includes(column.name) && <Check className="h-4 w-4" />}
                      {column.hasSubmenu && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <div className="flex">
                  {/* Filter values list */}
                  <div className="w-1/2 border-r border-border p-2">
                    <div className="text-xs text-muted-foreground px-2 py-1">No value</div>
                    {selectedFilters.length > 0 ? (
                      selectedFilters.map((filter) => (
                        <div key={filter} className="text-sm px-2 py-1">
                          {filter}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm px-2 py-1">ai-sdk-chatbot</div>
                    )}
                  </div>

                  {/* Filter categories */}
                  <div className="w-1/2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b border-border"
                      onClick={handleUnselectAll}
                    >
                      Unselect all
                    </button>
                    {filterCategories.map((category) => (
                      <button
                        key={category.name}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                        onClick={() => setExpandedFilter(expandedFilter === category.name ? null : category.name)}
                      >
                        {category.name}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                {selectedColumns.includes("Model") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Model</th>
                )}
                {selectedColumns.includes("Vendor") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Traces</th>
                )}
                {selectedColumns.includes("Agent") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Total cost</th>
                )}
                {selectedColumns.includes("Customer") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Vendor</th>
                )}
                {selectedColumns.includes("Metadata") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Cost</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={selectedColumns.length} className="px-4 py-4 text-sm text-muted-foreground">
                  No results
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Traces Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Traces</h2>
            <span className="text-sm text-muted-foreground">Page 1</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Traces Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                {selectedColumns.includes("Model") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Model name</th>
                )}
                {selectedColumns.includes("Vendor") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Trace name</th>
                )}
                {selectedColumns.includes("Agent") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Vendor</th>
                )}
                {selectedColumns.includes("Customer") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Cost</th>
                )}
                {selectedColumns.includes("Metadata") && (
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Timestamp</th>
                )}
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={selectedColumns.length} className="px-4 py-4 text-sm text-muted-foreground">
                  No results
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
