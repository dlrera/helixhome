/**
 * Unit Tests for Template Helper Functions
 * Tests all template-related utility functions
 */

import { describe, it, expect } from '@playwright/test'
import {
  calculateNextDueDate,
  getFrequencyDays,
  formatFrequency,
  formatDuration,
  sortByRelevance
} from '@/lib/utils/template-helpers'
import { Frequency, AssetCategory } from '@prisma/client'

describe('Template Helper Functions', () => {

  describe('calculateNextDueDate', () => {
    it('should calculate weekly due date correctly', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.WEEKLY)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-08')
    })

    it('should calculate biweekly due date correctly', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.BIWEEKLY)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-15')
    })

    it('should calculate monthly due date correctly', () => {
      const startDate = new Date('2024-01-15')
      const result = calculateNextDueDate(startDate, Frequency.MONTHLY)
      expect(result.toISOString().split('T')[0]).toBe('2024-02-15')
    })

    it('should calculate quarterly due date correctly', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.QUARTERLY)
      expect(result.toISOString().split('T')[0]).toBe('2024-04-01')
    })

    it('should calculate semiannual due date correctly', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.SEMIANNUAL)
      expect(result.toISOString().split('T')[0]).toBe('2024-07-01')
    })

    it('should calculate annual due date correctly', () => {
      const startDate = new Date('2024-02-29') // Leap year
      const result = calculateNextDueDate(startDate, Frequency.ANNUAL)
      expect(result.toISOString().split('T')[0]).toBe('2025-02-28') // Non-leap year
    })

    it('should handle custom frequency with specific days', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.CUSTOM, 10)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-11')
    })

    it('should default to 30 days for custom frequency without days specified', () => {
      const startDate = new Date('2024-01-01')
      const result = calculateNextDueDate(startDate, Frequency.CUSTOM)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-31')
    })

    it('should handle month end edge cases', () => {
      const startDate = new Date('2024-01-31')
      const result = calculateNextDueDate(startDate, Frequency.MONTHLY)
      // February doesn't have 31 days, should adjust to last day
      expect(result.toISOString().split('T')[0]).toBe('2024-02-29') // 2024 is leap year
    })
  })

  describe('getFrequencyDays', () => {
    it('should return correct days for each frequency', () => {
      expect(getFrequencyDays(Frequency.WEEKLY)).toBe(7)
      expect(getFrequencyDays(Frequency.BIWEEKLY)).toBe(14)
      expect(getFrequencyDays(Frequency.MONTHLY)).toBe(30)
      expect(getFrequencyDays(Frequency.QUARTERLY)).toBe(90)
      expect(getFrequencyDays(Frequency.SEMIANNUAL)).toBe(180)
      expect(getFrequencyDays(Frequency.ANNUAL)).toBe(365)
    })

    it('should handle custom frequency', () => {
      expect(getFrequencyDays(Frequency.CUSTOM, 15)).toBe(15)
      expect(getFrequencyDays(Frequency.CUSTOM)).toBe(30) // Default
    })
  })

  describe('formatFrequency', () => {
    it('should format frequency values correctly', () => {
      expect(formatFrequency(Frequency.WEEKLY)).toBe('Weekly')
      expect(formatFrequency(Frequency.BIWEEKLY)).toBe('Bi-weekly')
      expect(formatFrequency(Frequency.MONTHLY)).toBe('Monthly')
      expect(formatFrequency(Frequency.QUARTERLY)).toBe('Quarterly')
      expect(formatFrequency(Frequency.SEMIANNUAL)).toBe('Semi-annual')
      expect(formatFrequency(Frequency.ANNUAL)).toBe('Annual')
      expect(formatFrequency(Frequency.CUSTOM)).toBe('Custom')
    })

    it('should handle invalid frequency gracefully', () => {
      expect(formatFrequency('INVALID' as Frequency)).toBe('Custom')
    })
  })

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30 min')
      expect(formatDuration(45)).toBe('45 min')
      expect(formatDuration(59)).toBe('59 min')
    })

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1 hour')
      expect(formatDuration(90)).toBe('1.5 hours')
      expect(formatDuration(120)).toBe('2 hours')
      expect(formatDuration(150)).toBe('2.5 hours')
    })

    it('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0 min')
      expect(formatDuration(1)).toBe('1 min')
      expect(formatDuration(61)).toBe('1 hour')
    })

    it('should handle null/undefined', () => {
      expect(formatDuration(null as any)).toBe('N/A')
      expect(formatDuration(undefined as any)).toBe('N/A')
    })
  })

  describe('sortByRelevance', () => {
    const templates = [
      { id: '1', category: AssetCategory.HVAC, name: 'HVAC Template', appliedCount: 5 },
      { id: '2', category: AssetCategory.PLUMBING, name: 'Plumbing Template', appliedCount: 3 },
      { id: '3', category: AssetCategory.HVAC, name: 'Another HVAC', appliedCount: 8 },
      { id: '4', category: AssetCategory.APPLIANCE, name: 'Appliance Template', appliedCount: 10 },
      { id: '5', category: AssetCategory.OTHER, name: 'Generic Template', appliedCount: 1 }
    ]

    it('should prioritize exact category matches', () => {
      const sorted = sortByRelevance(templates as any, AssetCategory.HVAC)
      expect(sorted[0].category).toBe(AssetCategory.HVAC)
      expect(sorted[1].category).toBe(AssetCategory.HVAC)
    })

    it('should sort by applied count within same category', () => {
      const sorted = sortByRelevance(templates as any, AssetCategory.HVAC)
      // Among HVAC templates, higher appliedCount should come first
      expect(sorted[0].id).toBe('3') // appliedCount: 8
      expect(sorted[1].id).toBe('1') // appliedCount: 5
    })

    it('should place OTHER category at the end', () => {
      const sorted = sortByRelevance(templates as any, AssetCategory.APPLIANCE)
      expect(sorted[sorted.length - 1].category).toBe(AssetCategory.OTHER)
    })

    it('should handle empty array', () => {
      const sorted = sortByRelevance([], AssetCategory.HVAC)
      expect(sorted).toEqual([])
    })

    it('should handle templates without appliedCount', () => {
      const templatesWithoutCount = [
        { id: '1', category: AssetCategory.HVAC, name: 'Template 1' },
        { id: '2', category: AssetCategory.HVAC, name: 'Template 2' }
      ]
      const sorted = sortByRelevance(templatesWithoutCount as any, AssetCategory.HVAC)
      expect(sorted.length).toBe(2)
      expect(sorted[0].category).toBe(AssetCategory.HVAC)
    })
  })
})