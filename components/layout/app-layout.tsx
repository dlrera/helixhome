'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import TopBar from './top-bar'
import Sidebar from './sidebar'
import CommandPalette from './command-palette'
import FloatingActionButton from './floating-action-button'
import { useIsDesktop } from '@/lib/hooks/use-media-query'
import { useSidebarState } from '@/lib/hooks/use-sidebar-state'
import { useCommandPaletteShortcut } from '@/lib/hooks/use-keyboard-shortcuts'

interface AppLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const { isCollapsed, toggleSidebar } = useSidebarState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Handle command palette shortcut (Cmd+K / Ctrl+K)
  useCommandPaletteShortcut(() => setIsCommandPaletteOpen(true))

  // Handle sidebar toggle based on screen size
  const handleSidebarToggle = () => {
    if (isDesktop) {
      toggleSidebar()
    } else {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    }
  }

  // Close mobile sidebar when navigating
  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <TopBar
        onMenuClick={handleSidebarToggle}
        onCommandPaletteOpen={() => setIsCommandPaletteOpen(true)}
        user={user}
      />

      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isDesktop ? isCollapsed : false}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
          currentPath={pathname}
        />

        {/* Main Content */}
        <main
          id="main-content"
          className={`flex-1 transition-all duration-300 ${
            isDesktop && !isCollapsed ? 'lg:ml-64' : 'lg:ml-16'
          }`}
        >
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />

      {/* Floating Action Button (Mobile Only) */}
      {!isDesktop && <FloatingActionButton />}

      {/* Mobile Sidebar Overlay */}
      {!isDesktop && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleMobileSidebarClose}
        />
      )}
    </div>
  )
}
