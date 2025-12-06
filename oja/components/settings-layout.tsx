"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Key, Users, Building2, BookOpen, Puzzle, Receipt, CreditCard, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsNavItems = [
  { name: "API Keys", icon: Key, href: "/settings/api-keys" },
  { name: "Team", icon: Users, href: "/settings/team" },
  { name: "Company", icon: Building2, href: "/settings/company" },
  { name: "Sales playbook", icon: BookOpen, href: "/settings/sales-playbook", beta: true },
  { name: "Integrations", icon: Puzzle, href: "/settings/integrations" },
  { name: "Tax", icon: Receipt, href: "/settings/tax" },
  { name: "Billing", icon: CreditCard, href: "/settings/billing" },
  { name: "Value receipts", icon: FileText, href: "/settings/value-receipts" },
]

interface SettingsLayoutProps {
  children: ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Settings Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-[#1a1a1a] text-white">
        <div className="flex flex-col h-full">
          {/* Back Header */}
          <Link
            href="/agents"
            className="flex items-center gap-2 px-4 py-4 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold">Settings</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">Settings</p>
            <ul className="space-y-1">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                        isActive ? "bg-[#2a2a2a] text-white" : "text-gray-300 hover:bg-[#2a2a2a] hover:text-white",
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.name}</span>
                      {item.beta && (
                        <span className="ml-auto whitespace-nowrap rounded bg-[#3a3a3a] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                          Beta
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">{children}</main>
    </div>
  )
}
