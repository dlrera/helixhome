'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Frequency } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'
import { formatFrequency } from '@/lib/utils/template-helpers'

interface EditFrequencyModalProps {
  schedule: {
    id: string
    frequency: Frequency
    customFrequencyDays?: number | null
    template: {
      name: string
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export default function EditFrequencyModal({
  schedule,
  open,
  onOpenChange,
  onUpdate,
}: EditFrequencyModalProps) {
  const { toast } = useToast()
  const [frequency, setFrequency] = useState<Frequency>(schedule.frequency)
  const [customDays, setCustomDays] = useState<string>(
    schedule.customFrequencyDays?.toString() || ''
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const body: any = { frequency }

      if (frequency === 'CUSTOM') {
        const days = parseInt(customDays)
        if (!days || days < 1 || days > 365) {
          toast({
            title: 'Invalid custom frequency',
            description: 'Please enter a value between 1 and 365 days',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
        body.customFrequencyDays = days
      }

      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to update schedule')
      }

      toast({
        title: 'Frequency Updated',
        description: `${schedule.template.name} schedule has been updated to ${formatFrequency(frequency)}`,
      })

      onOpenChange(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating frequency:', error)
      toast({
        title: 'Error',
        description: 'Failed to update schedule frequency',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Schedule Frequency</DialogTitle>
          <DialogDescription>
            Update how often "{schedule.template.name}" maintenance should be performed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as Frequency)}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BIWEEKLY">Every 2 Weeks</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly (3 months)</SelectItem>
                <SelectItem value="SEMIANNUAL">Semi-Annual (6 months)</SelectItem>
                <SelectItem value="ANNUAL">Annual (Yearly)</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Custom Frequency (days)</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Enter number of days"
              />
              <p className="text-xs text-muted-foreground">
                Enter how many days between each occurrence (1-365)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Frequency'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}