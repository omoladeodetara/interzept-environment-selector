import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"

const workflows = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14L6 6L10 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 14L11 6L15 14" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14L16 6L20 14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cost tracing",
    description: "Trace how much your agent is spending on model providers.",
    href: "/cost-tracing",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="6" cy="10" r="3" stroke="#3B82F6" strokeWidth="2" />
        <path d="M9 10H14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 7L17 10L14 13" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Event tracking",
    description: "Track agent usage on a customer level.",
    href: "/event-tracking",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="#EC4899" strokeWidth="2" />
        <path d="M10 3V7" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 13V17" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 10H7" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 10H17" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Monetization",
    description: "Instantly monetize your agent or application",
    href: "/monetization",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="2" />
        <rect x="12" y="3" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="2" />
        <rect x="3" y="12" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="2" />
        <rect x="12" y="12" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="2" />
      </svg>
    ),
    title: "Build with blocks",
    description: "Prove the value of your agent. Generate customer-specific web components with live data.",
    href: "/blocks",
  },
]

export function GetStartedContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">How would you like to start?</h1>
        <p className="text-sm text-gray-500">Select a workflow to begin exploring Paid&apos;s capabilities</p>
      </div>

      {/* Workflow Cards */}
      <div className="mb-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {workflows.map((workflow) => (
          <Link
            key={workflow.title}
            href={workflow.href}
            className="group flex flex-col rounded-lg border border-gray-200 bg-white p-5 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center">{workflow.icon}</span>
              <span className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                Beta
              </span>
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">{workflow.title}</h3>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">{workflow.description}</p>
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
                View
              </span>
              <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-900" />
            </div>
          </Link>
        ))}
      </div>

      {/* Skip Link */}
      <Link href="/" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
        Skip
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
