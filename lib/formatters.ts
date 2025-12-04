import { CURRENCIES, DATE_FORMATS } from '@/lib/validation/settings'

// Storage key for user preferences (matches general-settings-form.tsx)
const STORAGE_KEY = 'helix-user-preferences'

export type Currency = (typeof CURRENCIES)[number]
export type DateFormat = (typeof DATE_FORMATS)[number]

interface UserPreferences {
  theme?: string
  compactMode?: boolean
  currency?: Currency
  dateFormat?: DateFormat
}

/**
 * Get user preferences from localStorage
 * Falls back to defaults if not found or on server
 */
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { currency: 'USD', dateFormat: 'MM/DD/YYYY' }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }

  return { currency: 'USD', dateFormat: 'MM/DD/YYYY' }
}

/**
 * Currency symbol mapping
 */
const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  CAD: 'CA$',
  AUD: 'A$',
}

/**
 * Format currency amount based on user preference
 * @param amount - The numeric amount to format
 * @param currency - Optional currency override (uses user preference if not provided)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency?: Currency
): string {
  if (amount === null || amount === undefined) {
    return '-'
  }

  const userCurrency = currency ?? getUserPreferences().currency ?? 'USD'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback if Intl fails
    const symbol = currencySymbols[userCurrency] || '$'
    return `${symbol}${amount.toFixed(2)}`
  }
}

/**
 * Format date based on user preference
 * @param date - The date to format (Date object or ISO string)
 * @param format - Optional format override (uses user preference if not provided)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format?: DateFormat
): string {
  if (!date) {
    return '-'
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  const userFormat = format ?? getUserPreferences().dateFormat ?? 'MM/DD/YYYY'

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')

  switch (userFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default:
      return `${month}/${day}/${year}`
  }
}

/**
 * Format date with time based on user preference
 * @param date - The date to format
 * @param format - Optional format override
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  format?: DateFormat
): string {
  if (!date) {
    return '-'
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  const formattedDate = formatDate(dateObj, format)
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${formattedDate} ${timeStr}`
}

/**
 * Format a relative date (e.g., "Today", "Tomorrow", "3 days ago")
 * Falls back to formatted date for dates outside the relative range
 * @param date - The date to format
 * @param format - Optional format override for fallback
 * @returns Relative or formatted date string
 */
export function formatRelativeDate(
  date: Date | string | null | undefined,
  format?: DateFormat
): string {
  if (!date) {
    return '-'
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(dateObj)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

  // For dates outside relative range, use formatted date
  return formatDate(dateObj, format)
}
