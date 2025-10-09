import { Frequency } from '@prisma/client'
import { addDays, addWeeks, addMonths, addYears } from 'date-fns'

/**
 * Calculate the next due date based on frequency
 * @param {Date} startDate - The starting date for calculation
 * @param {Frequency} frequency - The frequency enum (WEEKLY, MONTHLY, etc.)
 * @param {number} [customDays] - Number of days for CUSTOM frequency
 * @returns {Date} The calculated next due date
 * @throws {Error} If CUSTOM frequency is used without customDays
 * @example
 * // Monthly frequency
 * calculateNextDueDate(new Date('2024-01-01'), 'MONTHLY')
 * // Returns: 2024-02-01
 *
 * // Custom frequency
 * calculateNextDueDate(new Date('2024-01-01'), 'CUSTOM', 10)
 * // Returns: 2024-01-11
 */
export function calculateNextDueDate(
  startDate: Date,
  frequency: Frequency,
  customDays?: number
): Date {
  switch (frequency) {
    case 'WEEKLY':
      return addWeeks(startDate, 1)
    case 'BIWEEKLY':
      return addWeeks(startDate, 2)
    case 'MONTHLY':
      return addMonths(startDate, 1)
    case 'QUARTERLY':
      return addMonths(startDate, 3)
    case 'SEMIANNUAL':
      return addMonths(startDate, 6)
    case 'ANNUAL':
      return addYears(startDate, 1)
    case 'CUSTOM':
      if (!customDays) {
        throw new Error('Custom frequency requires customDays')
      }
      return addDays(startDate, customDays)
    default:
      throw new Error(`Unknown frequency: ${frequency}`)
  }
}

/**
 * Get the number of days for a frequency
 * @param {Frequency} frequency - The frequency enum value
 * @param {number} [customDays] - Number of days for CUSTOM frequency
 * @returns {number} The number of days representing the frequency
 * @example
 * getFrequencyDays('WEEKLY') // Returns: 7
 * getFrequencyDays('MONTHLY') // Returns: 30
 * getFrequencyDays('CUSTOM', 15) // Returns: 15
 */
export function getFrequencyDays(frequency: Frequency, customDays?: number): number {
  switch (frequency) {
    case 'WEEKLY':
      return 7
    case 'BIWEEKLY':
      return 14
    case 'MONTHLY':
      return 30
    case 'QUARTERLY':
      return 90
    case 'SEMIANNUAL':
      return 180
    case 'ANNUAL':
      return 365
    case 'CUSTOM':
      return customDays || 30
    default:
      return 30
  }
}

/**
 * Format frequency for display
 * @param {Frequency} frequency - The frequency enum value
 * @param {number} [customDays] - Number of days for CUSTOM frequency
 * @returns {string} Human-readable frequency string
 * @example
 * formatFrequency('WEEKLY') // Returns: "Weekly"
 * formatFrequency('CUSTOM', 14) // Returns: "Every 14 days"
 * formatFrequency('CUSTOM', 1) // Returns: "Daily"
 */
export function formatFrequency(frequency: Frequency, customDays?: number): string {
  switch (frequency) {
    case 'WEEKLY':
      return 'Weekly'
    case 'BIWEEKLY':
      return 'Every 2 weeks'
    case 'MONTHLY':
      return 'Monthly'
    case 'QUARTERLY':
      return 'Every 3 months'
    case 'SEMIANNUAL':
      return 'Every 6 months'
    case 'ANNUAL':
      return 'Annually'
    case 'CUSTOM':
      if (customDays === 1) return 'Daily'
      return `Every ${customDays} days`
    default:
      return frequency
  }
}

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Human-readable duration string
 * @example
 * formatDuration(30) // Returns: "30 min"
 * formatDuration(60) // Returns: "1 hr"
 * formatDuration(90) // Returns: "1 hr 30 min"
 * formatDuration(120) // Returns: "2 hrs"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }
  return `${hours} hr ${mins} min`
}

/**
 * Sort templates by relevance to an asset category
 * @param {any[]} templates - Array of template objects to sort
 * @param {string} assetCategory - The asset category to match against
 * @returns {any[]} Sorted array of templates
 * @description Sorts templates by:
 * 1. Exact category match
 * 2. Difficulty (easier first)
 * 3. Frequency (more frequent first)
 * 4. Alphabetically by name
 * @example
 * const sorted = sortByRelevance(templates, 'HVAC')
 * // Returns templates with HVAC category first, then sorted by difficulty
 */
export function sortByRelevance(templates: any[], assetCategory: string) {
  return templates.sort((a, b) => {
    // Exact category match comes first
    if (a.category === assetCategory && b.category !== assetCategory) return -1
    if (b.category === assetCategory && a.category !== assetCategory) return 1

    // Then sort by difficulty (easier first)
    const difficultyOrder: Record<string, number> = { 'EASY': 0, 'MODERATE': 1, 'HARD': 2, 'PROFESSIONAL': 3 }
    const diffA = difficultyOrder[a.difficulty] || 99
    const diffB = difficultyOrder[b.difficulty] || 99
    if (diffA !== diffB) return diffA - diffB

    // Then by frequency (more frequent first)
    const frequencyOrder: Record<string, number> = {
      'WEEKLY': 0,
      'BIWEEKLY': 1,
      'MONTHLY': 2,
      'QUARTERLY': 3,
      'SEMIANNUAL': 4,
      'ANNUAL': 5,
      'CUSTOM': 6
    }
    const freqA = frequencyOrder[a.defaultFrequency] || 99
    const freqB = frequencyOrder[b.defaultFrequency] || 99
    if (freqA !== freqB) return freqA - freqB

    // Finally by name
    return a.name.localeCompare(b.name)
  })
}