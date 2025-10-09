'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavItems, secondaryNavItems } from '@/lib/config/navigation'
import { useIsDesktop } from '@/lib/hooks/use-media-query'
import { ChevronDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  isCollapsed: boolean
  isMobileOpen: boolean
  onMobileClose: () => void
  currentPath: string
}

export default function Sidebar({
  isCollapsed,
  isMobileOpen,
  onMobileClose,
  currentPath,
}: SidebarProps) {
  const isDesktop = useIsDesktop()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '/dashboard': true, // Dashboard submenu expanded by default
  })

  // Determine if sidebar should show labels
  const showLabels = isDesktop ? !isCollapsed : true

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }))
  }

  return (
    <TooltipProvider delayDuration={300}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30',
          'hidden lg:block',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <nav className="flex flex-col h-full py-4">
          {/* Primary Navigation */}
          <div className="flex-1 space-y-1 px-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const isExpanded = expandedItems[item.href]
              const hasSubItems = item.subItems && item.subItems.length > 0

              // For items with subitems, check if any subitem is active
              const hasActiveSubItem = hasSubItems && item.subItems?.some(
                (sub) => pathname === sub.href
              )

              const linkContent = hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.href)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full',
                    'hover:bg-gray-100',
                    (isActive || hasActiveSubItem) && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                    !(isActive || hasActiveSubItem) && 'text-gray-700',
                    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 ml-auto transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    'hover:bg-gray-100',
                    isActive && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                    !isActive && 'text-gray-700',
                    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )

              return (
                <div key={item.href}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    linkContent
                  )}

                  {/* Submenu items */}
                  {hasSubItems && !isCollapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'block px-3 py-1.5 text-sm rounded-md transition-colors',
                              'hover:bg-gray-100',
                              isSubActive && 'text-[#216093] font-medium bg-gray-100',
                              !isSubActive && 'text-gray-600',
                              subItem.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                            )}
                          >
                            {subItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="border-t border-gray-200 pt-4 space-y-1 px-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    'hover:bg-gray-100',
                    isActive && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                    !isActive && 'text-gray-700',
                    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              )

              return isCollapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.href}>{linkContent}</div>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 z-50 w-64',
          'lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col h-full py-4">
          {/* Primary Navigation */}
          <div className="flex-1 space-y-1 px-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const isExpanded = expandedItems[item.href]
              const hasSubItems = item.subItems && item.subItems.length > 0

              // For items with subitems, check if any subitem is active
              const hasActiveSubItem = hasSubItems && item.subItems?.some(
                (sub) => pathname === sub.href
              )

              return (
                <div key={item.href}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full',
                        'hover:bg-gray-100',
                        (isActive || hasActiveSubItem) && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                        !(isActive || hasActiveSubItem) && 'text-gray-700',
                        item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 ml-auto transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                        'hover:bg-gray-100',
                        isActive && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                        !isActive && 'text-gray-700',
                        item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Submenu items */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onMobileClose}
                            className={cn(
                              'block px-3 py-1.5 text-sm rounded-md transition-colors',
                              'hover:bg-gray-100',
                              isSubActive && 'text-[#216093] font-medium bg-gray-100',
                              !isSubActive && 'text-gray-600',
                              subItem.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                            )}
                          >
                            {subItem.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="border-t border-gray-200 pt-4 space-y-1 px-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    'hover:bg-gray-100',
                    isActive && 'bg-[#216093] text-white hover:bg-[#1a4d75]',
                    !isActive && 'text-gray-700',
                    item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
