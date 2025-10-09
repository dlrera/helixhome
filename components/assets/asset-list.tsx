'use client'

import { useState, useMemo } from 'react'
import { AssetCategory } from '@prisma/client'
import AssetCard from './asset-card'
import AssetFilters from './asset-filters'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getCategoryIcon, getCategoryColor, formatCategory } from '@/lib/utils/asset-helpers'
import { useViewMode } from '@/lib/hooks/use-local-storage'

type Asset = {
  id: string
  name: string
  category: AssetCategory
  modelNumber: string | null
  photoUrl: string | null
  home: {
    id: string
    name: string
  }
  _count: {
    tasks: number
    recurringSchedules: number
  }
}

interface AssetListProps {
  initialAssets: Asset[]
}

export default function AssetList({ initialAssets }: AssetListProps) {
  const [assets] = useState(initialAssets)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Use custom hook for persistent view mode preference
  const [viewMode, setViewMode] = useViewMode('helix-assets-view-mode', 'grid')

  // Memoize filtered assets to avoid recalculation on every render
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory
      const matchesSearch = !searchQuery ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.modelNumber?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [assets, selectedCategory, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search and View Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search assets by name or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <AssetFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Assets Grid or List */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No assets found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or add a new asset</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map(asset => {
            const Icon = getCategoryIcon(asset.category)
            const categoryColor = getCategoryColor(asset.category)
            return (
              <Link key={asset.id} href={`/assets/${asset.id}`} prefetch={true}>
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{asset.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`${categoryColor} text-xs`}>
                          {formatCategory(asset.category)}
                        </Badge>
                        {asset.modelNumber && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 truncate">Model: {asset.modelNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-600">{asset.home.name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>{asset._count.tasks} tasks</span>
                        <span>{asset._count.recurringSchedules} schedules</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
