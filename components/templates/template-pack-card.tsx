'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Package,
  Home,
  Droplets,
  Zap,
  Building,
  Trees,
  Wrench,
  ChevronRight,
  FileStack,
  Thermometer,
  Calendar,
} from 'lucide-react'
import { AssetCategory } from '@prisma/client'
import type { TemplatePack } from '@/types/templates'

// Category icons mapping
const categoryIcons: Record<
  AssetCategory | 'ALL',
  React.ComponentType<{ className?: string }>
> = {
  APPLIANCE: Package,
  HVAC: Home,
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  STRUCTURAL: Building,
  OUTDOOR: Trees,
  OTHER: Wrench,
  ALL: FileStack,
}

// Category display names
const categoryLabels: Record<AssetCategory, string> = {
  APPLIANCE: 'Appliances',
  HVAC: 'HVAC',
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  STRUCTURAL: 'Structural',
  OUTDOOR: 'Outdoor',
  OTHER: 'Other',
}

// Tag colors for visual variety
const tagColors = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
]

interface TemplatePackCardProps {
  pack: TemplatePack
  onViewDetails: (packId: string) => void
  animationDelay?: number
}

export default function TemplatePackCard({
  pack,
  onViewDetails,
  animationDelay = 0,
}: TemplatePackCardProps) {
  const Icon = pack.category ? categoryIcons[pack.category] : FileStack

  return (
    <Card
      className="relative h-full min-h-[280px] flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-br from-white to-gray-50/50 hover:border-[#216093]/30"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'backwards',
      }}
      onClick={() => onViewDetails(pack.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2.5 bg-[#216093]/10 rounded-[8px] group-hover:bg-[#216093]/20 transition-colors duration-300">
            <Icon className="h-6 w-6 text-[#216093] group-hover:scale-110 transition-transform duration-300" />
          </div>
          <Badge
            variant="secondary"
            className="bg-[#216093]/10 text-[#216093] font-medium"
          >
            <FileStack className="h-3.5 w-3.5 mr-1" />
            {pack.templateCount} templates
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-1">{pack.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {pack.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Category Badge */}
          {pack.category && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Category:</span>
              <Badge variant="outline" className="font-medium">
                {categoryLabels[pack.category]}
              </Badge>
            </div>
          )}

          {/* Climate Zones */}
          {pack.applicableClimateZones.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5" />
                Climate:
              </span>
              <span className="font-medium text-xs">
                {pack.applicableClimateZones.slice(0, 2).join(', ')}
                {pack.applicableClimateZones.length > 2 &&
                  ` +${pack.applicableClimateZones.length - 2}`}
              </span>
            </div>
          )}

          {/* Home Age Range */}
          {(pack.minHomeAge || pack.maxHomeAge) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Home Age:
              </span>
              <span className="font-medium text-xs">
                {pack.minHomeAge && pack.maxHomeAge
                  ? `${pack.minHomeAge}-${pack.maxHomeAge} years`
                  : pack.minHomeAge
                    ? `${pack.minHomeAge}+ years`
                    : `Up to ${pack.maxHomeAge} years`}
              </span>
            </div>
          )}

          {/* Tags */}
          {pack.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pack.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs ${tagColors[index % tagColors.length]}`}
                >
                  {tag}
                </Badge>
              ))}
              {pack.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-600"
                >
                  +{pack.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-[#216093]/5 text-[#216093] hover:text-[#1a4d75] min-h-[44px] transition-all duration-200 group/btn"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(pack.id)
            }}
          >
            <span>View Templates</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
