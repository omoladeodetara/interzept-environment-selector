"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TestModeBanner } from "@/components/test-mode-banner"
import { WorkspaceProvider } from "@/contexts/workspace-context"
import { PanelLeftClose, PanelLeft } from "lucide-react"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-background">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <main className="flex flex-1 flex-col overflow-auto">
          <TestModeBanner />
          <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4 text-gray-600" />
              ) : (
                <PanelLeftClose className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-900">Home</span>
          </header>
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  )
}
