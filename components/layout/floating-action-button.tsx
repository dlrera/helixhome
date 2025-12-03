'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

// Routes where the FAB should be hidden
const HIDDEN_ROUTES = ['/settings', '/profile', '/auth']

export default function FloatingActionButton() {
  const pathname = usePathname()

  // Hide FAB on certain routes
  const shouldHide = HIDDEN_ROUTES.some((route) => pathname.startsWith(route))

  if (shouldHide) {
    return null
  }

  return (
    <Link href="/assets/new">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#216093] hover:bg-[#1a4d75] z-50"
        aria-label="Add new asset"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  )
}
