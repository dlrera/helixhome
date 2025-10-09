'use client'

import * as React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ElementType
}

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-1 text-sm text-gray-600', className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const Icon = item.icon

            return (
              <React.Fragment key={index}>
                <li className="flex items-center">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="flex items-center hover:text-[#216093] transition-colors"
                    >
                      {Icon && <Icon className="mr-1 h-4 w-4" />}
                      <span className={cn(isLast && 'font-medium text-gray-900')}>
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <span className={cn('flex items-center', isLast && 'font-medium text-gray-900')}>
                      {Icon && <Icon className="mr-1 h-4 w-4" />}
                      {item.label}
                    </span>
                  )}
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="text-gray-400">
                    {separator || <ChevronRight className="h-4 w-4" />}
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'

export { Breadcrumb }