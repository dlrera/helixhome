'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/asset-helpers'
import { AssetCategory } from '@prisma/client'
import {
  Loader2,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  category: string
  modelNumber: string | null
}

interface ApplyResult {
  templateId: string
  templateName: string
  success: boolean
  error?: string
}

interface ApplyPackModalProps {
  packId: string
  packName: string
  templateCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ApplyPackModal({
  packId,
  packName,
  templateCount,
  open,
  onOpenChange,
}: ApplyPackModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [results, setResults] = useState<ApplyResult[] | null>(null)

  // Fetch user's assets when modal opens
  useEffect(() => {
    if (open) {
      setResults(null)
      fetchAssets()
    }
  }, [open])

  const fetchAssets = async () => {
    setIsLoadingAssets(true)
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data.assets || [])
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setIsLoadingAssets(false)
    }
  }

  const handleApplyToAsset = async (
    assetId: string | null,
    assetName: string
  ) => {
    setIsApplying(true)
    try {
      const response = await fetch(`/api/templates/packs/${packId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: assetId,
          isWholeHome: assetId === null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Failed to apply templates',
          variant: 'destructive',
        })
        setIsApplying(false)
        return
      }

      // Show results
      setResults(data.results)

      // Show success toast
      toast({
        title: `${data.successCount} of ${data.totalTemplates} Templates Applied`,
        description: (
          <div className="space-y-1">
            <p>
              {packName} templates applied to {assetName}.
            </p>
            {data.failCount > 0 && (
              <p className="text-sm text-amber-600">
                {data.failCount} template(s) were already applied or failed.
              </p>
            )}
          </div>
        ),
        className:
          data.failCount === 0
            ? 'border-green-500 bg-green-50'
            : 'border-amber-500 bg-amber-50',
      })
    } catch (error) {
      console.error('Error applying pack:', error)
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleClose = () => {
    if (results) {
      router.refresh()
    }
    setResults(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#216093]" />
            Apply All Templates
          </DialogTitle>
          <DialogDescription>
            Apply all {templateCount} templates from &quot;{packName}&quot; to
            an asset or your whole home.
          </DialogDescription>
        </DialogHeader>

        {/* Results View */}
        {results ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-sm">Application Results</h4>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {results.map((result) => (
                    <div
                      key={result.templateId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">
                          {result.templateName}
                        </span>
                      </div>
                      {!result.success && result.error && (
                        <span className="text-xs text-amber-600">
                          {result.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button
                onClick={handleClose}
                className="bg-[#216093] hover:bg-[#1a4d75]"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            {/* Asset Selection */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {/* Whole Home Option */}
              <Card
                className={`p-4 cursor-pointer transition-colors border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50 ${
                  isApplying ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleApplyToAsset(null, 'Whole Home')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Whole Home / General
                      </p>
                      <p className="text-sm text-blue-600">
                        Apply as one-time tasks not tied to assets
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

              {/* Loading State */}
              {isLoadingAssets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    No assets found. Use &quot;Whole Home&quot; or add assets
                    first.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-4">
                    Or apply to a specific asset:
                  </div>
                  {assets.map((asset) => {
                    const Icon = getCategoryIcon(
                      asset.category as AssetCategory
                    )
                    const categoryColor = getCategoryColor(
                      asset.category as AssetCategory
                    )

                    return (
                      <Card
                        key={asset.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isApplying ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        onClick={() => handleApplyToAsset(asset.id, asset.name)}
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
                  })}
                </>
              )}
            </div>

            {/* Applying State Overlay */}
            {isApplying && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#216093] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Applying {templateCount} templates...
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isApplying}
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
