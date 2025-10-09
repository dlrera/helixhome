'use client'

import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'helix-sidebar-collapsed'

/**
 * Custom hook for sidebar collapse state management
 * Persists state to localStorage for consistency across sessions
 * Server-safe: defaults to collapsed state during SSR
 *
 * @param defaultCollapsed - Default collapsed state (default: true)
 * @returns [isCollapsed, toggleSidebar, setIsCollapsed]
 */
export function useSidebarState(defaultCollapsed = true) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
    setIsInitialized(true)
  }, [])

  // Persist to localStorage on change (only after initialization)
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') {
      return
    }

    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed, isInitialized])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  return {
    isCollapsed,
    toggleSidebar,
    setIsCollapsed,
    isInitialized, // Expose for conditional rendering to avoid hydration mismatch
  }
}
