'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  formatCurrency as formatCurrencyUtil,
  formatDate as formatDateUtil,
  formatDateTime as formatDateTimeUtil,
  formatRelativeDate as formatRelativeDateUtil,
  getUserPreferences,
  type Currency,
  type DateFormat,
} from '@/lib/formatters'

const STORAGE_KEY = 'helix-user-preferences'

/**
 * Hook that provides formatting functions that automatically update
 * when user preferences change
 */
export function useFormatters() {
  const [mounted, setMounted] = useState(false)
  const [, setRefreshKey] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Listen for storage changes (in case preferences are updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRefreshKey((k) => k + 1)
      }
    }

    // Listen for custom preference change events (same tab)
    const handlePreferenceChange = () => {
      setRefreshKey((k) => k + 1)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('helix-preferences-changed', handlePreferenceChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'helix-preferences-changed',
        handlePreferenceChange
      )
    }
  }, [])

  const formatCurrency = useCallback(
    (amount: number | null | undefined, currency?: Currency) => {
      if (!mounted) return '-'
      return formatCurrencyUtil(amount, currency)
    },
    [mounted]
  )

  const formatDate = useCallback(
    (date: Date | string | null | undefined, format?: DateFormat) => {
      if (!mounted) return '-'
      return formatDateUtil(date, format)
    },
    [mounted]
  )

  const formatDateTime = useCallback(
    (date: Date | string | null | undefined, format?: DateFormat) => {
      if (!mounted) return '-'
      return formatDateTimeUtil(date, format)
    },
    [mounted]
  )

  const formatRelativeDate = useCallback(
    (date: Date | string | null | undefined, format?: DateFormat) => {
      if (!mounted) return '-'
      return formatRelativeDateUtil(date, format)
    },
    [mounted]
  )

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelativeDate,
    preferences: mounted ? getUserPreferences() : null,
    mounted,
  }
}

/**
 * Dispatch a custom event to notify other components that preferences have changed
 * Call this when saving preferences
 */
export function notifyPreferencesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('helix-preferences-changed'))
  }
}
