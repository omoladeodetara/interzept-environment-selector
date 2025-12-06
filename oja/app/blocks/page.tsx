"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { WorkspaceProvider } from "@/contexts/workspace-context"
import { ArrowRight, Mic, Search, Table, CreditCard, Code, Settings2, MoreVertical, ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const styleChips = [
  "Customer contacts table",
  "Recent orders table",
  "Payments summary card",
  "Invoice status overview",
  "Top 5 events by count chart",
  "Payment types breakdown",
]

const blocks = [
  {
    id: "usage-table",
    icon: Table,
    badge: "Paid",
    title: "Usage table",
    description: "Track and monitor all agent usage with detailed usage summaries and event tracking.",
  },
  {
    id: "invoice-table",
    icon: CreditCard,
    badge: "Paid",
    title: "Invoice table",
    description: "Comprehensive invoice management with PDF preview, download, and payment status tracking.",
  },
  {
    id: "payments-table",
    icon: CreditCard,
    badge: "Paid",
    title: "Payments table",
    description: "Complete payment history and transaction management with detailed financial records.",
  },
  {
    id: "container",
    icon: Settings2,
    badge: "Paid",
    title: "Container",
    description: "Flexible container component for organizing and grouping related content.",
  },
  {
    id: "pricing-calculator",
    icon: Code,
    badge: "Personal",
    title: "Pricing Calculator",
    description: "Interactive pricing calculator with usage sliders and cost breakdown.",
    hasMenu: true,
  },
]

export default function BlocksPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "Paid" | "Personal">("all")

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch =
      block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === "all" || block.badge === filter
    return matchesSearch && matchesFilter
  })

  const handleGenerateBlock = () => {
    if (prompt.trim()) {
      router.push(`/generate-block?prompt=${encodeURIComponent(prompt)}`)
    }
  }

  const handleChipClick = (chip: string) => {
    setPrompt(chip)
  }

  const handleBlockClick = (blockId: string) => {
    router.push(`/generate-block?block=${blockId}`)
  }

  return (
    <WorkspaceProvider>
    <div className="flex h-screen bg-white">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Blocks</span>
        </div>

        {/* Main Content */}
        <div className="px-6 py-12">
          {/* Hero Section */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">Ask Paid to build your next block</h1>
            <p className="mb-8 text-sm text-gray-500">Describe what you need — Paid does the rest</p>

            {/* Prompt Input */}
            <div className="relative mb-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Build a block..."
                className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-4 pr-24 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleGenerateBlock}
                  disabled={!prompt.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Style Chips */}
            <div className="mb-12 flex flex-wrap justify-center gap-2">
              {styleChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks List Section */}
          <div className="mx-auto max-w-6xl">
            {/* Filter and Search */}
            <div className="mb-6 flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {filter === "all" ? "All" : filter}
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600">
                    {filteredBlocks.length}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("Paid")}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("Personal")}>Personal</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-64 pl-9"
                />
              </div>
            </div>

            {/* Blocks Grid */}
            {filteredBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No blocks found</h3>
                <p className="mb-6 text-sm text-gray-500">
                  No blocks match "{searchQuery}". Try adjusting your search terms.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilter("all")
                  }}
                  className="rounded-full"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="group relative flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
                    onClick={() => handleBlockClick(block.id)}
                  >
                    {/* Icon and Badge */}
                    <div className="mb-4 flex items-center gap-2">
                      <block.icon className="h-5 w-5 text-gray-500" />
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                          block.badge === "Paid"
                            ? "border-gray-200 bg-white text-gray-600"
                            : "border-gray-200 bg-white text-gray-600"
                        }`}
                      >
                        {block.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-base font-semibold text-gray-900">{block.title}</h3>

                    {/* Description */}
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">{block.description}</p>

                    {/* Arrow */}
                    <div className="flex items-center justify-end">
                      {block.hasMenu ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-900" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </WorkspaceProvider>
  )
}
