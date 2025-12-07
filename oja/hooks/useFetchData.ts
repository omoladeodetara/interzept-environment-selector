"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMockData, useDataSource } from '@/lib/data-source'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseFetchDataOptions {
  /** Query parameters to append to the URL */
  params?: Record<string, string>
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean
  /** Deduplicate merged results by this key (default: 'id') */
  dedupeKey?: string
}

/**
 * Centralized data fetching hook that integrates with the data source selector.
 * 
 * - If mock mode is selected, returns mock data immediately.
 * - If real sources are selected, fetches from all selected APIs in parallel and merges results.
 * - Handles loading, error states, and refetching.
 * 
 * @param endpoint - The API endpoint path (e.g., '/api/customers')
 * @param mockData - The mock data to return when mock mode is enabled
 * @param options - Additional options (params, immediate, dedupeKey)
 * 
 * @example
 * const { data, loading, error, refetch } = useFetchData('/api/customers', MOCK_CUSTOMERS)
 */
export function useFetchData<T extends Record<string, unknown>[]>(
  endpoint: string,
  mockData: T,
  options: UseFetchDataOptions = {}
): FetchState<T> {
  const { params = {}, immediate = true, dedupeKey = 'id' } = options
  
  const isMockMode = useMockData()
  const { getApiBaseUrls, selectedSources } = useDataSource()
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!isMockMode && immediate)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // If only mock is selected, return mock data
    if (isMockMode && selectedSources.length === 1 && selectedSources[0] === 'mock') {
      setData(mockData)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const urls = getApiBaseUrls()
      
      // Build query string from params
      const queryString = new URLSearchParams(params).toString()
      const queryPart = queryString ? `?${queryString}` : ''

      // Fetch from all selected sources in parallel
      const results = await Promise.allSettled(
        urls.map(async (baseUrl) => {
          const url = `${baseUrl}${endpoint}${queryPart}`
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${baseUrl}: ${response.statusText}`)
          }
          return response.json()
        })
      )

      // Merge successful results
      const allData: T[number][] = []
      const seenIds = new Set<string>()

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const items = Array.isArray(result.value) ? result.value : [result.value]
          for (const item of items) {
            const id = item[dedupeKey]
            if (id && !seenIds.has(String(id))) {
              seenIds.add(String(id))
              allData.push(item)
            } else if (!id) {
              // No dedupeKey, just add
              allData.push(item)
            }
          }
        }
      }

      // If we got no data from APIs but mock is also selected, include mock data
      if (allData.length === 0 && selectedSources.includes('mock')) {
        setData(mockData)
      } else {
        setData(allData as T)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      // Fall back to mock data on error if mock is selected
      if (selectedSources.includes('mock')) {
        setData(mockData)
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, mockData, params, isMockMode, getApiBaseUrls, selectedSources, dedupeKey])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Simplified version for single-object responses (not arrays)
 */
export function useFetchSingleData<T extends Record<string, unknown>>(
  endpoint: string,
  mockData: T,
  options: Omit<UseFetchDataOptions, 'dedupeKey'> = {}
): FetchState<T> {
  const { params = {}, immediate = true } = options
  
  const isMockMode = useMockData()
  const { getApiBaseUrls, selectedSources } = useDataSource()
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!isMockMode && immediate)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (isMockMode && selectedSources.length === 1 && selectedSources[0] === 'mock') {
      setData(mockData)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const urls = getApiBaseUrls()
      const queryString = new URLSearchParams(params).toString()
      const queryPart = queryString ? `?${queryString}` : ''

      // For single data, just use the primary (first) source
      const url = `${urls[0]}${endpoint}${queryPart}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      
      setData(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      if (selectedSources.includes('mock')) {
        setData(mockData)
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, mockData, params, isMockMode, getApiBaseUrls, selectedSources])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}
