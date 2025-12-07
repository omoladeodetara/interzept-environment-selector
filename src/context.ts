/**
 * Data source configuration
 * Toggle between mock data, local DB, dev, UAT, and production environments
 * Supports selecting multiple data sources to merge
 */

'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, createElement } from 'react'

export type DataSourceMode = 'mock' | 'local' | 'dev' | 'uat' | 'production'

interface DataSourceContextType {
  selectedSources: DataSourceMode[]
  toggleSource: (mode: DataSourceMode) => void
  setSelectedSources: (modes: DataSourceMode[]) => void
  useMockData: () => boolean
  getApiBaseUrls: () => string[]
  primarySource: DataSourceMode
  isProductionReadOnly: boolean
  canShowToggle: boolean
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

// Environment-specific API URLs
// API base URLs must be configured via environment variables.
// Replace 'https://your-api-domain.com' with your actual API endpoints.
const API_URLS: Record<Exclude<DataSourceMode, 'mock'>, string> = {
  local: process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://127.0.0.1:55321',
  dev: process.env.NEXT_PUBLIC_DEV_API_URL || 'https://your-api-domain.com',
  uat: process.env.NEXT_PUBLIC_UAT_API_URL || 'https://your-api-domain.com',
  production: process.env.NEXT_PUBLIC_PROD_API_URL || 'https://your-api-domain.com',
}

// Storage key for persistence
const STORAGE_KEY = 'dataSourceModes'

// Read initial selected sources from localStorage
function getInitialSources(): DataSourceMode[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as DataSourceMode[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Fall through to default
    }
  }
  return [(process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) || 'local']
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [selectedSources, setSelectedSourcesState] = useState<DataSourceMode[]>(getInitialSources)

  const setSelectedSources = useCallback((modes: DataSourceMode[]) => {
    setSelectedSourcesState(modes)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modes))
    }
  }, [])

  const toggleSource = useCallback((mode: DataSourceMode) => {
    setSelectedSourcesState(prev => {
      const newSources = prev.includes(mode)
        ? prev.filter((s) => s !== mode)
        : [...prev, mode]
      
      // Ensure at least one source is selected
      if (newSources.length === 0) {
        return prev
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSources))
      }
      return newSources
    })
  }, [])

  const getApiBaseUrls = useCallback((): string[] => {
    return selectedSources
      .filter((mode) => mode !== 'mock')
      .map((mode) => API_URLS[mode as Exclude<DataSourceMode, 'mock'>])
  }, [selectedSources])

  const isMockMode = useCallback(() => selectedSources.includes('mock'), [selectedSources])

  const isProductionReadOnly = process.env.NEXT_PUBLIC_PRODUCTION_READ_ONLY === 'true'
  
  // Hide toggle ONLY in production deployment
  // Show by default in development and preview environments
  const isProductionDeployment = 
    process.env.NODE_ENV === 'production' && 
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  
  // Show toggle by default unless explicitly disabled OR in production deployment
  const canShowToggle = 
    process.env.NEXT_PUBLIC_ENABLE_DATA_SOURCE_TOGGLE !== 'false' && 
    !isProductionDeployment

  const contextValue = useMemo<DataSourceContextType>(() => ({
    selectedSources,
    toggleSource,
    setSelectedSources,
    useMockData: isMockMode,
    getApiBaseUrls,
    primarySource: selectedSources[0] || 'local',
    isProductionReadOnly,
    canShowToggle,
  }), [selectedSources, toggleSource, setSelectedSources, isMockMode, getApiBaseUrls, isProductionReadOnly, canShowToggle])

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
