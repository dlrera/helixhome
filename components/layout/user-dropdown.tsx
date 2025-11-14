'use client'

import { signOut } from 'next-auth/react'
import { User as UserIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { userMenuItems } from '@/lib/config/navigation'
import Link from 'next/link'

interface UserDropdownProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const handleMenuItemClick = (item: typeof userMenuItems[0]) => {
    if (item.action === 'signout') {
      signOut({ callbackUrl: '/auth/signin' })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full min-w-[44px] min-h-[44px]" aria-label="User menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className="bg-[#216093] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuItems.map((item) => {
          const Icon = item.icon

          if (item.action === 'signout') {
            return (
              <DropdownMenuItem
                key={item.label}
                onClick={() => handleMenuItemClick(item)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          }

          if (item.disabled) {
            return (
              <DropdownMenuItem
                key={item.label}
                disabled
                className="cursor-not-allowed opacity-50"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          }

          return (
            <Link key={item.label} href={item.href || '#'}>
              <DropdownMenuItem className="cursor-pointer">
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            </Link>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
