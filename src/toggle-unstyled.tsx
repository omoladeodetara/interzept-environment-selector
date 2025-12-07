"use client"

import { useState, memo } from "react"
import { useDataSource, DataSourceMode } from "./context"
import { Database, TestTube2, Globe, Server, Building2, ChevronDown, Check } from "lucide-react"
import "./toggle.css"

const MODE_CONFIGS: Record<DataSourceMode, { icon: typeof Database; label: string; description: string; colorClass: string }> = {
  mock: { icon: TestTube2, label: 'Mock', description: 'Static test data', colorClass: 'dst-icon-purple' },
  local: { icon: Database, label: 'Local', description: 'Local Supabase', colorClass: 'dst-icon-blue' },
  dev: { icon: Server, label: 'Dev', description: 'Preview environment', colorClass: 'dst-icon-green' },
  uat: { icon: Building2, label: 'UAT', description: 'Main branch', colorClass: 'dst-icon-amber' },
  production: { icon: Globe, label: 'Production', description: 'Release branch', colorClass: 'dst-icon-red' },
}

export const DataSourceToggleUnstyled = memo(function DataSourceToggleUnstyled() {
  const { selectedSources, toggleSource, canShowToggle, isProductionReadOnly } = useDataSource()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!canShowToggle) {
    return null
  }

  return (
    <div className="dst-container">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="dst-header"
      >
        <div className="dst-header-content">
          <span>Data Sources</span>
          <span className="dst-badge">Internal</span>
        </div>
        <ChevronDown className={`dst-chevron ${isExpanded ? 'dst-chevron-expanded' : ''}`} />
      </button>
      
      {isExpanded && (
        <ul className="dst-list">
          {Object.entries(MODE_CONFIGS).map(([key, config]) => {
            const Icon = config.icon
            const isSelected = selectedSources.includes(key as DataSourceMode)
            const isDisabled = isProductionReadOnly && key === 'production'
            
            return (
              <li key={key}>
                <button
                  onClick={() => toggleSource(key as DataSourceMode)}
                  disabled={isDisabled}
                  className="dst-item-button"
                  title={isDisabled ? 'Production is read-only' : undefined}
                >
                  <Icon className={`dst-icon ${isSelected ? config.colorClass : ''}`} />
                  <div className="dst-item-content">
                    <div className="dst-item-label">{config.label}</div>
                    <div className="dst-item-description">{config.description}</div>
                  </div>
                  {isSelected && <Check className="dst-check-icon" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      
      {selectedSources.length > 1 && (
        <div className="dst-footer">
          <span className="dst-footer-text">
            {selectedSources.length} selected
          </span>
        </div>
      )}
    </div>
  )
})
