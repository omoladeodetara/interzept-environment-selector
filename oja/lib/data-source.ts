/**
 * Data source configuration
 * Toggle between mock data, local DB, dev, UAT, and production environments
 * Supports selecting multiple data sources to merge
 */

'use client'

import { createContext, useContext, useState, ReactNode, createElement } from 'react'

export type DataSourceMode = 'mock' | 'local' | 'dev' | 'uat' | 'production'

interface DataSourceContextType {
  selectedSources: DataSourceMode[]
  toggleSource: (mode: DataSourceMode) => void
  setSelectedSources: (modes: DataSourceMode[]) => void
  useMockData: () => boolean
  getApiBaseUrls: () => string[]
  primarySource: DataSourceMode
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

// Environment-specific API URLs
const API_URLS: Record<Exclude<DataSourceMode, 'mock'>, string> = {
  local: 'http://127.0.0.1:55321',
  dev: process.env.NEXT_PUBLIC_DEV_API_URL || 'https://dev-api.lastprice.ai',
  uat: process.env.NEXT_PUBLIC_UAT_API_URL || 'https://uat-api.lastprice.ai',
  production: process.env.NEXT_PUBLIC_PROD_API_URL || 'https://api.lastprice.ai',
}

// Read initial selected sources from localStorage
function getInitialSources(): DataSourceMode[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dataSourceModes')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DataSourceMode[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch (e) {
        // Fall through to default
      }
    }
  }
  return [(process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) || 'local']
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [selectedSources, setSelectedSourcesState] = useState<DataSourceMode[]>(getInitialSources)

  const setSelectedSources = (modes: DataSourceMode[]) => {
    setSelectedSourcesState(modes)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dataSourceModes', JSON.stringify(modes))
    }
  }

  const toggleSource = (mode: DataSourceMode) => {
    const newSources = selectedSources.includes(mode)
      ? selectedSources.filter((s) => s !== mode)
      : [...selectedSources, mode]
    
    // Ensure at least one source is selected
    if (newSources.length === 0) {
      return
    }
    
    setSelectedSources(newSources)
  }

  const getApiBaseUrls = (): string[] => {
    return selectedSources
      .filter((mode) => mode !== 'mock')
      .map((mode) => API_URLS[mode as Exclude<DataSourceMode, 'mock'>])
  }

  const contextValue: DataSourceContextType = {
    selectedSources,
    toggleSource,
    setSelectedSources,
    useMockData: () => selectedSources.includes('mock'),
    getApiBaseUrls,
    primarySource: selectedSources[0] || 'local',
  }

  return createElement(DataSourceContext.Provider, { value: contextValue }, children)
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider')
  }
  return context
}

export function useMockData(): boolean {
  const { useMockData } = useDataSource()
  return useMockData()
}

export function useApiData(): boolean {
  const { selectedSources } = useDataSource()
  return selectedSources.some((mode) => mode !== 'mock')
}
