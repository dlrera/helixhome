'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Wrench,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Package,
  Home,
  Droplets,
  Zap,
  Building,
  Trees,
  CheckCircle,
  Info
} from 'lucide-react'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'
import ApplyTemplateModal from './apply-template-modal'

// Category icons mapping
const categoryIcons: Record<string, any> = {
  APPLIANCE: Package,
  HVAC: Home,
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  STRUCTURAL: Building,
  OUTDOOR: Trees,
  OTHER: Wrench
}

// Difficulty colors
const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  PROFESSIONAL: 'bg-red-100 text-red-800'
}

interface TemplateDetailsDrawerProps {
  templateId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId?: string
  isApplied?: boolean
}

export default function TemplateDetailsDrawer({
  templateId,
  open,
  onOpenChange,
  assetId,
  isApplied = false
}: TemplateDetailsDrawerProps) {
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Fetch template details
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null
      const response = await fetch(`/api/templates/${templateId}`)
      if (!response.ok) throw new Error('Failed to fetch template')
      return response.json()
    },
    enabled: !!templateId && open
  })

  const handleApplyClick = () => {
    if (assetId) {
      setShowApplyModal(true)
    } else {
      // Redirect to assets page with template ID
      window.location.href = `/assets?applyTemplate=${templateId}`
    }
  }

  const handleApplySuccess = () => {
    setShowApplyModal(false)
    onOpenChange(false)
    // Refresh the page to show updated state
    window.location.reload()
  }

  if (!templateId) return null

  const Icon = template ? categoryIcons[template.category] : Wrench

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {isLoading ? (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle>Loading...</SheetTitle>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </SheetHeader>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle>Error</SheetTitle>
              </SheetHeader>
              <div className="text-center py-8">
                <p className="text-red-600">Failed to load template details</p>
              </div>
            </div>
          ) : template ? (
            <>
              <SheetHeader>
                <div className="flex items-start gap-3">
                  <Icon className="h-6 w-6 text-[#216093] mt-1" />
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{template.name}</SheetTitle>
                    <SheetDescription className="mt-1">
                      {template.description}
                    </SheetDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Badge variant="secondary">
                    {formatFrequency(template.defaultFrequency)}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(template.estimatedDurationMinutes)}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={difficultyColors[template.difficulty]}
                  >
                    {template.difficulty.toLowerCase()}
                  </Badge>
                  {isApplied && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                <div className="space-y-6 pr-4">
                  {/* Instructions */}
                  {template.instructions && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Instructions
                      </h3>
                      <div className="space-y-2">
                        {Array.isArray(template.instructions) ? (
                          template.instructions.map((step: string, index: number) => (
                            <div key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#216093] text-white text-xs flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="text-sm text-gray-600">{step}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">{template.instructions}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Required Tools */}
                  {template.requiredTools && template.requiredTools.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Required Tools
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {template.requiredTools.map((tool: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Precautions */}
                  {template.safetyPrecautions && template.safetyPrecautions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        Safety Precautions
                      </h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <ul className="space-y-1">
                          {template.safetyPrecautions.map((precaution: string, index: number) => (
                            <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{precaution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Default Frequency:</span>
                        <span className="font-medium">{formatFrequency(template.defaultFrequency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Duration:</span>
                        <span className="font-medium">{formatDuration(template.estimatedDurationMinutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty Level:</span>
                        <span className="font-medium">{template.difficulty.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{template.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <SheetFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  className={`${isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-[#216093] hover:bg-[#1a4d75]'}`}
                  onClick={handleApplyClick}
                  disabled={isApplied}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Applied
                    </>
                  ) : (
                    'Apply Template'
                  )}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Apply Template Modal */}
      {showApplyModal && template && assetId && (
        <ApplyTemplateModal
          template={template}
          assetId={assetId}
          assetName="Asset"
          open={showApplyModal}
          onOpenChange={setShowApplyModal}
        />
      )}
    </>
  )
}