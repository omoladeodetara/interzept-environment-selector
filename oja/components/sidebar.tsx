"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Home,
  Monitor,
  Bot,
  BarChart3,
  Users,
  ShoppingCart,
  FileText,
  DollarSign,
  TrendingUp,
  Gift,
  Scale,
  LayoutGrid,
  ExternalLink,
  PlayCircle,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from '@lastprice/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lastprice/ui'
import { Dialog, DialogContent } from '@lastprice/ui'
import { useWorkspace } from "@/contexts/workspace-context"
import { DataSourceToggle } from "@/components/data-source-toggle"

const teams = [{ id: "zyleme", name: "Zyleme", isActive: true }]

const sandboxes = [{ id: "test-zyleme", name: "[TEST] Zyleme", isActive: false }]

const workspaceItems = [
  { name: "Agents", icon: Bot, href: "/agents" },
  { name: "Signals", icon: BarChart3, href: "/signals", hasAccent: true },
  { name: "Customers", icon: Users, href: "/customers" },
  { name: "Orders", icon: ShoppingCart, href: "/orders" },
  { name: "Invoices", icon: FileText, href: "/invoices" },
]

const operationsItems = [
  { name: "Payments", icon: DollarSign, href: "/payments" },
  { name: "Costs", icon: TrendingUp, href: "/costs" },
  { name: "Credits", icon: Gift, href: "/credits" },
  { name: "Disputes", icon: Scale, href: "/disputes", beta: true },
]

const launchpadItems = [{ name: "Blocks", icon: LayoutGrid, href: "/blocks", beta: true }]

const developerItems = [{ name: "Developers", icon: ExternalLink, href: "/developers" }]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"home" | "monitor">("home")
  const [isHovered, setIsHovered] = useState(false)
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace()
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchingTo, setSwitchingTo] = useState("")

  const isExpanded = !collapsed || isHovered

  const handleWorkspaceSwitch = (type: "team" | "sandbox", id: string, name: string) => {
    if (selectedWorkspace.id === id && selectedWorkspace.type === type) return

    setSwitchingTo(name)
    setIsSwitching(true)

    setTimeout(() => {
      setSelectedWorkspace({ type, id, name })
      setIsSwitching(false)
      setSwitchingTo("")
    }, 1500)
  }

  return (
    <div className="flex">
      <Dialog
        open={isSwitching}
        onOpenChange={(open) => {
          if (!open) {
            setIsSwitching(false)
            setSwitchingTo("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <button
            onClick={() => {
              setIsSwitching(false)
              setSwitchingTo("")
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <RefreshCw className="h-6 w-6 text-gray-600 animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Switching organization</h2>
            <p className="mt-1 text-sm text-gray-500">Switching to {switchingTo} ...</p>
          </div>
        </DialogContent>
      </Dialog>

      <aside
        onMouseEnter={() => collapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex flex-col bg-[#1a1a1a] text-white transition-all duration-300",
          isExpanded ? "w-56" : "w-0 overflow-hidden",
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-4 w-full hover:bg-[#2a2a2a] transition-colors">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="whitespace-nowrap font-semibold">{selectedWorkspace.name}</span>
              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Teams</DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleWorkspaceSwitch("team", team.id, team.name)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>{team.name}</span>
                </div>
                {selectedWorkspace.id === team.id && selectedWorkspace.type === "team" && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Sandboxes</DropdownMenuLabel>
            {sandboxes.map((sandbox) => (
              <DropdownMenuItem
                key={sandbox.id}
                onClick={() => handleWorkspaceSwitch("sandbox", sandbox.id, sandbox.name)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>{sandbox.name}</span>
                </div>
                {selectedWorkspace.id === sandbox.id && selectedWorkspace.type === "sandbox" && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-3 mb-4 flex rounded-lg bg-[#2a2a2a] p-1">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md py-2 transition-colors",
              activeTab === "home" ? "bg-[#3a3a3a]" : "hover:bg-[#333]",
            )}
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("monitor")}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md py-2 transition-colors",
              activeTab === "monitor" ? "bg-[#3a3a3a]" : "hover:bg-[#333]",
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <div className="mb-6">
            <p className="mb-2 whitespace-nowrap px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Workspace
            </p>
            <ul className="space-y-1">
              {workspaceItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", item.hasAccent && "text-orange-400")} />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <p className="mb-2 whitespace-nowrap px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Operations
            </p>
            <ul className="space-y-1">
              {operationsItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{item.name}</span>
                    {item.beta && (
                      <span className="ml-auto whitespace-nowrap rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                        Beta
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <p className="mb-2 whitespace-nowrap px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Launchpad
            </p>
            <ul className="space-y-1">
              {launchpadItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span className="whitespace-nowrap">{item.name}</span>
                    {item.beta && (
                      <span className="ml-auto whitespace-nowrap rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                        Beta
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Data Source Toggle */}
        <div className="px-3 pb-4">
          <DataSourceToggle />
        </div>

        {/* User Profile */}
        <div className="border-t border-[#2a2a2a] p-3"
          <Link
            href="/documentation"
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Documentation</span>
          </Link>
          <Link
            href="/developers"
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Developers</span>
          </Link>
          <Link
            href="/get-started"
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white"
          >
            <PlayCircle className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Onboarding</span>
            <span className="ml-auto whitespace-nowrap rounded bg-[#2a2a2a] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              Beta
            </span>
          </Link>
        </div>

        <div className="border-t border-[#2a2a2a] px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#2a2a2a] transition-colors">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="/diverse-avatars.png" />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">OO</AvatarFallback>
                </Avatar>
                <span className="whitespace-nowrap text-sm text-gray-300">Omolade Odetara</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-64 mb-2">
              <div className="flex items-center gap-3 px-2 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/diverse-avatars.png" />
                  <AvatarFallback className="bg-purple-600 text-white text-sm">OO</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Omolade Odetara</span>
                  <span className="text-xs text-muted-foreground">omoladeodetara@gmail.com</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Feedback</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {activeTab === "monitor" && isExpanded && (
        <div className="flex w-64 flex-col border-r border-[#2a2a2a] bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                All
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xs text-gray-500">0 unread</span>
              <button className="text-xs text-gray-400 hover:text-gray-600">Mark all as read</button>
              <button className="text-xs text-gray-400 hover:text-gray-600">Archive all</button>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-gray-900">No notifications yet</p>
            <p className="mt-1 text-xs text-gray-500">We'll let you know when we've got something new for you.</p>
          </div>
        </div>
      )}
    </div>
  )
}
