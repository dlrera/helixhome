'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive breakpoint detection
 * Returns true when viewport matches the media query
 * Server-safe: returns false during SSR
 *
 * @param query - Media query string (e.g., "(min-width: 1024px)")
 * @returns boolean indicating if media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [query])

  return matches
}

/**
 * Convenience hook for desktop breakpoint (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Convenience hook for mobile breakpoint (< 1024px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}
