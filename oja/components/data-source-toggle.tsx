"use client"

import { useDataSource, DataSourceMode } from "@/lib/data-source"
import { Button } from "@lastprice/ui"
import { Database, TestTube2, Globe, Server, Building2 } from "lucide-react"

const MODE_CONFIGS: Record<DataSourceMode, { icon: any; label: string; color?: string }> = {
  mock: { icon: TestTube2, label: 'Mock', color: 'text-purple-400' },
  local: { icon: Database, label: 'Local', color: 'text-blue-400' },
  dev: { icon: Server, label: 'Dev', color: 'text-green-400' },
  uat: { icon: Building2, label: 'UAT', color: 'text-amber-400' },
  production: { icon: Globe, label: 'Prod', color: 'text-red-400' },
}

export function DataSourceToggle() {
  const { mode, setMode } = useDataSource()

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border rounded-lg bg-background">
      <span className="text-xs text-muted-foreground font-medium">Data Source</span>
      <div className="grid grid-cols-3 gap-1">
        {Object.entries(MODE_CONFIGS).map(([key, config]) => {
          const Icon = config.icon
          const isActive = mode === key
          return (
            <Button
              key={key}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 gap-1 text-xs ${isActive ? '' : 'hover:bg-accent'}`}
              onClick={() => setMode(key as DataSourceMode)}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? '' : config.color}`} />
              {config.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
