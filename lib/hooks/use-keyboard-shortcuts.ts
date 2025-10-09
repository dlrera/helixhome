'use client'

import { useEffect } from 'react'

type ShortcutHandler = (event: KeyboardEvent) => void

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  handler: ShortcutHandler
}

/**
 * Custom hook for global keyboard shortcuts
 * Handles Cmd/Ctrl key detection across platforms
 * Automatically cleans up event listeners on unmount
 *
 * @param shortcuts - Array of keyboard shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && keyMatch) {
          event.preventDefault()
          shortcut.handler(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Convenience hook for command palette shortcut (Cmd+K / Ctrl+K)
 *
 * @param onOpen - Callback when shortcut is triggered
 */
export function useCommandPaletteShortcut(onOpen: () => void) {
  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true, // Cmd on Mac
      handler: onOpen,
    },
    {
      key: 'k',
      ctrlKey: true, // Ctrl on Windows/Linux
      handler: onOpen,
    },
  ])
}

/**
 * Convenience hook for escape key handler
 *
 * @param onEscape - Callback when Escape is pressed
 */
export function useEscapeKey(onEscape: () => void) {
  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: onEscape,
    },
  ])
}
