'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatFrequency, formatDuration } from '@/lib/utils/template-helpers'
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/asset-helpers'
import { AssetCategory, Frequency } from '@prisma/client'
import ApplyTemplateModal from '@/components/templates/apply-template-modal'
import { Loader2, Home } from 'lucide-react'

interface Asset {
  id: string
  name: string
  category: string
  modelNumber: string | null
}

// Special constant for whole-home tasks
const WHOLE_HOME_OPTION = {
  id: 'whole-home',
  name: 'Whole Home / General',
  category: 'HOME',
  modelNumber: null,
} as const

interface ApplyTemplateToAssetProps {
  assets: Asset[]
}

export default function ApplyTemplateToAsset({
  assets,
}: ApplyTemplateToAssetProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const templateId = searchParams.get('applyTemplate')

  const [isOpen, setIsOpen] = useState(false)
  const [template, setTemplate] = useState<{
    id: string
    name: string
    description: string
    defaultFrequency: Frequency
    estimatedDurationMinutes: number
    difficulty: string
  } | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTemplate(null)
    setSelectedAsset(null)
    // Remove query parameter
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('applyTemplate')
    const newUrl = newParams.toString() ? `/assets?${newParams}` : '/assets'
    router.push(newUrl)
  }, [searchParams, router])

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load template',
          variant: 'destructive',
        })
        handleClose()
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      })
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }, [templateId, toast, handleClose])

  useEffect(() => {
    if (templateId) {
      setIsOpen(true)
      fetchTemplate()
    }
  }, [templateId, fetchTemplate])

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsOpen(false)
    setShowApplyModal(true)
  }

  if (!templateId) return null

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-orange-100 text-orange-800',
    PROFESSIONAL: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Asset for Template</DialogTitle>
            <DialogDescription>
              Choose which asset should receive this maintenance template
            </DialogDescription>
          </DialogHeader>

          {template && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-base text-gray-900">
                {template.name}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {formatFrequency(template.defaultFrequency)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(template.estimatedDurationMinutes)}
                </Badge>
                {template.difficulty && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${difficultyColors[template.difficulty] || ''}`}
                  >
                    {template.difficulty.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {/* Whole Home Option - Always shown at top */}
              <Card
                className="p-4 cursor-pointer hover:bg-blue-50 transition-colors border-2 border-dashed border-blue-200 bg-blue-50/30"
                onClick={() => handleSelectAsset(WHOLE_HOME_OPTION as Asset)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Whole Home / General
                      </p>
                      <p className="text-sm text-blue-600">
                        For tasks not tied to a specific asset
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    HOME
                  </Badge>
                </div>
              </Card>

              {assets.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No other assets available</p>
                </div>
              ) : (
                assets.map((asset) => {
                  const Icon = getCategoryIcon(asset.category as AssetCategory)
                  const categoryColor = getCategoryColor(
                    asset.category as AssetCategory
                  )

                  return (
                    <Card
                      key={asset.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSelectAsset(asset)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            {asset.modelNumber && (
                              <p className="text-sm text-gray-500">
                                Model: {asset.modelNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className={categoryColor}>
                          {asset.category}
                        </Badge>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedAsset && template && (
        <ApplyTemplateModal
          template={template}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          open={showApplyModal}
          onOpenChange={setShowApplyModal}
        />
      )}
    </>
  )
}
