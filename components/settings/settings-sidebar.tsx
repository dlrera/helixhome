'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Settings, Bell, Home, User, Database } from 'lucide-react'
import { Card } from '@/components/ui/card'

const settingsNavItems = [
  {
    label: 'General',
    href: '/settings/general',
    icon: Settings,
    description: 'Theme and display preferences',
  },
  {
    label: 'My Home',
    href: '/settings/home',
    icon: Home,
    description: 'Property details and address',
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email and alert preferences',
  },
  {
    label: 'Account',
    href: '/settings/account',
    icon: User,
    description: 'Profile and security',
    disabled: true,
  },
  {
    label: 'Data',
    href: '/settings/data',
    icon: Database,
    description: 'Export and backup',
    disabled: true,
  },
]

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <Card className="p-2">
      <nav className="space-y-1">
        {settingsNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-md transition-colors min-h-[44px]',
                isActive && 'bg-[#216093] text-white',
                !isActive &&
                  !item.disabled &&
                  'hover:bg-gray-100 text-gray-700',
                item.disabled && 'opacity-50 cursor-not-allowed text-gray-400'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
              aria-disabled={item.disabled}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{item.label}</div>
                <div
                  className={cn(
                    'text-xs truncate',
                    isActive ? 'text-white/80' : 'text-gray-500'
                  )}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>
    </Card>
  )
}
