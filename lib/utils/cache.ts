/**
 * Simple in-memory cache for templates and other frequently accessed data
 * Provides TTL-based caching with automatic cleanup
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval (run every 5 minutes)
    this.startCleanup()
  }

  /**
   * Set a value in cache with optional TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if a key exists and is valid
   * @param key - Cache key
   */
  has(key: string): boolean {
    const value = this.get(key)
    return value !== null
  }

  /**
   * Delete a specific key from cache
   * @param key - Cache key
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Invalidate all entries matching a pattern
   * @param pattern - Pattern to match (e.g., 'templates:*')
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    ) // Run every 5 minutes
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Stop cleanup interval (for cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Create singleton instance
const cache = new MemoryCache()

// Export cache functions
export const templateCache = {
  /**
   * Get templates from cache or fetch them
   */
  async getTemplates<T = unknown>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 10 * 60 * 1000 // 10 minutes default
  ): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Invalidate template caches
   */
  invalidateTemplates(): void {
    cache.invalidatePattern('templates:*')
    cache.invalidatePattern('template:*')
    console.log('[Cache] Invalidated all template caches')
  },

  /**
   * Invalidate specific template
   */
  invalidateTemplate(templateId: string): void {
    cache.delete(`template:${templateId}`)
    cache.invalidatePattern('templates:*') // Also invalidate list caches
    console.log(`[Cache] Invalidated template: ${templateId}`)
  },

  /**
   * Get cache stats
   */
  getStats: () => cache.getStats(),

  /**
   * Clear all caches
   */
  clear: () => cache.clear(),
}

// Schedule cache functions
export const scheduleCache = {
  /**
   * Get schedules from cache or fetch them
   */
  async getSchedules<T = unknown>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Invalidate schedule caches
   */
  invalidateSchedules(): void {
    cache.invalidatePattern('schedules:*')
    cache.invalidatePattern('schedule:*')
    console.log('[Cache] Invalidated all schedule caches')
  },

  /**
   * Invalidate schedules for specific asset
   */
  invalidateAssetSchedules(assetId: string): void {
    cache.invalidatePattern(`schedules:*assetId=${assetId}*`)
    console.log(`[Cache] Invalidated schedules for asset: ${assetId}`)
  },

  /**
   * Clear all caches
   */
  clear: () => cache.clear(),
}

// Dashboard cache functions (PERFORMANCE OPTIMIZATION - Task 7a)
export const dashboardCache = {
  /**
   * Get dashboard analytics from cache or fetch
   */
  async getAnalytics<T = unknown>(
    userId: string,
    period: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const key = `dashboard:analytics:${userId}:${period}`
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Get cost summary from cache or fetch
   */
  async getCostSummary<T = unknown>(
    userId: string,
    fetcher: () => Promise<T>,
    startDate?: string,
    endDate?: string,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    const key = `dashboard:cost:${userId}:${startDate || 'current'}:${endDate || 'current'}`
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Get maintenance calendar from cache or fetch
   */
  async getCalendar<T = unknown>(
    userId: string,
    month: number,
    year: number,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    const key = `dashboard:calendar:${userId}:${year}-${month}`
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Get activity feed from cache or fetch
   */
  async getActivityFeed<T = unknown>(
    userId: string,
    limit: number,
    offset: number,
    fetcher: () => Promise<T>,
    ttl: number = 2 * 60 * 1000 // 2 minutes for activity feed
  ): Promise<T> {
    const key = `dashboard:activity:${userId}:${limit}:${offset}`
    const cached = cache.get<T>(key)
    if (cached) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    console.log(`[Cache] Miss for key: ${key}`)
    const data = await fetcher()
    cache.set(key, data, ttl)
    return data
  },

  /**
   * Invalidate all dashboard caches for a user
   */
  invalidateUser(userId: string): void {
    cache.invalidatePattern(`dashboard:*:${userId}:*`)
    console.log(`[Cache] Invalidated all dashboard caches for user: ${userId}`)
  },

  /**
   * Invalidate specific dashboard cache types
   */
  invalidateAnalytics(userId: string): void {
    cache.invalidatePattern(`dashboard:analytics:${userId}:*`)
  },

  invalidateCosts(userId: string): void {
    cache.invalidatePattern(`dashboard:cost:${userId}:*`)
  },

  invalidateCalendar(userId: string): void {
    cache.invalidatePattern(`dashboard:calendar:${userId}:*`)
  },

  invalidateActivity(userId: string): void {
    cache.invalidatePattern(`dashboard:activity:${userId}:*`)
  },

  /**
   * Clear all dashboard caches
   */
  clear: () => cache.invalidatePattern('dashboard:*'),
}

// Export the main cache instance for direct access if needed
export default cache
