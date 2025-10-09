'use client'

import React, { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Frequency } from '@prisma/client'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'
import { useToast } from '@/hooks/use-toast'

interface ApplyTemplateModalProps {
  template: {
    id: string
    name: string
    description: string
    defaultFrequency: Frequency
    estimatedDurationMinutes: number
    difficulty: string
  }
  assetId: string
  assetName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ApplyTemplateModal({
  template,
  assetId,
  assetName,
  open,
  onOpenChange,
}: ApplyTemplateModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [frequency, setFrequency] = useState<Frequency>(template.defaultFrequency)
  const [customDays, setCustomDays] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, isLoading, onOpenChange])

  const handleApply = async () => {
    console.log('Applying template:', template.id, 'to asset:', assetId)
    setIsLoading(true)
    try {
      const body: any = {
        templateId: template.id,
        assetId: assetId,
        frequency: frequency,
      }

      if (frequency === 'CUSTOM' && customDays) {
        body.customFrequencyDays = parseInt(customDays)
      }

      console.log('Request body:', body)

      const response = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases with improved messages
        if (response.status === 409) {
          toast({
            title: '⚠️ Template Already Applied',
            description: (
              <div className="space-y-1">
                <p>This maintenance template is already active for {assetName}.</p>
                <p className="text-sm">You can manage it from the asset's Schedules tab.</p>
              </div>
            ),
            variant: 'destructive',
            className: 'border-yellow-500 bg-yellow-50',
          })
        } else if (response.status === 404) {
          toast({
            title: '❌ Not Found',
            description: (
              <div className="space-y-1">
                <p>The asset or template could not be found.</p>
                <p className="text-sm">Please refresh the page and try again.</p>
              </div>
            ),
            variant: 'destructive',
          })
        } else if (response.status === 401) {
          toast({
            title: '🔒 Session Expired',
            description: 'Your session has expired. Please sign in again to continue.',
            variant: 'destructive',
          })
          router.push('/auth/signin')
        } else if (response.status === 400) {
          toast({
            title: '❌ Invalid Request',
            description: data.error || 'The request contains invalid data. Please check your inputs and try again.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: '❌ Application Failed',
            description: data.error || 'Unable to apply the template. Please try again or contact support if the issue persists.',
            variant: 'destructive',
          })
        }
        setIsLoading(false)
        return
      }

      toast({
        title: '✅ Template Applied Successfully!',
        description: (
          <div className="space-y-1">
            <p>{template.name} has been scheduled for {assetName}.</p>
            <p className="text-sm text-gray-600">The first maintenance task has been created.</p>
          </div>
        ),
        className: 'border-green-500 bg-green-50',
      })

      onOpenChange(false)
      router.refresh()
      // Also refresh the page to show the new schedule
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      console.error('Error applying template:', error)
      toast({
        title: '🔌 Connection Error',
        description: (
          <div className="space-y-1">
            <p>Unable to connect to the server.</p>
            <p className="text-sm">Please check your internet connection and try again.</p>
          </div>
        ),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-orange-100 text-orange-800',
    PROFESSIONAL: 'bg-red-100 text-red-800',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <DialogTitle>Apply Maintenance Template</DialogTitle>
          <DialogDescription>
            Apply "{template.name}" to {assetName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <p className="text-sm text-gray-600">{template.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formatDuration(template.estimatedDurationMinutes)}</span>
              </div>
              <Badge
                variant="secondary"
                className={difficultyColors[template.difficulty]}
              >
                {template.difficulty.toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Maintenance Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as Frequency)}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="SEMIANNUAL">Semi-Annual</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Frequency Input */}
          {frequency === 'CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Frequency (days)</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Enter number of days"
              />
              <p className="text-xs text-gray-500">
                How often should this maintenance be performed (in days)?
              </p>
            </div>
          )}

          {/* Info Alert */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900">
              The first task will be created immediately with a due date based on your selected frequency.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isLoading || (frequency === 'CUSTOM' && !customDays)}
            className="bg-[#216093] hover:bg-[#1a4d75] min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}