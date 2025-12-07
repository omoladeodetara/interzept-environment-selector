/**
 * Data source configuration
 * Toggle between mock data, local DB, dev, UAT, and production environments
 */

'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type DataSourceMode = 'mock' | 'local' | 'dev' | 'uat' | 'production'

interface DataSourceContextType {
  mode: DataSourceMode
  setMode: (mode: DataSourceMode) => void
  useMockData: () => boolean
  useApiData: () => boolean
  getApiBaseUrl: () => string
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined)

// Environment-specific API URLs
const API_URLS: Record<Exclude<DataSourceMode, 'mock'>, string> = {
  local: 'http://127.0.0.1:55321',
  dev: process.env.NEXT_PUBLIC_DEV_API_URL || 'https://dev-api.lastprice.ai',
  uat: process.env.NEXT_PUBLIC_UAT_API_URL || 'https://uat-api.lastprice.ai',
  production: process.env.NEXT_PUBLIC_PROD_API_URL || 'https://api.lastprice.ai',
}

// Read initial mode from env or localStorage
function getInitialMode(): DataSourceMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dataSourceMode') as DataSourceMode | null
    if (stored && ['mock', 'local', 'dev', 'uat', 'production'].includes(stored)) {
      return stored
    }
  }
  return (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) || 'local'
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DataSourceMode>(getInitialMode)

  const setMode = (newMode: DataSourceMode) => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dataSourceMode', newMode)
    }
  }

  const getApiBaseUrl = (): string => {
    if (mode === 'mock') return ''
    return API_URLS[mode]
  }

  const value: DataSourceContextType = {
    mode,
    setMode,
    useMockData: () => mode === 'mock',
    useApiData: () => mode !== 'mock',
    getApiBaseUrl,
  }

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider')
  }
  return context
}

export function useMockData(): boolean {
  const { mode } = useDataSource()
  return mode === 'mock'
}

export function useApiData(): boolean {
  const { mode } = useDataSource()
  return mode !== 'mock'
}
