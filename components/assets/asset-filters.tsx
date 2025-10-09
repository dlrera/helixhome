'use client'

import { AssetCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { getCategoryIcon, formatCategory } from '@/lib/utils/asset-helpers'

type AssetFiltersProps = {
  selectedCategory: AssetCategory | 'ALL'
  onCategoryChange: (category: AssetCategory | 'ALL') => void
}

const categories: (AssetCategory | 'ALL')[] = [
  'ALL',
  'HVAC',
  'APPLIANCE',
  'PLUMBING',
  'ELECTRICAL',
  'STRUCTURAL',
  'OUTDOOR',
  'OTHER'
]

export default function AssetFilters({ selectedCategory, onCategoryChange }: AssetFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map(category => {
        const Icon = category !== 'ALL' ? getCategoryIcon(category) : null
        const isSelected = selectedCategory === category

        return (
          <Button
            key={category}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="flex-shrink-0"
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {category === 'ALL' ? 'All' : formatCategory(category)}
          </Button>
        )
      })}
    </div>
  )
}
