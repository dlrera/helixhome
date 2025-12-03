import {
  Home,
  Package,
  CheckSquare,
  FileText,
  Settings,
  HelpCircle,
  User,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavSubItem = {
  label: string
  href: string
  disabled?: boolean
}

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
  disabled?: boolean
  subItems?: NavSubItem[]
}

export type UserMenuItem = {
  label: string
  href?: string
  icon: LucideIcon
  action?: 'signout'
  disabled?: boolean
}

export const primaryNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    subItems: [
      {
        label: 'Overview',
        href: '/dashboard',
      },
      {
        label: 'Cost Report',
        href: '/dashboard/costs',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
      },
    ],
  },
  {
    label: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: FileText,
  },
]

export const secondaryNavItems: NavItem[] = [
  // Reports hidden until feature is ready
  // {
  //   label: 'Reports',
  //   href: '/reports',
  //   icon: BarChart,
  // },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
]

export const userMenuItems: UserMenuItem[] = [
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Sign Out',
    icon: LogOut,
    action: 'signout',
  },
]
