'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state with localStorage persistence
 *
 * @param key - The localStorage key
 * @param defaultValue - The default value if nothing is stored
 * @returns [value, setValue] tuple similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Always initialize with default value to prevent hydration mismatch
  const [value, setValue] = useState<T>(defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage after mount
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) {
      return
    }

    try {
      const item = localStorage.getItem(key)
      if (item) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    setIsInitialized(true)
  }, [key, isInitialized])

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) {
      return
    }

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, value, isInitialized])

  return [value, setValue]
}

/**
 * Convenience hook for view mode preference (grid/list)
 */
export function useViewMode(
  storageKey: string = 'view-mode',
  defaultMode: 'grid' | 'list' = 'grid'
): ['grid' | 'list', React.Dispatch<React.SetStateAction<'grid' | 'list'>>] {
  return useLocalStorage<'grid' | 'list'>(storageKey, defaultMode)
}