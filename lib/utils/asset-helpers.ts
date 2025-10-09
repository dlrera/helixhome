import { AssetCategory } from '@prisma/client'
import {
  Refrigerator,
  Wind,
  Droplets,
  Zap,
  Home,
  Trees,
  Package
} from 'lucide-react'

export function getCategoryIcon(category: AssetCategory) {
  const icons = {
    APPLIANCE: Refrigerator,
    HVAC: Wind,
    PLUMBING: Droplets,
    ELECTRICAL: Zap,
    STRUCTURAL: Home,
    OUTDOOR: Trees,
    OTHER: Package,
  }
  return icons[category]
}

export function getCategoryColor(category: AssetCategory) {
  const colors = {
    APPLIANCE: 'bg-blue-100 text-blue-800',
    HVAC: 'bg-orange-100 text-orange-800',
    PLUMBING: 'bg-cyan-100 text-cyan-800',
    ELECTRICAL: 'bg-yellow-100 text-yellow-800',
    STRUCTURAL: 'bg-gray-100 text-gray-800',
    OUTDOOR: 'bg-green-100 text-green-800',
    OTHER: 'bg-purple-100 text-purple-800',
  }
  return colors[category]
}

export function formatCategory(category: AssetCategory) {
  return category.charAt(0) + category.slice(1).toLowerCase()
}
