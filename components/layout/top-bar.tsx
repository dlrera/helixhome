'use client'

import { Bell, Menu, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import UserDropdown from './user-dropdown'
import { useState, useEffect } from 'react'

interface TopBarProps {
  onMenuClick: () => void
  onCommandPaletteOpen: () => void
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function TopBar({ onMenuClick, onCommandPaletteOpen, user }: TopBarProps) {
  const [notificationCount, setNotificationCount] = useState(0)

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/count')
        if (response.ok) {
          const data = await response.json()
          setNotificationCount(data.count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error)
      }
    }

    fetchNotificationCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotificationCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section: Menu + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#216093] rounded flex items-center justify-center">
              <span className="text-white font-black text-sm">H</span>
            </div>
            <span className="font-black text-xl text-[#216093] hidden sm:inline">
              HelixIntel
            </span>
          </Link>
        </div>

        {/* Right Section: Search + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommandPaletteOpen}
            aria-label="Search"
            className="hidden sm:flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Dropdown */}
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  )
}
