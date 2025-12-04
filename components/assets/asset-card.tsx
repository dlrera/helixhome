'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AssetCategory } from '@prisma/client'
import {
  getCategoryIcon,
  getCategoryColor,
  formatCategory,
} from '@/lib/utils/asset-helpers'

type AssetCardProps = {
  asset: {
    id: string
    name: string
    category: AssetCategory
    location?: string | null
    modelNumber: string | null
    photoUrl: string | null
    home: {
      name: string
    }
    _count: {
      tasks: number
      recurringSchedules: number
    }
  }
  /** Mark as priority for above-fold images (first 2-3 in grid) */
  priority?: boolean
}

export default function AssetCard({ asset, priority = false }: AssetCardProps) {
  const Icon = getCategoryIcon(asset.category)
  const categoryColor = getCategoryColor(asset.category)

  return (
    <Link href={`/assets/${asset.id}`} prefetch={true}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-video relative bg-gray-100 rounded-md overflow-hidden">
            {asset.photoUrl ? (
              <Image
                src={asset.photoUrl}
                alt={asset.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{asset.name}</h3>
            <Badge
              variant="secondary"
              className={`${categoryColor} flex-shrink-0`}
            >
              {formatCategory(asset.category)}
            </Badge>
          </div>
          {asset.location && (
            <p className="text-sm text-gray-600 line-clamp-1">
              {asset.location}
            </p>
          )}
          {asset.modelNumber && (
            <p className="text-sm text-gray-600 line-clamp-1">
              Model: {asset.modelNumber}
            </p>
          )}
          <p className="text-xs text-gray-500">{asset.home.name}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between text-xs text-gray-500">
          <span>{asset._count.tasks} tasks</span>
          <span>{asset._count.recurringSchedules} schedules</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
