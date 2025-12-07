"use client"

import { useState } from "react"
import { useDataSource, DataSourceMode } from "@/lib/data-source"
import { Database, TestTube2, Globe, Server, Building2, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const MODE_CONFIGS: Record<DataSourceMode, { icon: any; label: string; description: string; color?: string }> = {
  mock: { icon: TestTube2, label: 'Mock', description: 'Static test data', color: 'text-purple-400' },
  local: { icon: Database, label: 'Local', description: 'Local Supabase', color: 'text-blue-400' },
  dev: { icon: Server, label: 'Dev', description: 'Preview environment', color: 'text-green-400' },
  uat: { icon: Building2, label: 'UAT', description: 'Main branch', color: 'text-amber-400' },
  production: { icon: Globe, label: 'Production', description: 'Release branch', color: 'text-red-400' },
}

export function DataSourceToggle() {
  const { selectedSources, toggleSource, canShowToggle, isProductionReadOnly } = useDataSource()
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't render if feature flag is disabled (e.g., in production)
  if (!canShowToggle) {
    return null
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 flex w-full items-center justify-between whitespace-nowrap px-2 text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-400"
      >
        <div className="flex items-center gap-2">
          <span>Data Sources</span>
          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
            Internal
          </span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
      </button>
      
      {isExpanded && (
        <ul className="space-y-1">
          {Object.entries(MODE_CONFIGS).map(([key, config]) => {
            const Icon = config.icon
            const isSelected = selectedSources.includes(key as DataSourceMode)
            
            return (
              <li key={key}>
                <button
                  onClick={() => toggleSource(key as DataSourceMode)}
                  disabled={isProductionReadOnly && key === 'production'}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isProductionReadOnly && key === 'production' ? 'Production is read-only' : undefined}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isSelected && config.color)} />
                  <div className="flex-1 text-left">
                    <div className="whitespace-nowrap">{config.label}</div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      
      {selectedSources.length > 1 && (
        <div className="mt-2 px-2">
          <span className="text-xs text-gray-500">
            {selectedSources.length} selected
          </span>
        </div>
      )}
    </div>
  )
}
