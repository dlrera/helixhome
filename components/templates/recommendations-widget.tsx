'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  FileStack,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { PackRecommendation } from '@/types/templates'

interface RecommendationsWidgetProps {
  onViewPack?: (packId: string) => void
}

export default function RecommendationsWidget({
  onViewPack,
}: RecommendationsWidgetProps) {
  const [dismissedPacks, setDismissedPacks] = useState<Set<string>>(new Set())
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Fetch recommendations
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery<PackRecommendation[]>({
    queryKey: ['templateRecommendations'],
    queryFn: async () => {
      const response = await fetch('/api/templates/recommendations?limit=5')
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false,
  })

  // Filter out dismissed recommendations
  const visibleRecommendations = recommendations?.filter(
    (r) => !dismissedPacks.has(r.pack.id)
  )

  const handleDismiss = (packId: string) => {
    setDismissedPacks((prev) => new Set([...prev, packId]))
  }

  // Don't render if collapsed or no visible recommendations
  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="mb-4 text-[#216093] hover:text-[#1a4d75] hover:bg-[#216093]/10"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Show Recommendations
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Card className="mb-6 border-[#216093]/20 bg-gradient-to-r from-[#216093]/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#216093]" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[280px] p-4 rounded-lg border bg-white"
              >
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                Unable to load recommendations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-amber-700 hover:bg-amber-100"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!visibleRecommendations || visibleRecommendations.length === 0) {
    return null
  }

  return (
    <Card className="mb-6 border-[#216093]/20 bg-gradient-to-r from-[#216093]/5 via-[#57949A]/5 to-transparent overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#216093]/10 rounded-md">
              <Sparkles className="h-4 w-4 text-[#216093]" />
            </div>
            <CardTitle className="text-lg">Recommended for You</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Hide recommendations</span>
          </Button>
        </div>
        <CardDescription>
          Based on your home profile and assets, we think you&apos;ll find these
          helpful
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {visibleRecommendations.map((rec, index) => (
            <RecommendationCard
              key={rec.pack.id}
              recommendation={rec}
              index={index}
              onViewDetails={() => onViewPack?.(rec.pack.id)}
              onDismiss={() => handleDismiss(rec.pack.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface RecommendationCardProps {
  recommendation: PackRecommendation
  index: number
  onViewDetails: () => void
  onDismiss: () => void
}

function RecommendationCard({
  recommendation,
  index,
  onViewDetails,
  onDismiss,
}: RecommendationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyFirst = () => {
    if (recommendation.templates.length > 0) {
      setIsApplying(true)
      window.location.href = `/assets?applyTemplate=${recommendation.templates[0].id}`
    }
  }

  return (
    <div
      className="relative flex-shrink-0 w-[300px] p-4 rounded-lg border bg-white hover:border-[#216093]/30 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 group"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss()
        }}
        className={`absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Dismiss recommendation"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Pack info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-[#216093]/10 rounded-lg flex-shrink-0">
          <FileStack className="h-5 w-5 text-[#216093]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm line-clamp-1">
            {recommendation.pack.name}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
            {recommendation.pack.description}
          </p>
        </div>
      </div>

      {/* Reason badge */}
      <div className="mb-3">
        <Badge
          variant="secondary"
          className="text-xs bg-[#57949A]/10 text-[#57949A] font-normal"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {recommendation.reason}
        </Badge>
      </div>

      {/* Meta info */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-xs">
          <FileStack className="h-3 w-3 mr-1" />
          {recommendation.pack.templateCount} templates
        </Badge>
        {recommendation.pack.tags.length > 0 && (
          <Badge variant="outline" className="text-xs bg-gray-50">
            {recommendation.pack.tags[0]}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs hover:bg-gray-50"
          onClick={onViewDetails}
        >
          View Pack
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        {recommendation.templates.length > 0 && (
          <Button
            size="sm"
            className="flex-1 h-9 text-xs bg-[#216093] hover:bg-[#1a4d75]"
            onClick={handleApplyFirst}
            disabled={isApplying}
          >
            {isApplying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              'Quick Apply'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
