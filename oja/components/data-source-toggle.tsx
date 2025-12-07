"use client"

import { useDataSource, DataSourceMode } from "@/lib/data-source"
import { Database, TestTube2, Globe, Server, Building2, ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@lastprice/ui'

const MODE_CONFIGS: Record<DataSourceMode, { icon: any; label: string; color?: string }> = {
  mock: { icon: TestTube2, label: 'Mock', color: 'text-purple-400' },
  local: { icon: Database, label: 'Local', color: 'text-blue-400' },
  dev: { icon: Server, label: 'Dev', color: 'text-green-400' },
  uat: { icon: Building2, label: 'UAT', color: 'text-amber-400' },
  production: { icon: Globe, label: 'Prod', color: 'text-red-400' },
}

export function DataSourceToggle() {
  const { selectedSources, toggleSource } = useDataSource()

  return (
    <div className="px-3 pb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 w-full hover:bg-[#2a2a2a] transition-colors rounded-lg border border-[#2a2a2a]">
            <div className="flex items-center gap-2 flex-1">
              {selectedSources.length === 1 ? (
                <>
                  {(() => {
                    const Icon = MODE_CONFIGS[selectedSources[0]].icon
                    return <Icon className="h-4 w-4 flex-shrink-0" />
                  })()}
                  <span className="text-sm whitespace-nowrap">{MODE_CONFIGS[selectedSources[0]].label}</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">{selectedSources.length} sources</span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Data Sources
          </DropdownMenuLabel>
          {Object.entries(MODE_CONFIGS).map(([key, config]) => {
            const Icon = config.icon
            const isSelected = selectedSources.includes(key as DataSourceMode)
            
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => toggleSource(key as DataSourceMode)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isSelected ? '' : config.color}`} />
                  <span>{config.label}</span>
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            )
          })}
          
          {selectedSources.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <span className="text-xs text-muted-foreground">
                  {selectedSources.length} sources selected - data will be merged
                </span>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
