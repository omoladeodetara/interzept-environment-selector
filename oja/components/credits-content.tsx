"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreditsContent() {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const creditBundles = [
    {
      id: "1",
      name: "Crefite",
      description: "",
      status: "Draft",
      createdAt: "Dec 6, 2025",
    },
  ]

  const filteredBundles =
    filter === "all" ? creditBundles : creditBundles.filter((b) => b.status.toLowerCase() === filter)
  const totalCount = creditBundles.length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-muted-foreground">|</span>
          <h1 className="text-lg font-medium">Credits</h1>
        </div>
        <Button onClick={() => router.push("/credits/new")} className="bg-zinc-900 hover:bg-zinc-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm"
          >
            <span>{filter === "all" ? "All" : filter === "active" ? "Active" : "Draft"}</span>
            <span className="bg-muted px-1.5 py-0.5 rounded text-xs">{totalCount}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setFilter("all")
                  setIsDropdownOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              >
                All
              </button>
              <button
                onClick={() => {
                  setFilter("active")
                  setIsDropdownOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              >
                Active
              </button>
              <button
                onClick={() => {
                  setFilter("draft")
                  setIsDropdownOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              >
                Draft
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredBundles.length > 0 ? (
        <div className="border-t border-border">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 py-3 text-sm text-muted-foreground border-b border-border">
            <div>Name</div>
            <div>Description</div>
            <div>Status</div>
            <div>Created at</div>
          </div>

          {/* Table Rows */}
          {filteredBundles.map((bundle) => (
            <div
              key={bundle.id}
              className="grid grid-cols-4 gap-4 py-3 text-sm border-b border-border hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push(`/credits/${bundle.id}`)}
            >
              <div className="text-primary font-medium">{bundle.name}</div>
              <div className="text-muted-foreground">{bundle.description || ""}</div>
              <div>
                <span className="px-2 py-1 border border-border rounded text-xs">{bundle.status}</span>
              </div>
              <div className="font-mono text-muted-foreground">{bundle.createdAt}</div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-border rounded-lg p-16 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold mb-2">No credit bundles available</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create a credit bundle to begin managing pricing, availability, and usage.
          </p>
          <Button variant="outline" onClick={() => router.push("/credits/new")}>
            Create credit bundle
          </Button>
        </div>
      )}
    </div>
  )
}
