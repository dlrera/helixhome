'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Wrench,
  Package,
  Home,
  Droplets,
  Zap,
  Building,
  Trees,
  FileStack,
  ChevronRight,
  Thermometer,
  Calendar,
  ArrowLeft,
  Loader2,
  PlayCircle,
} from 'lucide-react'
import { AssetCategory, Difficulty } from '@prisma/client'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'
import type { TemplatePackDetails, PackTemplate } from '@/types/templates'
import TemplateDetailsDrawer from './template-details-drawer'
import ApplyPackModal from './apply-pack-modal'

// Category icons mapping
const categoryIcons: Record<
  AssetCategory,
  React.ComponentType<{ className?: string }>
> = {
  APPLIANCE: Package,
  HVAC: Home,
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  STRUCTURAL: Building,
  OUTDOOR: Trees,
  OTHER: Wrench,
}

// Difficulty colors
const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  PROFESSIONAL: 'bg-red-100 text-red-800',
}

// Season badges
const seasonColors: Record<string, string> = {
  Spring: 'bg-green-100 text-green-800',
  Summer: 'bg-yellow-100 text-yellow-800',
  Fall: 'bg-orange-100 text-orange-800',
  Winter: 'bg-blue-100 text-blue-800',
}

interface TemplatePackDetailsProps {
  packId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TemplatePackDetailsSheet({
  packId,
  open,
  onOpenChange,
}: TemplatePackDetailsProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null
  )
  const [showApplyAllModal, setShowApplyAllModal] = useState(false)

  // Fetch pack details with templates
  const {
    data: pack,
    isLoading,
    error,
  } = useQuery<TemplatePackDetails>({
    queryKey: ['templatePack', packId],
    queryFn: async () => {
      if (!packId) return null
      const response = await fetch(`/api/templates/packs/${packId}`)
      if (!response.ok) throw new Error('Failed to fetch pack details')
      return response.json()
    },
    enabled: !!packId && open,
  })

  const handleApplyTemplate = (templateId: string) => {
    setLoadingTemplateId(templateId)
    window.location.href = `/assets?applyTemplate=${templateId}`
  }

  if (!packId) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px]">
          {isLoading ? (
            <div className="space-y-4">
              <SheetHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </SheetHeader>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle>Error</SheetTitle>
              </SheetHeader>
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load pack details</p>
              </div>
            </div>
          ) : pack ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onOpenChange(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <div className="p-2 bg-[#216093]/10 rounded-lg">
                    <FileStack className="h-5 w-5 text-[#216093]" />
                  </div>
                </div>
                <SheetTitle className="text-xl">{pack.name}</SheetTitle>
                <SheetDescription>{pack.description}</SheetDescription>

                {/* Pack Meta Info */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className="bg-[#216093]/10 text-[#216093]"
                  >
                    <FileStack className="h-3.5 w-3.5 mr-1" />
                    {pack.templateCount} templates
                  </Badge>

                  {pack.applicableClimateZones.length > 0 && (
                    <Badge variant="secondary">
                      <Thermometer className="h-3.5 w-3.5 mr-1" />
                      {pack.applicableClimateZones.join(', ')}
                    </Badge>
                  )}

                  {(pack.minHomeAge || pack.maxHomeAge) && (
                    <Badge variant="secondary">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {pack.minHomeAge && pack.maxHomeAge
                        ? `${pack.minHomeAge}-${pack.maxHomeAge} years`
                        : pack.minHomeAge
                          ? `${pack.minHomeAge}+ years`
                          : `Up to ${pack.maxHomeAge} years`}
                    </Badge>
                  )}
                </div>

                {/* Pack Tags */}
                {pack.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pack.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Apply All Button */}
                {pack.templates.length > 0 && (
                  <Button
                    className="w-full mt-4 bg-[#216093] hover:bg-[#1a4d75]"
                    onClick={() => setShowApplyAllModal(true)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Apply All {pack.templateCount} Templates
                  </Button>
                )}
              </SheetHeader>

              <Separator className="my-4" />

              {/* Templates List */}
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                    Templates in this Pack
                  </h3>

                  {pack.templates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No templates in this pack yet.
                    </div>
                  ) : (
                    pack.templates.map((template, index) => (
                      <TemplateListItem
                        key={template.id}
                        template={template}
                        index={index}
                        onViewDetails={() => setSelectedTemplateId(template.id)}
                        onApply={() => handleApplyTemplate(template.id)}
                        isLoading={loadingTemplateId === template.id}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Template Details Drawer */}
      {selectedTemplateId && (
        <TemplateDetailsDrawer
          templateId={selectedTemplateId}
          open={!!selectedTemplateId}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedTemplateId(null)
          }}
        />
      )}

      {/* Apply All Modal */}
      {pack && (
        <ApplyPackModal
          packId={pack.id}
          packName={pack.name}
          templateCount={pack.templateCount}
          open={showApplyAllModal}
          onOpenChange={setShowApplyAllModal}
        />
      )}
    </>
  )
}

// Sub-component for template list item
interface TemplateListItemProps {
  template: PackTemplate
  index: number
  onViewDetails: () => void
  onApply: () => void
  isLoading: boolean
}

function TemplateListItem({
  template,
  index,
  onViewDetails,
  onApply,
  isLoading,
}: TemplateListItemProps) {
  const Icon = categoryIcons[template.category]

  return (
    <div
      className="p-4 rounded-lg border bg-white hover:border-[#216093]/30 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-left-2"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'backwards',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#216093]/10 rounded-lg flex-shrink-0">
          <Icon className="h-5 w-5 text-[#216093]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">
                {template.name}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                {template.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {formatFrequency(template.defaultFrequency)}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(template.estimatedDurationMinutes)}
            </span>
            <Badge
              variant="secondary"
              className={`text-xs ${difficultyColors[template.difficulty]}`}
            >
              {template.difficulty.charAt(0) +
                template.difficulty.slice(1).toLowerCase()}
            </Badge>
            {template.season && (
              <Badge
                variant="secondary"
                className={`text-xs ${seasonColors[template.season] || 'bg-gray-100 text-gray-800'}`}
              >
                {template.season}
              </Badge>
            )}
          </div>

          {/* Template Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-gray-50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8"
          onClick={onViewDetails}
        >
          Details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
        <Button
          size="sm"
          className="text-xs h-8 bg-[#216093] hover:bg-[#1a4d75]"
          onClick={onApply}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>
    </div>
  )
}
