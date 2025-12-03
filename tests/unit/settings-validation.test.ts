/**
 * Unit Tests for Settings Validation Schemas
 *
 * Run with: npx tsx tests/unit/settings-validation.test.ts
 *
 * Tests the Zod validation schemas for:
 * - updateHomeDetailsSchema
 * - updateUserPreferencesSchema
 * - addressSchema
 */

import { z } from 'zod'
import {
  updateHomeDetailsSchema,
  updateUserPreferencesSchema,
  addressSchema,
  PROPERTY_TYPES,
  CLIMATE_ZONES,
  THEMES,
  CURRENCIES,
  DATE_FORMATS,
} from '../../lib/validation/settings'

// Simple test utilities
let passCount = 0
let failCount = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passCount++
  } catch (error) {
    console.log(`  ✗ ${name}`)
    console.log(`    Error: ${error instanceof Error ? error.message : error}`)
    failCount++
  }
}

function describe(name: string, fn: () => void) {
  console.log(`\n${name}`)
  fn()
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`)
      }
    },
    toBeTrue() {
      if (actual !== true) {
        throw new Error(`Expected true but got ${actual}`)
      }
    },
    toBeFalse() {
      if (actual !== false) {
        throw new Error(`Expected false but got ${actual}`)
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${actual}`)
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined but got undefined`)
      }
    },
    toContain(substring: string) {
      if (typeof actual !== 'string' || !actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`)
      }
    },
    toHaveLength(length: number) {
      if (!Array.isArray(actual) || actual.length !== length) {
        throw new Error(
          `Expected array of length ${length} but got ${Array.isArray(actual) ? actual.length : 'non-array'}`
        )
      }
    },
  }
}

// ============================================
// Address Schema Tests
// ============================================
describe('addressSchema', () => {
  test('should validate a complete address', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    })
    expect(result.success).toBeTrue()
  })

  test('should accept empty strings as null', () => {
    const result = addressSchema.safeParse({
      street: '',
      city: '',
      state: '',
      zip: '',
    })
    expect(result.success).toBeTrue()
    if (result.success) {
      expect(result.data.street).toBeNull()
      expect(result.data.city).toBeNull()
    }
  })

  test('should accept undefined fields', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
    })
    expect(result.success).toBeTrue()
  })

  test('should accept null fields', () => {
    const result = addressSchema.safeParse({
      street: null,
      city: null,
      state: null,
      zip: null,
    })
    expect(result.success).toBeTrue()
  })
})

// ============================================
// Update Home Details Schema Tests
// ============================================
describe('updateHomeDetailsSchema', () => {
  test('should validate a complete home details input', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Family Home',
      address: {
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      propertyType: 'Single Family',
      yearBuilt: 1995,
      sizeSqFt: 2400,
      climateZone: 'Hot-Humid',
    })
    expect(result.success).toBeTrue()
  })

  test('should require homeId', () => {
    const result = updateHomeDetailsSchema.safeParse({
      name: 'My Home',
    })
    expect(result.success).toBeFalse()
  })

  test('should require non-empty homeId', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: '',
      name: 'My Home',
    })
    expect(result.success).toBeFalse()
  })

  test('should require name', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
    })
    expect(result.success).toBeFalse()
  })

  test('should require non-empty name', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: '',
    })
    expect(result.success).toBeFalse()
  })

  test('should enforce name max length (100 chars)', () => {
    const longName = 'a'.repeat(101)
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: longName,
    })
    expect(result.success).toBeFalse()
  })

  test('should accept valid property types', () => {
    for (const propertyType of PROPERTY_TYPES) {
      const result = updateHomeDetailsSchema.safeParse({
        homeId: 'home-123',
        name: 'My Home',
        propertyType,
      })
      expect(result.success).toBeTrue()
    }
  })

  test('should reject invalid property types', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      propertyType: 'Invalid Type',
    })
    expect(result.success).toBeFalse()
  })

  test('should validate yearBuilt range (1800 to current year)', () => {
    const currentYear = new Date().getFullYear()

    // Valid years
    const validResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      yearBuilt: 2000,
    })
    expect(validResult.success).toBeTrue()

    // Too old
    const tooOldResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      yearBuilt: 1799,
    })
    expect(tooOldResult.success).toBeFalse()

    // Future year
    const futureResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      yearBuilt: currentYear + 1,
    })
    expect(futureResult.success).toBeFalse()
  })

  test('should validate sizeSqFt range (1 to 100000)', () => {
    // Valid size
    const validResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      sizeSqFt: 2400,
    })
    expect(validResult.success).toBeTrue()

    // Zero size
    const zeroResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      sizeSqFt: 0,
    })
    expect(zeroResult.success).toBeFalse()

    // Too large
    const tooLargeResult = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      sizeSqFt: 100001,
    })
    expect(tooLargeResult.success).toBeFalse()
  })

  test('should accept valid climate zones', () => {
    for (const climateZone of CLIMATE_ZONES) {
      const result = updateHomeDetailsSchema.safeParse({
        homeId: 'home-123',
        name: 'My Home',
        climateZone,
      })
      expect(result.success).toBeTrue()
    }
  })

  test('should accept null/undefined for optional fields', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      propertyType: null,
      yearBuilt: null,
      sizeSqFt: null,
      climateZone: null,
    })
    expect(result.success).toBeTrue()
  })

  test('should transform string numbers to integers', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      yearBuilt: '2000',
      sizeSqFt: '2400',
    })
    expect(result.success).toBeTrue()
    if (result.success) {
      expect(result.data.yearBuilt).toBe(2000)
      expect(result.data.sizeSqFt).toBe(2400)
    }
  })

  test('should transform empty strings to null', () => {
    const result = updateHomeDetailsSchema.safeParse({
      homeId: 'home-123',
      name: 'My Home',
      yearBuilt: '',
      sizeSqFt: '',
    })
    expect(result.success).toBeTrue()
    if (result.success) {
      expect(result.data.yearBuilt).toBeNull()
      expect(result.data.sizeSqFt).toBeNull()
    }
  })
})

// ============================================
// Update User Preferences Schema Tests
// ============================================
describe('updateUserPreferencesSchema', () => {
  test('should validate a complete preferences input', () => {
    const result = updateUserPreferencesSchema.safeParse({
      theme: 'dark',
      compactMode: true,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      pushNotifications: false,
      taskReminders: true,
      maintenanceAlerts: true,
      weeklyDigest: false,
    })
    expect(result.success).toBeTrue()
  })

  test('should accept empty object', () => {
    const result = updateUserPreferencesSchema.safeParse({})
    expect(result.success).toBeTrue()
  })

  test('should accept valid theme values', () => {
    for (const theme of THEMES) {
      const result = updateUserPreferencesSchema.safeParse({ theme })
      expect(result.success).toBeTrue()
    }
  })

  test('should reject invalid theme values', () => {
    const result = updateUserPreferencesSchema.safeParse({ theme: 'purple' })
    expect(result.success).toBeFalse()
  })

  test('should accept valid currency values', () => {
    for (const currency of CURRENCIES) {
      const result = updateUserPreferencesSchema.safeParse({ currency })
      expect(result.success).toBeTrue()
    }
  })

  test('should reject invalid currency values', () => {
    const result = updateUserPreferencesSchema.safeParse({ currency: 'YEN' })
    expect(result.success).toBeFalse()
  })

  test('should accept valid date format values', () => {
    for (const dateFormat of DATE_FORMATS) {
      const result = updateUserPreferencesSchema.safeParse({ dateFormat })
      expect(result.success).toBeTrue()
    }
  })

  test('should reject invalid date format values', () => {
    const result = updateUserPreferencesSchema.safeParse({
      dateFormat: 'DD-MM-YYYY',
    })
    expect(result.success).toBeFalse()
  })

  test('should validate boolean fields', () => {
    const result = updateUserPreferencesSchema.safeParse({
      compactMode: true,
      emailNotifications: false,
      pushNotifications: true,
      taskReminders: false,
      maintenanceAlerts: true,
      weeklyDigest: false,
    })
    expect(result.success).toBeTrue()
  })

  test('should reject non-boolean for boolean fields', () => {
    const result = updateUserPreferencesSchema.safeParse({
      compactMode: 'yes',
    })
    expect(result.success).toBeFalse()
  })
})

// ============================================
// Constant Value Tests
// ============================================
describe('Constants', () => {
  test('should have correct property types', () => {
    expect(PROPERTY_TYPES).toHaveLength(7)
    expect(PROPERTY_TYPES.includes('Single Family')).toBeTrue()
    expect(PROPERTY_TYPES.includes('Condo')).toBeTrue()
    expect(PROPERTY_TYPES.includes('Townhouse')).toBeTrue()
  })

  test('should have correct climate zones', () => {
    expect(CLIMATE_ZONES).toHaveLength(7)
    expect(CLIMATE_ZONES.includes('Hot-Humid')).toBeTrue()
    expect(CLIMATE_ZONES.includes('Cold')).toBeTrue()
  })

  test('should have correct theme options', () => {
    expect(THEMES).toHaveLength(3)
    expect(THEMES.includes('light')).toBeTrue()
    expect(THEMES.includes('dark')).toBeTrue()
    expect(THEMES.includes('system')).toBeTrue()
  })

  test('should have correct currency options', () => {
    expect(CURRENCIES).toHaveLength(5)
    expect(CURRENCIES.includes('USD')).toBeTrue()
    expect(CURRENCIES.includes('EUR')).toBeTrue()
  })

  test('should have correct date format options', () => {
    expect(DATE_FORMATS).toHaveLength(3)
    expect(DATE_FORMATS.includes('MM/DD/YYYY')).toBeTrue()
    expect(DATE_FORMATS.includes('DD/MM/YYYY')).toBeTrue()
    expect(DATE_FORMATS.includes('YYYY-MM-DD')).toBeTrue()
  })
})

// Run all tests and print summary
console.log('\n========================================')
console.log('Settings Validation Schema Unit Tests')
console.log('========================================')

// The tests are executed by the describe/test functions above
// Print summary
console.log('\n========================================')
console.log(`Results: ${passCount} passed, ${failCount} failed`)
console.log('========================================')

if (failCount > 0) {
  process.exit(1)
}
