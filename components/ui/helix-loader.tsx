import React from 'react'
import { cn } from '@/lib/utils'

interface HelixLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HelixLoader({ size = 'md', className }: HelixLoaderProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn('relative', sizes[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-[#216093]/20"></div>

      {/* Spinning arc */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#216093] border-r-[#216093] animate-spin"></div>

      {/* Inner pulse dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 rounded-full bg-[#216093] animate-pulse"></div>
      </div>
    </div>
  )
}

interface PulsingDotsProps {
  className?: string
}

export function PulsingDots({ className }: PulsingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="w-2 h-2 rounded-full bg-[#216093] animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-[#216093] animate-pulse" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-[#216093] animate-pulse" style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}
