"use client"

import Link from "next/link"
import { ArrowUpRight, Bot, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NewAgentContent() {
  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-16">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
          Agents
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <span>New</span>
      </div>

      {/* Configure Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-semibold mb-2">Configure your agent</h1>
        <p className="text-muted-foreground">
          Define trackable activities and pricing rules to start monetizing your AI agent.
        </p>
      </div>

      {/* Option Cards */}
      <div className="flex justify-center gap-6">
        {/* Ask Paid Card */}
        <Link
          href="/agents/new/ask-paid"
          className="group flex flex-col w-[320px] p-6 border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
              <Bot className="h-4 w-4 text-amber-600" />
            </div>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>

          <h3 className="text-lg font-semibold mb-2">Ask Paid</h3>
          <p className="text-sm text-muted-foreground flex-1">
            Use natural language to define activities and outcomes for your agent.
          </p>

          <div className="flex justify-end mt-6">
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>

        {/* Manual Setup Card */}
        <Link
          href="/agents/new/manual"
          className="group flex flex-col w-[320px] p-6 border border-border rounded-lg hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-lg">
              <Menu className="h-4 w-4 text-amber-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Manual setup</h3>
          <p className="text-sm text-muted-foreground flex-1">
            Manually define the activities and outcomes for your AI agent.
          </p>

          <div className="flex justify-end mt-6">
            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  )
}
