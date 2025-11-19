/**
 * API Performance Monitoring Utility
 * Logs API request timing for performance investigation
 */

type TimingMetrics = {
  endpoint: string
  duration: number
  timestamp: string
  cached?: boolean
}

export function logApiTiming(
  endpoint: string,
  duration: number,
  cached = false
) {
  const metrics: TimingMetrics = {
    endpoint,
    duration,
    timestamp: new Date().toISOString(),
    cached,
  }

  if (duration > 300) {
    console.warn(
      `[API PERF] SLOW REQUEST (${duration}ms):`,
      endpoint,
      cached ? '(CACHED)' : ''
    )
  } else {
    console.log(`[API PERF] ${duration}ms:`, endpoint, cached ? '(CACHED)' : '')
  }

  return metrics
}

/**
 * Wrapper to measure API handler execution time
 */
export async function withTiming<T>(
  endpoint: string,
  handler: () => Promise<T>
): Promise<T> {
  const start = Date.now()

  try {
    const result = await handler()
    const duration = Date.now() - start
    logApiTiming(endpoint, duration)
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`[API PERF] ERROR after ${duration}ms:`, endpoint, error)
    throw error
  }
}
